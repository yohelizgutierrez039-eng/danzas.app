// src/components/common/Select.jsx

import "./Select.css";

function Select({
  label,
  name,
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = "Selecciona una opción",
  error = "",
  helperText = "",
  required = false,
  disabled = false,
  size = "medium",
  fullWidth = true,
  className = "",
  ...props
}) {
  const selectClasses = [
    "select",
    `select--${size}`,
    error ? "select--error" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`
        select-group
        ${fullWidth ? "select-group--full-width" : ""}
      `}
    >
      {label && (
        <label
          className="select-label"
          htmlFor={name}
        >
          {label}

          {required && (
            <span
              className="select-label__required"
              aria-hidden="true"
            >
              *
            </span>
          )}
        </label>
      )}

      <div className="select-container">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          disabled={disabled}
          className={selectClasses}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? `${name}-error`
              : helperText
              ? `${name}-helper`
              : undefined
          }
          {...props}
        >
          {placeholder && (
            <option value="">
              {placeholder}
            </option>
          )}

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        <span
          className="select-arrow"
          aria-hidden="true"
        >
          ▼
        </span>
      </div>

      {error && (
        <span
          id={`${name}-error`}
          className="
            select-message
            select-message--error
          "
        >
          {error}
        </span>
      )}

      {!error && helperText && (
        <span
          id={`${name}-helper`}
          className="
            select-message
            select-message--helper
          "
        >
          {helperText}
        </span>
      )}
    </div>
  );
}

export default Select;