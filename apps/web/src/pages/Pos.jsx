import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Pos() {
  const navigate = useNavigate();
  const cajero = JSON.parse(localStorage.getItem("pos_cajero") || "null");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    return () => document.documentElement.removeAttribute("data-theme");
  }, []);

  function logout() {
    localStorage.clear();
    navigate("/login-cajero", { replace: true });
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          Cajero: <b>{cajero?.numero_cajero}</b> — {cajero?.nombre}
        </div>
        <button style={styles.logout} onClick={logout}>
          Salir
        </button>
      </header>

      <main style={styles.main}>POS OK</main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "var(--bg)",
    color: "var(--text-primary)",
    display: "grid",
    gridTemplateRows: "auto 1fr",
  },
  header: {
    padding: 12,
    borderBottom: "1px solid var(--border)",
    display: "flex",
    justifyContent: "space-between",
  },
  logout: {
    background: "var(--error)",
    border: "none",
    color: "#fff",
    borderRadius: 8,
    padding: "6px 12px",
    cursor: "pointer",
  },
  main: {
    padding: 16,
  },
};
