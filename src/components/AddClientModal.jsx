import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AddClientModal({ open, onClose, onCreated }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [goal, setGoal] = useState("");

  if (!open) return null;

  async function saveClient() {
    const { error } = await supabase.from("clients").insert({
      full_name: fullName,
      email,
      goal,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setFullName("");
    setEmail("");
    setGoal("");

    onCreated();
    onClose();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 420,
          background: "#fff",
          borderRadius: 12,
          padding: 24,
        }}
      >
        <h2>Add Client</h2>

        <input
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={{ width: "100%", marginBottom: 12, padding: 10 }}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: 12, padding: 10 }}
        />

        <input
          placeholder="Goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          style={{ width: "100%", marginBottom: 20, padding: 10 }}
        />

        <button onClick={saveClient}>
          Save Client
        </button>

        <button
          onClick={onClose}
          style={{ marginLeft: 10 }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}