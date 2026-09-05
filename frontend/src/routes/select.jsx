import React from "react";
import "./Select.css";

function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Selecciona una opción",
  error = "",
  helperText = "",
  disabled = false,
  required = false,
  fullWidth = true,
  className = "",
}) {
  const selectClasses = [
    "select-wrapper",
    fullWidth ? "select-full-width" : "",
    error ? "select-has-error" : "",
    disabled ? "select-disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={selectClasses}>
      {label && (
        <label htmlFor={name} className="select-label">
          {label}

          {required && <span className="select-required">*</span>}
        </label>
      )}

      <div className="select-container">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className="select"
        >
          <option value="" disabled>
            {placeholder}
          </option>

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

        <span className="select-arrow">⌄</span>
      </div>

      {error && <span className="select-error">{error}</span>}

      {!error && helperText && (
        <span className="select-helper">{helperText}</span>
      )}
    </div>
  );
}

export default Select;
