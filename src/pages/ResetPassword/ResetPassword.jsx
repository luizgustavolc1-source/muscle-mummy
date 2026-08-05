import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setReady(Boolean(data.session)));
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (password.length < 6) return setError("Use a password with at least 6 characters.");
    if (password !== confirmPassword) return setError("The passwords do not match.");

    setWorking(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setWorking(false);
    if (updateError) return setError(updateError.message);
    setMessage("Password updated. Taking you to your dashboard…");
    setTimeout(() => navigate("/dashboard"), 900);
  }

  return (
    <main className="login">
      <section className="card login-card">
        <div className="brand"><span className="brand-mark">MM</span>Muscle Mummy</div>
        <h1>Choose a new password</h1>
        <p>{ready ? "Set a new password for your coach account." : "Open the reset link from your email to continue."}</p>
        {ready ? <form onSubmit={submit}>
          <input required minLength="6" type="password" placeholder="New password" value={password} onChange={(event) => setPassword(event.target.value)} />
          <input required minLength="6" type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          {error && <div className="error">{error}</div>}
          {message && <div className="success">{message}</div>}
          <button className="primary" disabled={working}>{working ? "Please wait…" : "Update password"}</button>
        </form> : <Link className="text-button" to="/login">Back to sign in</Link>}
      </section>
    </main>
  );
}
