"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { LoadingScreen, MisconfiguredScreen } from "@/components/AuthScreens";
import { useAuth } from "@/lib/auth/session";

export default function LoginPage() {
  const { state, signIn, signUp, requestPasswordReset } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [requestedRole, setRequestedRole] = useState<"LANDLORD" | "CARETAKER">("LANDLORD");
  const [busy, setBusy] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);

  useEffect(() => {
    if (state.status === "ready" || state.status === "no_membership" || state.status === "error") router.replace("/");
  }, [state.status, router]);

  if (state.status === "misconfigured") return <MisconfiguredScreen missing={state.missing} />;
  if (state.status === "loading" || state.status === "resolving") return <LoadingScreen />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (registering) {
        const err = await signUp(email.trim(), password, requestedRole);
        if (err) setError(err);
        else {
          setNotice(`Account created. Confirm your email. Your requested role is ${requestedRole === "LANDLORD" ? "landlord" : "caretaker"}; a KodiLedger administrator must link your account and assign its membership before you can access the app.`);
          setRegistering(false);
        }
      } else {
        const err = await signIn(email.trim(), password);
        if (err) setError(err);
      }
    } catch {
      setError("Authentication request failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function sendPasswordReset() {
    setResetBusy(true);
    setError(null);
    setNotice(null);
    try {
      const result = await requestPasswordReset(email.trim());
      if (result) setError(result);
      else setNotice("If an account exists for that email, a password reset link has been sent.");
    } finally {
      setResetBusy(false);
    }
  }

  return (
    <div className="center-screen">
      <form className="panel center-card form" onSubmit={submit}>
        <h1>{registering ? "Create a KodiLedger account" : "Sign in to KodiLedger"}</h1>
        {state.status === "signed_out" && state.notice && (
          <p role="status" className="form-error">
            {state.notice}
          </p>
        )}
        {notice && <p role="status" className="form-success">{notice}</p>}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        {registering && (
          <div className="field">
            <label htmlFor="requested-role">I am registering as</label>
            <select id="requested-role" value={requestedRole} onChange={(e) => setRequestedRole(e.target.value as "LANDLORD" | "CARETAKER")}>
              <option value="LANDLORD">Landlord</option>
              <option value="CARETAKER">Caretaker</option>
            </select>
          </div>
        )}
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete={registering ? "new-password" : "current-password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={registering ? 8 : undefined}
          />
        </div>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? (registering ? "Creating account..." : "Signing in...") : (registering ? "Create account" : "Sign in")}
        </button>
        {!registering && (
          <button className="btn btn-ghost" type="button" disabled={busy || resetBusy || !email.trim()} onClick={() => void sendPasswordReset()}>
            {resetBusy ? "Sending reset link..." : "Forgot password?"}
          </button>
        )}
        <button
          className="btn btn-ghost"
          type="button"
          disabled={busy}
          onClick={() => {
            setRegistering((value) => !value);
            setError(null);
            setNotice(null);
          }}
        >
          {registering ? "Back to sign in" : "Create an account"}
        </button>
        {registering && (
          <p className="help">This records your requested role only. Access is granted after a KodiLedger administrator assigns a membership. Caretakers must be assigned to a landlord.</p>
        )}
      </form>
    </div>
  );
}
