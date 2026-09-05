// src/components/common/Loader.jsx

import "./Loader.css";

function Loader({
  size = "medium",
  text = "",
  fullScreen = false,
  inline = false,
  className = "",
}) {
  const loaderClasses = [
    "loader-container",
    fullScreen ? "loader-container--fullscreen" : "",
    inline ? "loader-container--inline" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={loaderClasses}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span
        className={`
          loader
          loader--${size}
        `}
        aria-hidden="true"
      />

      {text && (
        <span className="loader__text">
          {text}
        </span>
      )}

      <span className="loader__sr-only">
        Cargando
      </span>
    </div>
  );
}

export default Loader;