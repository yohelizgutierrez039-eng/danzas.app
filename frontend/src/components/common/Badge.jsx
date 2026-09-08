// src/components/common/Badge.jsx

import "./Badge.css";

function Badge({
  children,
  variant = "default",
  size = "medium",
  rounded = true,
  className = "",
}) {
  return (
    <span
      className={`
        badge
        badge--${variant}
        badge--${size}
        ${rounded ? "badge--rounded" : ""}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

export default Badge;
