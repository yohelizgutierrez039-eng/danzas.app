// src/components/common/SearchBar.jsx

import {
  FiSearch,
  FiX,
} from "react-icons/fi";

import "./SearchBar.css";

function SearchBar({
  value = "",
  placeholder = "Buscar...",
  onChange,
  onSearch,
  onClear,
  disabled = false,
  size = "medium",
  fullWidth = true,
  className = "",
}) {
  function handleChange(event) {
    onChange?.(event.target.value);
  }

  function handleSubmit(event) {
    event.preventDefault();

    onSearch?.(value);
  }

  function handleClear() {
    onChange?.("");
    onClear?.();
  }

  const searchBarClasses = [
    "search-bar",
    `search-bar--${size}`,
    fullWidth ? "search-bar--full-width" : "",
    disabled ? "search-bar--disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <form
      className={searchBarClasses}
      role="search"
      onSubmit={handleSubmit}
    >
      <FiSearch
        className="search-bar__search-icon"
        aria-hidden="true"
      />

      <input
        type="search"
        className="search-bar__input"
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        disabled={disabled}
        aria-label={placeholder}
      />

      {value && !disabled && (
        <button
          type="button"
          className="search-bar__clear"
          onClick={handleClear}
          aria-label="Limpiar búsqueda"
        >
          <FiX />
        </button>
      )}
    </form>
  );
}

export default SearchBar;