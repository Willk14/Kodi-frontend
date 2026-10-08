"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { LoadingScreen, MisconfiguredScreen } from "@/components/AuthScreens";
import { useAuth } from "@/lib/auth/session";

export default function LoginPage() {
  const { state, signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (state.status === "ready" || state.status === "no_membership" || state.status === "error") router.replace("/");
  }, [state.status, router]);

  if (state.status === "misconfigured") return <MisconfiguredScreen missing={state.missing} />;
  if (state.status === "loading" || state.status === "resolving") return <LoadingScreen />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const err = await signIn(email.trim(), password);
    if (err) setError(err);
    setBusy(false);
  }

  return (
    <div className="center-screen">
      <form className="panel center-card form" onSubmit={submit}>
        <h1>Sign in to KodiLedger</h1>
        {state.status === "signed_out" && state.notice && (
          <p role="status" className="form-error">
            {state.notice}
          </p>
        )}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="help">Accounts are provisioned by KodiLedger. Registration is not available here.</p>
      </form>
    </div>
  );
}
