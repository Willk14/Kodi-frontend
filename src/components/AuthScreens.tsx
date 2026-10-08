"use client";

import { useAuth } from "@/lib/auth/session";

function Centered({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="center-screen">
      <div className="panel center-card">
        <h1>{title}</h1>
        {children}
      </div>
    </div>
  );
}

export function LoadingScreen({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="center-screen" role="status" aria-live="polite">
      <p className="muted">{label}</p>
    </div>
  );
}

export function MisconfiguredScreen({ missing }: { missing: string[] }) {
  return (
    <Centered title="Frontend not configured">
      <p>These public environment variables are not set:</p>
      <ul>
        {missing.map((m) => (
          <li key={m}>
            <code>{m}</code>
          </li>
        ))}
      </ul>
      <p className="muted">See .env.example and the README.</p>
    </Centered>
  );
}

export function NoMembershipScreen() {
  const { signOut } = useAuth();
  return (
    <Centered title="No KodiLedger access">
      <p>
        You are signed in, but your identity is not linked to exactly one active KodiLedger membership. Account setup
        is done by KodiLedger — this app cannot create or switch memberships.
      </p>
      <p className="muted">Contact your KodiLedger administrator, then sign in again.</p>
      <button type="button" className="btn" onClick={() => void signOut()}>
        Sign out
      </button>
    </Centered>
  );
}

export function AuthErrorScreen({ message }: { message: string }) {
  const { retry, signOut } = useAuth();
  return (
    <Centered title="Could not load your workspace">
      <p role="alert">{message}</p>
      <div className="row">
        <button type="button" className="btn btn-primary" onClick={retry}>
          Try again
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => void signOut()}>
          Sign out
        </button>
      </div>
    </Centered>
  );
}
