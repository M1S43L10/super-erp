import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiPost } from "../api/client";

export default function LoginCajero() {
  const [numero, setNumero] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const numeroRef = useRef(null);
  const pinRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const to = location.state?.to || "/pos";

  // 🔥 FORZAR DARK SOLO PARA POS
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    numeroRef.current?.focus();
    return () => document.documentElement.removeAttribute("data-theme");
  }, []);

  const canSubmit = useMemo(
    () => numero !== "" && pin !== "" && !loading,
    [numero, pin, loading]
  );

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiPost("/cajeros/login", {
        numero_cajero: Number(numero),
        pin,
      });

      localStorage.setItem("pos_token", data.token);
      localStorage.setItem("pos_cajero", JSON.stringify(data.cajero));
      navigate(to, { replace: true });
    } catch (err) {
      setError(err.message || "Error al ingresar");
      setPin("");
      pinRef.current?.focus();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        <h1 style={styles.title}>Ingreso de cajero</h1>
        <p style={styles.subtitle}>Ingresá tu número y PIN</p>

        <form onSubmit={onSubmit} style={styles.form}>
          <input
            ref={numeroRef}
            style={styles.input}
            placeholder="Número de cajero"
            inputMode="numeric"
            value={numero}
            onChange={(e) => setNumero(e.target.value.replace(/\D/g, ""))}
          />

          <input
            ref={pinRef}
            style={styles.input}
            placeholder="PIN"
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          />

          {error && <div style={styles.error}>{error}</div>}

          <button style={styles.button} disabled={!canSubmit}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  bg: {
    position: "fixed",
    inset: 0,
    background: "var(--bg)",
    display: "grid",
    placeItems: "center",
  },
  card: {
    width: 360,
    padding: 24,
    borderRadius: 16,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    boxShadow: "0 20px 40px rgba(0,0,0,.5)",
  },
  title: {
    margin: 0,
    color: "var(--text-primary)",
  },
  subtitle: {
    color: "var(--text-secondary)",
    marginBottom: 16,
  },
  form: { display: "grid", gap: 12 },
  input: {
    height: 44,
    borderRadius: 10,
    border: "1px solid var(--border)",
    background: "var(--surface-alt)",
    color: "var(--text-primary)",
    padding: "0 12px",
  },
  button: {
    height: 44,
    borderRadius: 10,
    border: "none",
    background: "var(--primary)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  error: {
    color: "var(--error)",
    fontSize: 14,
  },
};
