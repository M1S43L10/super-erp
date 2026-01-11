import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Caja from "./pages/Caja.jsx";
import Productos from "./pages/Productos.jsx";
import Stock from "./pages/Stock.jsx";

import Pos from "./pages/Pos.jsx";
import LoginCajero from "./pages/LoginCajero.jsx";
import RequireCajero from "./components/RequireCajero.jsx";

import Login from "./pages/Login.jsx";
import RequireERP from "./components/RequireERP.jsx";

function RedirectIfLogged({ children }) {
  const token = localStorage.getItem("pos_token");
  if (token) return <Navigate to="/pos" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ===== POS (SIN BARRA) ===== */}
        <Route
          path="/login-cajero"
          element={
            <RedirectIfLogged>
              <LoginCajero />
            </RedirectIfLogged>
          }
        />
        <Route
          path="/pos/*"
          element={
            <RequireCajero>
              <Pos />
            </RequireCajero>
          }
        />

        {/* ===== ERP LOGIN ===== */}
        <Route path="/login" element={<Login />} />

        {/* ===== ERP (CON BARRA / LAYOUT) PROTEGIDO ===== */}
        <Route
          element={
            <RequireERP>
              <AppLayout />
            </RequireERP>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/caja" element={<Caja />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/stock" element={<Stock />} />

          {/* Cualquier otra cosa -> Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
