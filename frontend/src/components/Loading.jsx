import React from "react";
import "./Loading.css";

function Loading({
  text = "Cargando...",
  size = "medium",
  fullScreen = false,
}) {
  const loadingClasses = [
    "loading",
    `loading-${size}`,
    fullScreen ? "loading-fullscreen" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={loadingClasses}>
      <div className="loading-spinner"></div>

      {text && <span className="loading-text">{text}</span>}
    </div>
  );
}

export default Loading;
