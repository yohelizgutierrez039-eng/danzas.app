import React from "react";
import "./EmptyState.css";

function EmptyState({
  title = "No hay información disponible",
  message = "No encontramos información para mostrar en este momento.",
  icon = "◌",
  action = null,
  className = "",
}) {
  const emptyStateClasses = ["empty-state", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={emptyStateClasses}>
      <div className="empty-state-icon">{icon}</div>

      <div className="empty-state-content">
        <h2 className="empty-state-title">{title}</h2>

        <p className="empty-state-message">{message}</p>
      </div>

      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}

export default EmptyState;
