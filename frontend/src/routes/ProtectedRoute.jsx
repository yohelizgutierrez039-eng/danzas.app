import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import "./Protected.css";

function Protected({ isAuthenticated, userRole, allowedRoles = [] }) {
  const location = useLocation();

  // =====================================
  // VERIFICANDO SESIÓN
  // =====================================

  if (isAuthenticated === null || isAuthenticated === undefined) {
    return (
      <div className="protected-loading">
        <div className="protected-spinner"></div>

        <h2>Verificando sesión</h2>

        <p>Estamos comprobando tu acceso a Danzas.app...</p>
      </div>
    );
  }

  // =====================================
  // USUARIO NO AUTENTICADO
  // =====================================

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  // =====================================
  // VALIDACIÓN DEL ROL
  // =====================================

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  // =====================================
  // ACCESO PERMITIDO
  // =====================================

  return <Outlet />;
}

export default Protected;
