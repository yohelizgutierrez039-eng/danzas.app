import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import "./ProtectedRoute.css";

function ProtectedRoute({ isAuthenticated, allowedRoles = [], userRole }) {
  const location = useLocation();

  // Mientras se comprueba la autenticación,
  // el componente padre puede controlar el estado de carga.
  if (isAuthenticated === null || isAuthenticated === undefined) {
    return (
      <div className="protected-route-loading">
        <div className="protected-route-spinner"></div>
        <p>Verificando sesión...</p>
      </div>
    );
  }

  // Si no está autenticado, enviarlo al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Si la ruta requiere roles y el usuario no tiene permiso
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  // Si todo está correcto, mostrar la ruta protegida
  return <Outlet />;
}

export default ProtectedRoute;
