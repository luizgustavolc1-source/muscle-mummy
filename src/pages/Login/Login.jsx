import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useSession } from "../../services/session";

export default function Login() {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("signin");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  if (!loading && session) return <Navigate to="/dashboard" replace />;

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
    setMessage("");
  }

  async function submit(event) {
    event.preventDefault();
    setWorking(true);
    setError("");
    setMessage("");

    const result = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    setWorking(false);
    if (result.error) return setError(result.error.message);

    if (mode === "signup") {
      setMessage("Account created. You can now sign in.");
      setMode("signin");
      return;
    }

    navigate("/dashboard");
  }

  async function requestReset(event) {
    event.preventDefault();
    if (!email) return setError("Enter your email address first.");

    setWorking(true);
    setError("");
    setMessage("");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setWorking(false);
    if (resetError) return setError(resetError.message);
    setMessage("If an account exists for this email, a password-reset link has been sent.");
  }

  const isReset = mode === "reset";
  const title = isReset ? "Reset your password" : mode === "signin" ? "Coach sign in" : "Create coach account";
  const description = isReset
    ? "Enter your email and we will send a secure reset link."
    : mode === "signin"
      ? "Access your private client workspace."
      : "Create the private account used to manage clients.";

  return (
    <main className="login">
      <section className="card login-card">
        <div className="brand"><span className="brand-mark">MM</span>Muscle Mummy</div>
        <h1>{title}</h1>
        <p>{description}</p>

        <form onSubmit={isReset ? requestReset : submit}>
          <input required type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
          {!isReset && <input required minLength="6" type="password" placeholder="Password (at least 6 characters)" value={password} onChange={(event) => setPassword(event.target.value)} />}
          {error && <div className="error">{error}</div>}
          {message && <div className="success">{message}</div>}
          <button className="primary" disabled={working}>
            {working ? "Please wait…" : isReset ? "Send reset link" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        {mode === "signin" && <button className="text-button" onClick={() => switchMode("reset")}>Forgot password?</button>}
        {mode !== "signin" && <button className="text-button" onClick={() => switchMode("signin")}>Back to sign in</button>}
        {mode === "signin" && <button className="text-button" onClick={() => switchMode("signup")}>Create a coach account</button>}
      </section>
    </main>
  );
}
