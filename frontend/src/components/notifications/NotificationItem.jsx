// src/components/notifications/NotificationItem.jsx

import "./NotificationItem.css";

const TIPO_CONFIG = {
  registro: { icon: "👤", modifier: "info" },
  pago: { icon: "💳", modifier: "success" },
  cancelacion: { icon: "✕", modifier: "danger" },
  aprobacion: { icon: "✓", modifier: "success" },
  recordatorio: { icon: "⏰", modifier: "warning" },
};

/**
 * Fila clickeable de una notificación individual (RF-017: confirmación de
 * registro, confirmación de pago, cancelación de clase, aprobación/rechazo
 * de academia, recordatorios).
 * @param {{
 *   notificacion: {
 *     id: string | number,
 *     tipo: "registro" | "pago" | "cancelacion" | "aprobacion" | "recordatorio",
 *     titulo: string,
 *     mensaje: string,
 *     leida: boolean,
 *     creadoEn: string | Date,
 *   },
 *   onClick: (id: string | number) => void,
 * }} props
 */
function NotificationItem({ notificacion, onClick }) {
  const { id, tipo, titulo, mensaje, leida, creadoEn } = notificacion;
  const config = TIPO_CONFIG[tipo] || TIPO_CONFIG.recordatorio;

  const fechaFormateada = new Date(creadoEn).toLocaleString("es-CO");

  const itemClasses = [
    "notification-item",
    !leida ? "notification-item--unread" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={itemClasses}
      onClick={() => onClick(id)}
    >
      <span className={`notification-item__icon notification-item__icon--${config.modifier}`}>
        {config.icon}
      </span>

      <span className="notification-item__body">
        <span className="notification-item__title">{titulo}</span>
        <span className="notification-item__message">{mensaje}</span>
        <span className="notification-item__date">{fechaFormateada}</span>
      </span>

      {!leida && <span className="notification-item__dot" />}
    </button>
  );
}

export default NotificationItem;
