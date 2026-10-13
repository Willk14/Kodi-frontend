"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getSupabase } from "@/lib/auth/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setError("Password reset is not configured.");
      return;
    }

    setBusy(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError("The reset link may have expired. Request a new one and try again.");
        setBusy(false);
        return;
      }

      await supabase.auth.signOut();
      setDone(true);
    } catch {
      setError("The reset link may have expired. Request a new one and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="center-screen">
      <form className="panel center-card form" onSubmit={submit}>
        <h1>{done ? "Password updated" : "Choose a new password"}</h1>
        {done ? (
          <>
            <p>Your password has been updated. Sign in with your new password.</p>
            <button className="btn btn-primary" type="button" onClick={() => router.replace("/login")}>
              Continue to sign in
            </button>
          </>
        ) : (
          <>
            <div className="field">
              <label htmlFor="new-password">New password</label>
              <input id="new-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="confirm-password">Confirm new password</label>
              <input id="confirm-password" type="password" autoComplete="new-password" minLength={8} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
            </div>
            {error && <p role="alert" className="form-error">{error}</p>}
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? "Updating password..." : "Update password"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
