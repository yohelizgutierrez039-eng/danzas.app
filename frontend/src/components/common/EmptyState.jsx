// src/components/common/EmptyState.jsx

import Button from "./Button";

import "./EmptyState.css";

function EmptyState({
  icon = null,
  title = "No hay información disponible",
  description = "",
  actionText = "",
  actionIcon = null,
  onAction,
  variant = "default",
  compact = false,
  className = "",
}) {
  const emptyStateClasses = [
    "empty-state",
    `empty-state--${variant}`,
    compact ? "empty-state--compact" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={emptyStateClasses}>
      {icon && <div className="empty-state__icon">{icon}</div>}

      <div className="empty-state__content">
        <h3 className="empty-state__title">{title}</h3>

        {description && (
          <p className="empty-state__description">{description}</p>
        )}
      </div>

      {actionText && onAction && (
        <div className="empty-state__action">
          <Button variant="primary" icon={actionIcon} onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
}

export default EmptyState;
