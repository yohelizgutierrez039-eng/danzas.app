import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "./PublicLayout.css";

function PublicLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="public-layout">
      <header className="public-layout-header">
        <div className="public-layout-container public-layout-header-content">
          <button
            type="button"
            className="public-layout-logo"
            onClick={() => handleNavigate("/")}
          >
            <span className="public-layout-logo-icon">♫</span>
            <span>
              Danzas<span className="public-layout-logo-dot">.app</span>
            </span>
          </button>

          <nav className="public-layout-nav">
            <button
              type="button"
              className={isActive("/") ? "active" : ""}
              onClick={() => handleNavigate("/")}
            >
              Inicio
            </button>

            <button
              type="button"
              className={isActive("/academias") ? "active" : ""}
              onClick={() => handleNavigate("/academias")}
            >
              Academias
            </button>

            <button
              type="button"
              className={isActive("/clases") ? "active" : ""}
              onClick={() => handleNavigate("/clases")}
            >
              Clases
            </button>

            <button
              type="button"
              className={isActive("/como-funciona") ? "active" : ""}
              onClick={() => handleNavigate("/como-funciona")}
            >
              Cómo funciona
            </button>

            <button
              type="button"
              className={isActive("/about") ? "active" : ""}
              onClick={() => handleNavigate("/about")}
            >
              Nosotros
            </button>
          </nav>

          <div className="public-layout-actions">
            <button
              type="button"
              className="public-layout-login"
              onClick={() => handleNavigate("/login")}
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              className="public-layout-register"
              onClick={() => handleNavigate("/registro")}
            >
              Registrarse
            </button>
          </div>
        </div>
      </header>

      <main className="public-layout-main">
        <Outlet />
      </main>

      <footer className="public-layout-footer">
        <div className="public-layout-container public-layout-footer-content">
          <div className="public-layout-footer-brand">
            <div className="public-layout-footer-logo">
              <span>♫</span>
              Danzas<span>.app</span>
            </div>

            <p>Conectamos personas y academias a través de la danza.</p>
          </div>

          <div className="public-layout-footer-links">
            <button onClick={() => handleNavigate("/")}>Inicio</button>

            <button onClick={() => handleNavigate("/academias")}>
              Academias
            </button>

            <button onClick={() => handleNavigate("/clases")}>Clases</button>

            <button onClick={() => handleNavigate("/como-funciona")}>
              Cómo funciona
            </button>

            <button onClick={() => handleNavigate("/about")}>Nosotros</button>
          </div>
        </div>

        <div className="public-layout-footer-bottom">
          <p>
            © {new Date().getFullYear()} Danzas.app. Todos los derechos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;
