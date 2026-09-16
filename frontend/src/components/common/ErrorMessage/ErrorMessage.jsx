import React from "react";
import "./ErrorMessage.css";

function ErrorMessage({
  message = "Ha ocurrido un error.",
  title = "Error",
  type = "error",
  showIcon = true,
  onClose,
}) {
  return (
    <div className={`error-message error-message-${type}`} role="alert">
      {showIcon && (
        <div className="error-message-icon">
          {type === "warning" ? "!" : "×"}
        </div>
      )}

      <div className="error-message-content">
        {title && <h3 className="error-message-title">{title}</h3>}

        <p className="error-message-text">{message}</p>
      </div>

      {onClose && (
        <button
          type="button"
          className="error-message-close"
          onClick={onClose}
          aria-label="Cerrar mensaje"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
