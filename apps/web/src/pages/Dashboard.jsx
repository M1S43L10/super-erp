import { useEffect, useState } from "react";
import { apiGet } from "../api/client.js";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        // endpoint nuevo
        const resumen = await apiGet("/dashboard/resumen");
        if (!mounted) return;
        setData(resumen);
      } catch (e) {
        if (!mounted) return;
        setError(e.message || "Error cargando dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => (mounted = false);
  }, []);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div>
        <h2 style={{ margin: 0, color: "var(--text-primary)" }}>Dashboard</h2>
        <p style={{ marginTop: 6, color: "var(--text-secondary)" }}>
          Resumen del sistema
        </p>
      </div>

      {error ? (
        <div style={styles.alertError}>
          {error}
        </div>
      ) : null}

      {loading ? (
        <div style={{ color: "var(--text-secondary)" }}>Cargando…</div>
      ) : null}

      {!loading && data ? (
        <>
          <div style={styles.grid}>
            <Card
              title="Ventas de hoy"
              value={money(data.ventas_hoy_total)}
              subtitle={`${data.ventas_hoy_cantidad} ventas`}
            />
            <Card
              title="Ventas últimos 7 días"
              value={money(data.ventas_semana_total)}
              subtitle="Pagadas"
            />
            <Card
              title="Cajas abiertas"
              value={String(data.cajas_abiertas)}
              subtitle="Sesiones ABIERTAS"
            />
            <Card
              title="Stock en cero"
              value={String(data.stock_en_cero)}
              subtitle="Productos con saldo = 0"
            />
          </div>

          <div style={styles.row2}>
            <div style={styles.panel}>
              <h3 style={styles.panelTitle}>Última venta</h3>
              {data.ultima_venta ? (
                <div style={{ display: "grid", gap: 6 }}>
                  <Line label="Número" value={`#${data.ultima_venta.numero_venta}`} />
                  <Line label="Total" value={money(data.ultima_venta.total)} />
                  <Line label="Estado" value={data.ultima_venta.estado} />
                  <Line label="Fecha" value={fmtDateTime(data.ultima_venta.fecha_creacion)} />
                </div>
              ) : (
                <div style={{ color: "var(--text-secondary)" }}>Sin ventas todavía</div>
              )}
            </div>

            <div style={styles.panel}>
              <h3 style={styles.panelTitle}>Salud API</h3>
              <small style={{ color: "var(--text-secondary)" }}>
                (opcional, útil para debug)
              </small>
              <div style={{ marginTop: 10 }}>
                <HealthMini />
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function Card({ title, value, subtitle }) {
  return (
    <div style={styles.card}>
      <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>{title}</div>
      <div style={{ color: "var(--text-primary)", fontSize: 22, fontWeight: 800, marginTop: 6 }}>
        {value}
      </div>
      <div style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 4 }}>
        {subtitle}
      </div>
    </div>
  );
}

function Line({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>{value}</span>
    </div>
  );
}

// mini health para no perder tu prueba actual
function HealthMini() {
  const [health, setHealth] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    apiGet("/health").then(setHealth).catch((e) => setErr(e.message));
  }, []);

  if (err) return <div style={{ color: "var(--error)" }}>{err}</div>;
  if (!health) return <div style={{ color: "var(--text-secondary)" }}>Conectando…</div>;

  return (
    <pre style={styles.pre}>
      {JSON.stringify(health, null, 2)}
    </pre>
  );
}

function money(n) {
  const num = Number(n || 0);
  return num.toLocaleString("es-AR", { style: "currency", currency: "ARS" });
}

function fmtDateTime(v) {
  try {
    return new Date(v).toLocaleString("es-AR");
  } catch {
    return String(v);
  }
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
  },
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: 14,
  },
  row2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  panel: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: 14,
  },
  panelTitle: {
    margin: 0,
    marginBottom: 10,
    color: "var(--text-primary)",
    fontSize: 16,
  },
  pre: {
    padding: 12,
    borderRadius: 12,
    background: "var(--surface-alt)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
    overflow: "auto",
    margin: 0,
  },
  alertError: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--error)",
  },
};
