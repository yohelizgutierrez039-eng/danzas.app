// src/components/common/Modal.jsx

import { useEffect } from "react";
import { FiX } from "react-icons/fi";

import "./Modal.css";

function Modal({
  isOpen,
  title = "",
  children,
  footer = null,
  size = "medium",
  closeOnOverlay = true,
  closeOnEscape = true,
  showCloseButton = true,
  onClose,
  className = "",
}) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (
        event.key === "Escape" &&
        closeOnEscape
      ) {
        onClose?.();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow = "";
    };
  }, [
    isOpen,
    closeOnEscape,
    onClose,
  ]);

  if (!isOpen) {
    return null;
  }

  function handleOverlayClick(event) {
    if (
      closeOnOverlay &&
      event.target === event.currentTarget
    ) {
      onClose?.();
    }
  }

  const modalClasses = [
    "modal",
    `modal--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className="modal-overlay"
      onMouseDown={handleOverlayClick}
      role="presentation"
    >
      <div
        className={modalClasses}
        role="dialog"
        aria-modal="true"
        aria-labelledby={
          title
            ? "modal-title"
            : undefined
        }
      >
        {(title || showCloseButton) && (
          <div className="modal__header">

            {title && (
              <h2
                id="modal-title"
                className="modal__title"
              >
                {title}
              </h2>
            )}

            {showCloseButton && (
              <button
                type="button"
                className="modal__close"
                onClick={onClose}
                aria-label="Cerrar modal"
              >
                <FiX />
              </button>
            )}

          </div>
        )}

        <div className="modal__body">
          {children}
        </div>

        {footer && (
          <div className="modal__footer">
            {footer}
          </div>
        )}

      </div>
    </div>
  );
}

export default Modal;