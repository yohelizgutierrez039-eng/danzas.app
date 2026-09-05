// src/components/common/Input.jsx

import "./Input.css";

function Input({
  label,
  type = "text",
  name,
  value,
  placeholder = "",
  onChange,
  onBlur,
  error = "",
  helperText = "",
  required = false,
  disabled = false,
  readOnly = false,
  icon = null,
  size = "medium",
  fullWidth = true,
  className = "",
  ...props
}) {
  const inputClasses = [
    "input",
    `input--${size}`,
    icon ? "input--with-icon" : "",
    error ? "input--error" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`
        input-group
        ${fullWidth ? "input-group--full-width" : ""}
      `}
    >
      {/* Label */}

      {label && (
        <label className="input-label" htmlFor={name}>
          {label}

          {required && (
            <span className="input-label__required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {/* Contenedor */}

      <div className="input-container">
        {/* Icono */}

        {icon && <span className="input-icon">{icon}</span>}

        {/* Input */}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          className={inputClasses}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `${name}-error` : helperText ? `${name}-helper` : undefined
          }
          {...props}
        />
      </div>

      {/* Error */}

      {error && (
        <span
          id={`${name}-error`}
          className="input-message input-message--error"
        >
          {error}
        </span>
      )}

      {/* Texto de ayuda */}

      {!error && helperText && (
        <span
          id={`${name}-helper`}
          className="input-message input-message--helper"
        >
          {helperText}
        </span>
      )}
    </div>
  );
}

export default Input;
