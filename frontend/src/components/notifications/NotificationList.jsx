// src/components/notifications/NotificationList.jsx

import EmptyState from "../common/EmptyState/EmptyState";
import NotificationItem from "./NotificationItem";

import "./NotificationList.css";

/**
 * Lista vertical de notificaciones (se leen de arriba hacia abajo).
 * @param {{
 *   notificaciones: Array<object>,
 *   onItemClick: (id: string | number) => void,
 *   emptyMessage?: string,
 * }} props
 */
function NotificationList({
  notificaciones,
  onItemClick,
  emptyMessage = "No tenés notificaciones.",
}) {
  if (!notificaciones || notificaciones.length === 0) {
    return <EmptyState title={emptyMessage} />;
  }

  return (
    <div className="notification-list">
      {notificaciones.map((notificacion) => (
        <NotificationItem
          key={notificacion.id}
          notificacion={notificacion}
          onClick={onItemClick}
        />
      ))}
    </div>
  );
}

export default NotificationList;
