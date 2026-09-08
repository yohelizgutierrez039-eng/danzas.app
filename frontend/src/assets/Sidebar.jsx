import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({
  role = "student",
  userName = "Usuario",
  userEmail = "usuario@correo.com",
  onLogout,
}) {
  const menuItems = {
    student: [
      { label: "Dashboard", path: "/estudiante", icon: "⌂" },
      { label: "Explorar clases", path: "/clases", icon: "⌕" },
      { label: "Mis inscripciones", path: "/estudiante/inscripciones", icon: "▣" },
      { label: "Mis clases", path: "/estudiante/clases", icon: "◷" },
      { label: "Asistencia", path: "/estudiante/asistencia", icon: "✓" },
      { label: "Pagos", path: "/estudiante/pagos", icon: "$" },
      { label: "Notificaciones", path: "/estudiante/notificaciones", icon: "♢" },
    ],

    parent: [
      { label: "Dashboard", path: "/padre", icon: "⌂" },
      { label: "Mis hijos", path: "/padre/hijos", icon: "♙" },
      { label: "Inscripciones", path: "/padre/inscripciones", icon: "▣" },
      { label: "Asistencia", path: "/padre/asistencia", icon: "✓" },
      { label: "Pagos", path: "/padre/pagos", icon: "$" },
      { label: "Notificaciones", path: "/padre/notificaciones", icon: "♢" },
    ],

    instructor: [
      { label: "Dashboard", path: "/instructor", icon: "⌂" },
      { label: "Mis clases", path: "/instructor/clases", icon: "▣" },
      { label: "Estudiantes", path: "/instructor/estudiantes", icon: "♙" },
      { label: "Asistencia", path: "/instructor/asistencia", icon: "✓" },
      { label: "Calendario", path: "/instructor/calendario", icon: "◷" },
      { label: "Pagos", path: "/instructor/pagos", icon: "$" },
      { label: "Reportes", path: "/instructor/reportes", icon: "▤" },
      { label: "Notificaciones", path: "/instructor/notificaciones", icon: "♢" },
    ],

    admin: [
      { label: "Dashboard", path: "/admin", icon: "⌂" },
      { label: "Usuarios", path: "/admin/usuarios", icon: "♙" },
      { label: "Academias", path: "/admin/academias", icon: "⌂" },
      { label: "Clases", path: "/admin/clases", icon: "▣" },
      { label: "Pagos", path: "/admin/pagos", icon: "$" },
      { label: "Reportes", path: "/admin/reportes", icon: "▤" },
      { label: "Notificaciones", path: "/admin/notificaciones", icon: "♢" },
    ],
  };

  const currentMenu = menuItems[role] || menuItems.student;

  const roleNames = {
    student: "Estudiante",
    parent: "Padre de familia",
    instructor: "Instructor",
    admin: "Administrador",
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-header">
        <NavLink to="/" className="sidebar-logo">
          <span className="sidebar-logo-icon">♫</span>

          <span>
            Danzas<span className="sidebar-logo-dot">.app</span>
          </span>
        </NavLink>
      </div>

      {/* Usuario */}
      <div className="sidebar-user">
        <div className="sidebar-avatar">
          {userName.charAt(0).toUpperCase()}
        </div>

        <div className="sidebar-user-info">
          <span className="sidebar-user-name">
            {userName}
          </span>

          <span className="sidebar-user-role">
            {roleNames[role]}
          </span>
        </div>
      </div>

      {/* Navegación */}
      <nav className="sidebar-nav">
        <span className="sidebar-section-title">
          MENÚ PRINCIPAL
        </span>

        {currentMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-link-icon">
              {item.icon}
            </span>

            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Parte inferior */}
      <div className="sidebar-bottom">
        <NavLink
          to={`/${role === "admin" ? "admin" : role === "student" ? "estudiante" : role === "parent" ? "padre" : "instructor"}/perfil`}
          className="sidebar-link"
        >
          <span className="sidebar-link-icon">⚙</span>
          <span>Mi perfil</span>
        </NavLink>

        <button
          type="button"
          className="sidebar-logout"
          onClick={onLogout}
        >
          <span className="sidebar-link-icon">↪</span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;