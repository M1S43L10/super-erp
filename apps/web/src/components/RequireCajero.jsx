import { Navigate, useLocation } from "react-router-dom";

export default function RequireCajero({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("pos_token");

  if (!token) {
    return (
      <Navigate
        to="/login-cajero"
        replace
        state={{ to: location.pathname }}
      />
    );
  }

  return children;
}
