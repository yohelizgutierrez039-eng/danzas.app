// src/components/dashboard/RecentActivity.jsx

import EmptyState from "../common/EmptyState/EmptyState";

import "./RecentActivity.css";

function formatearFecha(iso) {
  const fecha = new Date(iso);
  const fechaTexto = fecha.toLocaleDateString("es-CO");
  const horaTexto = fecha.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${fechaTexto} · ${horaTexto}`;
}

/**
 * Lista vertical de actividad reciente para dashboards.
 *
 * @param {Object} props
 * @param {Array} props.items - [{ id, icon, text, date }]
 * @param {string} [props.emptyMessage]
 */
function RecentActivity({ items = [], emptyMessage = "Sin actividad reciente." }) {
  if (items.length === 0) {
    return <EmptyState title={emptyMessage} compact />;
  }

  return (
    <div className="recent-activity">
      {items.map((item) => (
        <div key={item.id} className="recent-activity__row">
          <span className="recent-activity__icon">{item.icon}</span>

          <span className="recent-activity__text">{item.text}</span>

          <span className="recent-activity__date">
            {formatearFecha(item.date)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default RecentActivity;
