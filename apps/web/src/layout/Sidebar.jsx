import { NavLink } from "react-router-dom";
import { logoutERP } from "../utils/logout.js";
import { useTheme } from "../styles/useTheme.js";

import {
  LayoutDashboard,
  Package,
  Boxes,
  WalletCards,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside
      style={{
        borderRight: "1px solid var(--border)",
        background: "var(--surface)",
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ padding: 12, color: "var(--text-primary)", fontWeight: 800 }}>
        Super ERP
      </div>

      <NavItem to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
      <NavItem to="/productos" icon={<Package size={18} />} label="Productos" />
      <NavItem to="/stock" icon={<Boxes size={18} />} label="Stock" />
      <NavItem to="/caja" icon={<WalletCards size={18} />} label="Caja" />

      <div style={{ flex: 1 }} />

      <button onClick={toggleTheme} style={styles.actionBtn}>
        {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
        <span>{theme === "dark" ? "Dark" : "Light"}</span>
      </button>

      <button onClick={logoutERP} style={styles.dangerBtn}>
        <LogOut size={18} />
        <span>Cerrar sesión</span>
      </button>
    </aside>
  );
}

function NavItem({ to, icon, label }) {
  return (
    <NavLink to={to} style={({ isActive }) => ({ ...styles.nav, ...(isActive ? styles.navActive : {}) })}>
      <span style={{ display: "grid", placeItems: "center" }}>{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

const styles = {
  nav: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 12,
    textDecoration: "none",
    color: "var(--text-primary)",
    background: "transparent",
  },
  navActive: {
    background: "var(--surface-alt)",
    border: "1px solid var(--border)",
  },
  actionBtn: {
    height: 42,
    borderRadius: 12,
    border: "1px solid var(--border)",
    background: "var(--surface-alt)",
    color: "var(--text-primary)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 12px",
  },
  dangerBtn: {
    height: 42,
    borderRadius: 12,
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--text-primary)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 12px",
  },
};
