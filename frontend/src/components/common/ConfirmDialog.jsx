import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import "./ConfirmDialog.css";

function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "¿Estás seguro?",
  message = "Esta acción no se puede deshacer.",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "danger",
  loading = false,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, loading]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget && !loading) {
      onClose();
    }
  };

  return createPortal(
    <div className="confirm-dialog-overlay" onMouseDown={handleOverlayClick}>
      <div
        className={`confirm-dialog confirm-dialog-${type}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        {/* Icono */}
        <div className="confirm-dialog-icon">
          {type === "danger" && "!"}
          {type === "warning" && "!"}
          {type === "info" && "i"}
        </div>

        {/* Contenido */}
        <div className="confirm-dialog-content">
          <h2 id="confirm-dialog-title" className="confirm-dialog-title">
            {title}
          </h2>

          <p id="confirm-dialog-message" className="confirm-dialog-message">
            {message}
          </p>
        </div>

        {/* Botones */}
        <div className="confirm-dialog-actions">
          <button
            type="button"
            className="confirm-dialog-button confirm-dialog-cancel"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className={`confirm-dialog-button confirm-dialog-confirm confirm-${type}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="confirm-dialog-spinner"></span>
                Procesando...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default ConfirmDialog;
