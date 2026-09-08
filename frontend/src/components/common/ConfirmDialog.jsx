// src/components/common/ConfirmDialog.jsx

import { useEffect } from "react";
import { FiAlertTriangle, FiInfo, FiCheckCircle } from "react-icons/fi";

import Button from "./Button";

import "./ConfirmDialog.css";

function ConfirmDialog({
  isOpen,
  title = "Confirmar acción",
  message = "¿Estás seguro de realizar esta acción?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onCancel?.();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      document.body.style.overflow = "";
    };
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  const icons = {
    danger: <FiAlertTriangle />,
    warning: <FiAlertTriangle />,
    info: <FiInfo />,
    success: <FiCheckCircle />,
  };

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
      onCancel?.();
    }
  }

  return (
    <div
      className="confirm-dialog-overlay"
      onMouseDown={handleOverlayClick}
      role="presentation"
    >
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        <div
          className={`
            confirm-dialog__icon
            confirm-dialog__icon--${variant}
          `}
        >
          {icons[variant] || icons.danger}
        </div>

        <div className="confirm-dialog__content">
          <h2 id="confirm-dialog-title" className="confirm-dialog__title">
            {title}
          </h2>

          <p id="confirm-dialog-message" className="confirm-dialog__message">
            {message}
          </p>
        </div>

        <div className="confirm-dialog__actions">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>

          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
