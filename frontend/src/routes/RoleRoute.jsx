import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import "./RoleRoute.css";

function RoleRoute({ userRole, allowedRoles = [] }) {
  const location = useLocation();

  // Mientras se obtiene o verifica el rol del usuario
  if (userRole === null || userRole === undefined) {
    return (
      <div className="role-route-loading">
        <div className="role-route-spinner"></div>

        <h2>Verificando permisos</h2>

        <p>Estamos comprobando que tengas acceso a esta sección.</p>
      </div>
    );
  }

  // Si no se especifican roles permitidos,
  // cualquier usuario autenticado puede acceder.
  if (allowedRoles.length === 0) {
    return <Outlet />;
  }

  // Comprobar si el rol del usuario tiene permiso.
  const hasPermission = allowedRoles.includes(userRole);

  // Si el rol no está autorizado, redirigir.
  if (!hasPermission) {
    return (
      <Navigate
        to="/no-autorizado"
        replace
        state={{
          from: location,
          userRole,
        }}
      />
    );
  }

  // Usuario autorizado.
  return <Outlet />;
}

export default RoleRoute;
