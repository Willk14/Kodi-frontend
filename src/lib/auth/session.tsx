"use client";

import type { Session } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createApiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { createEndpoints, type Endpoints } from "@/lib/api/endpoints";
import type { MembershipContext, Role } from "@/lib/api/types";
import { config, missingConfig } from "@/lib/config";
import { resolveMembership } from "./membership";
import { getSupabase } from "./supabase";

export type AuthState =
  | { status: "loading" }
  | { status: "misconfigured"; missing: string[] }
  | { status: "signed_out"; notice?: string }
  | { status: "resolving" }
  | { status: "no_membership" }
  | { status: "error"; message: string }
  | { status: "ready"; role: Role; context: MembershipContext };

interface AuthContextValue {
  state: AuthState;
  api: Endpoints;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  retry: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const expiredRef = useRef(false);

  const handleUnauthorized = useCallback(() => {
    if (expiredRef.current) return;
    expiredRef.current = true;
    void getSupabase()?.auth.signOut();
    setState({ status: "signed_out", notice: "Your session expired. Please sign in again." });
  }, []);

  const api = useMemo(
    () =>
      createEndpoints(
        createApiClient({
          baseUrl: config.apiBaseUrl,
          getToken: async () => {
            const { data } = (await getSupabase()?.auth.getSession()) ?? { data: { session: null } };
            return data.session?.access_token ?? null;
          },
          onUnauthorized: handleUnauthorized,
        }),
      ),
    [handleUnauthorized],
  );

  useEffect(() => {
    const missing = missingConfig();
    const supabase = getSupabase();
    if (missing.length || !supabase) {
      setState({ status: "misconfigured", missing });
      return;
    }

    let cancelled = false;

    async function resolve(session: Session | null) {
      if (!session) {
        setState((s) => (s.status === "signed_out" && s.notice ? s : { status: "signed_out" }));
        return;
      }
      expiredRef.current = false;
      setState({ status: "resolving" });
      try {
        const m = await resolveMembership(api);
        if (cancelled) return;
        setState(m ? { status: "ready", role: m.role, context: m.context } : { status: "no_membership" });
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) return; // handleUnauthorized already ran
        setState({ status: "error", message: err instanceof Error ? err.message : "Unexpected error." });
      }
    }

    void supabase.auth.getSession().then(({ data }) => resolve(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED") return; // role does not change on refresh
      if (event === "SIGNED_OUT") {
        setState((s) => (s.status === "signed_out" && s.notice ? s : { status: "signed_out" }));
        return;
      }
      void resolve(session);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [api, attempt]);

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = getSupabase();
    if (!supabase) return "Sign-in is not configured.";
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? "Sign-in failed. Check your email and password." : null;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const supabase = getSupabase();
    if (!supabase) return "Registration is not configured.";
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    });
    if (!error) return null;
    if (error.message.toLowerCase().includes("already registered")) {
      return "An account with this email may already exist. Try signing in.";
    }
    return "Could not create the account. Check the details and try again.";
  }, []);

  const signOut = useCallback(async () => {
    await getSupabase()?.auth.signOut();
    setState({ status: "signed_out" });
  }, []);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const value = useMemo(() => ({ state, api, signIn, signUp, signOut, retry }), [state, api, signIn, signUp, signOut, retry]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

export function useReadyAuth() {
  const { state, api, signOut } = useAuth();
  if (state.status !== "ready") throw new Error("useReadyAuth used before authorization");
  return { role: state.role, context: state.context, api, signOut };
}
