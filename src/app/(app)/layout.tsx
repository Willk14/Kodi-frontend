"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import {
  AuthErrorScreen,
  LoadingScreen,
  MisconfiguredScreen,
  NoMembershipScreen,
} from "@/components/AuthScreens";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth/session";

export default function AuthedLayout({ children }: { children: ReactNode }) {
  const { state } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (state.status === "signed_out") router.replace("/login");
  }, [state.status, router]);

  switch (state.status) {
    case "loading":
    case "signed_out":
      return <LoadingScreen />;
    case "resolving":
      return <LoadingScreen label="Checking your KodiLedger access…" />;
    case "misconfigured":
      return <MisconfiguredScreen missing={state.missing} />;
    case "no_membership":
      return <NoMembershipScreen />;
    case "error":
      return <AuthErrorScreen message={state.message} />;
    case "ready":
      return <AppShell>{children}</AppShell>;
  }
}
