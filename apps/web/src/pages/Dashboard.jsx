import { useEffect, useState } from "react";
import { apiGet } from "../api/client.js";

export default function Dashboard() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet("/health")
      .then(setHealth)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      {error && <p style={{ color: "tomato" }}>{error}</p>}
      {health ? (
        <pre style={{ padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.06)" }}>
          {JSON.stringify(health, null, 2)}
        </pre>
      ) : (
        <p>Conectando a la API…</p>
      )}
    </div>
  );
}
