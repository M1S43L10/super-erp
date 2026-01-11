import { Navigate, useLocation } from "react-router-dom";

export default function RequireERP({ children }) {
  const token = localStorage.getItem("erp_token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ to: location.pathname }} />;
  }

  return children;
}
