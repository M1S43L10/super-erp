import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Login() {
  const [usuarios, setUsuarios] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loading, setLoading] = useState(false);

  const userRef = useRef(null);
  const passRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const to = location.state?.to || "/";

  const token = useMemo(() => localStorage.getItem("erp_token"), []);
  useEffect(() => {
    if (token) navigate("/", { replace: true });
  }, [token, navigate]);

  useEffect(() => {
    let mounted = true;

    async function loadUsers() {
      setLoadingUsers(true);
      setError("");

      try {
        const res = await fetch("/api/auth/usuarios");
        if (!res.ok) throw new Error("No se pudo cargar la lista de usuarios.");

        const data = await res.json();
        if (!mounted) return;

        setUsuarios(data);
        setUsername(data?.[0]?.username ?? "");
      } catch (e) {
        if (!mounted) return;
        setError(e.message || "Error cargando usuarios.");
      } finally {
        if (mounted) setLoadingUsers(false);
      }
    }

    loadUsers();
    return () => (mounted = false);
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!username) {
      setError("Seleccioná un usuario.");
      userRef.current?.focus?.();
      return;
    }
    if (!password) {
      setError("Ingresá la contraseña.");
      passRef.current?.focus?.();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Credenciales inválidas.");
      }

      const data = await res.json(); // { token, user }

      localStorage.setItem("erp_token", data.token);
      localStorage.setItem("erp_user", JSON.stringify(data.user));

      navigate(to, { replace: true });
    } catch (e) {
      setError(e.message || "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        <h1 style={styles.title}>Ingreso al sistema</h1>
        <p style={styles.subtitle}>Seleccioná tu usuario e ingresá tu contraseña</p>

        <form onSubmit={onSubmit} style={styles.form}>
          <select
            ref={userRef}
            style={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loadingUsers}
          >
            {usuarios.map((u) => (
              <option key={u.username} value={u.username}>
                {u.nombre} ({u.username})
              </option>
            ))}
          </select>

          <input
            ref={passRef}
            style={styles.input}
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error ? <div style={styles.error}>{error}</div> : null}

          <button type="submit" style={styles.button} disabled={loading || loadingUsers}>
            {loading ? "Ingresando..." : "Entrar"}
          </button>
        </form>

        <div style={styles.hint}>
          Tip: el admin por defecto es <b>admin</b>
        </div>
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
    width: 380,
    padding: 24,
    borderRadius: 16,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    boxShadow: "0 20px 40px rgba(0,0,0,.35)",
  },
  title: {
    margin: 0,
    fontSize: 22,
    color: "var(--text-primary)",
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 18,
    color: "var(--text-secondary)",
    fontSize: 14,
  },
  form: {
    display: "grid",
    gap: 10,
  },
  input: {
    height: 44,
    borderRadius: 10,
    border: "1px solid var(--border)",
    background: "var(--surface-alt)",
    padding: "0 12px",
    color: "var(--text-primary)",
    outline: "none",
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
  hint: {
    marginTop: 14,
    color: "var(--text-secondary)",
    fontSize: 12,
  },
};
