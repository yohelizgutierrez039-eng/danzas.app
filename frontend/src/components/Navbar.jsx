import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-icon">♫</span>
          <span>Danzas<span className="navbar-logo-dot">.app</span></span>
        </Link>

        {/* Navegación principal */}
        <nav className="navbar-menu">
          <Link to="/clases" className="navbar-link">
            Explorar clases
          </Link>

          <Link to="/academias" className="navbar-link">
            Academias
          </Link>

          <Link to="/como-funciona" className="navbar-link">
            Cómo funciona
          </Link>

          <Link to="/sobre-nosotros" className="navbar-link">
            Sobre nosotros
          </Link>
        </nav>

        {/* Acciones */}
        <div className="navbar-actions">
          <Link to="/login" className="navbar-login">
            Iniciar sesión
          </Link>

          <Link to="/registro" className="navbar-register">
            Registrarse
          </Link>
        </div>

        {/* Botón móvil */}
        <button
          type="button"
          className="navbar-toggle"
          aria-label="Abrir menú"
          aria-expanded="false"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;
