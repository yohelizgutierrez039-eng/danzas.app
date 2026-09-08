// src/components/common/Button.jsx

import "./Button.css";

function Button({
  children,
  type = "button",
  variant = "primary",
  size = "medium",
  fullWidth = false,
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = "left",
  onClick,
  className = "",
  ...props
}) {
  const buttonClasses = [
    "button",
    `button--${variant}`,
    `button--${size}`,
    fullWidth ? "button--full-width" : "",
    loading ? "button--loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <span className="button__spinner" />

          <span>Procesando...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <span className="button__icon">{icon}</span>
          )}

          <span className="button__text">{children}</span>

          {icon && iconPosition === "right" && (
            <span className="button__icon">{icon}</span>
          )}
        </>
      )}
    </button>
  );
}

export default Button;
