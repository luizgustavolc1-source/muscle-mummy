import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Clients() {
  const [message, setMessage] = useState("Connecting...");

  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase
        .from("clients")
        .select("*");

      if (error) {
        setMessage("ERROR: " + error.message);
      } else {
        setMessage(`Connected! ${data.length} client(s) found.`);
      }
    }

    testConnection();
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h1>Clients</h1>
      <p>{message}</p>
    </div>
  );
}