import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import AddClientModal from "../../components/AddClientModal";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    setLoading(true);

    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setClients(data);
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: 40 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 30,
        }}
      >
        <h1>Clients</h1>

        <button
          onClick={() => setOpenModal(true)}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "12px 18px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          + Add Client
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "white",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <thead
            style={{
              background: "#f5f5f5",
            }}
          >
            <tr>
              <th style={{ padding: 15, textAlign: "left" }}>Name</th>
              <th style={{ padding: 15, textAlign: "left" }}>Email</th>
              <th style={{ padding: 15, textAlign: "left" }}>Goal</th>
              <th style={{ padding: 15, textAlign: "left" }}>Status</th>
            </tr>
          </thead>

          <tbody>
            {clients.map((client) => (
              <tr
                key={client.id}
                style={{
                  borderTop: "1px solid #eee",
                }}
              >
                <td style={{ padding: 15 }}>{client.full_name}</td>
                <td style={{ padding: 15 }}>{client.email}</td>
                <td style={{ padding: 15 }}>{client.goal}</td>
                <td style={{ padding: 15 }}>{client.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <AddClientModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreated={loadClients}
      />
    </div>
  );
}