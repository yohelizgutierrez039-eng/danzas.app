// src/components/notifications/NotificationBadge.jsx

import "./NotificationBadge.css";

/**
 * Pill circular pequeño con la cantidad de notificaciones sin leer.
 * No se posiciona a sí mismo: el componente padre decide dónde ubicarlo
 * (ej. sobre un ícono de campana con position: relative).
 * @param {{ count: number }} props
 */
function NotificationBadge({ count }) {
  if (!count) {
    return null;
  }

  const display = count > 9 ? "9+" : count;

  return <span className="notification-badge">{display}</span>;
}

export default NotificationBadge;
