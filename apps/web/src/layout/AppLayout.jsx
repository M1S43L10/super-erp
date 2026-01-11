import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";

export default function AppLayout() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ padding: 16 }}>
        <Outlet />
      </main>
    </div>
  );
}
