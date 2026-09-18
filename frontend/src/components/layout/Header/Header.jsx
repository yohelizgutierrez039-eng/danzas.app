// src/components/layout/Header/Header.jsx

import NotificationBadge from "../../notifications/NotificationBadge";

import "./Header.css";

/**
 * Barra superior interna de las áreas autenticadas (dashboards). Se ubica
 * a la derecha del Sidebar — distinta del Navbar público. Incluye el
 * botón de hamburguesa (solo visible en mobile) que abre/cierra el
 * Sidebar, el título de la sección actual y la campana de notificaciones
 * junto a los datos del usuario logueado.
 * @param {{
 *   title: string,
 *   user: { nombre: string, rol: string },
 *   notificationCount?: number,
 *   onToggleSidebar: () => void,
 * }} props
 */
function Header({ title, user, notificationCount = 0, onToggleSidebar }) {
  return (
    <header className="header">
      <div className="header__left">
        <button
          type="button"
          className="header__menu-button"
          onClick={onToggleSidebar}
          aria-label="Abrir menú"
        >
          ☰
        </button>

        <h1 className="header__title">{title}</h1>
      </div>

      <div className="header__right">
        <div className="header__bell">
          <span className="header__bell-icon">🔔</span>

          <span className="header__bell-badge">
            <NotificationBadge count={notificationCount} />
          </span>
        </div>

        <div className="header__user">
          <span className="header__user-name">{user.nombre}</span>
          <span className="header__user-role">{user.rol}</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
