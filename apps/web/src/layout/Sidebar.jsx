import { NavLink } from "react-router-dom";

const linkStyle = ({ isActive }) => ({
  display: "block",
  padding: "10px 12px",
  borderRadius: 8,
  textDecoration: "none",
  color: "inherit",
  background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
});

export default function Sidebar() {
  return (
    <aside style={{ padding: 16, borderRight: "1px solid rgba(255,255,255,0.08)" }}>
      <h3 style={{ margin: "0 0 12px 0" }}>Super ERP</h3>

      <nav style={{ display: "grid", gap: 6 }}>
        <NavLink to="/" style={linkStyle}>Dashboard</NavLink>
        <NavLink to="/caja" style={linkStyle}>Caja</NavLink>
        <NavLink to="/pos" style={linkStyle}>POS</NavLink>
        <NavLink to="/productos" style={linkStyle}>Productos</NavLink>
        <NavLink to="/stock" style={linkStyle}>Stock</NavLink>
      </nav>
    </aside>
  );
}
