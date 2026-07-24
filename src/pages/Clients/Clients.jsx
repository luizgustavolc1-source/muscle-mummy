import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Clients() {
  const [message, setMessage] = useState("Connecting...");

  useEffect(() => {
    async function test() {
      try {
        const result = await supabase
          .from("clients")
          .select("*");

        setMessage(JSON.stringify(result, null, 2));
      } catch (err) {
        setMessage(
          JSON.stringify(
            {
              name: err.name,
              message: err.message,
              stack: err.stack,
            },
            null,
            2
          )
        );
      }
    }

    test();
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Clients</h1>
      <pre style={{ whiteSpace: "pre-wrap" }}>{message}</pre>
    </div>
  );
}