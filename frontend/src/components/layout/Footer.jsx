import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span className="footer-logo-icon">♫</span>
            <span>Danzas<span className="footer-logo-dot">.app</span></span>
          </Link>

          <p className="footer-description">
            La plataforma para encontrar clases de danza, conectar con
            instructores y descubrir academias en Colombia.
          </p>

          <div className="footer-socials">
            <a href="#" aria-label="Facebook" className="footer-social">f</a>
            <a href="#" aria-label="Instagram" className="footer-social">◎</a>
            <a href="#" aria-label="TikTok" className="footer-social">♪</a>
          </div>
        </div>

        <div className="footer-column">
          <h3>Plataforma</h3>
          <Link to="/clases">Explorar clases</Link>
          <Link to="/academias">Academias</Link>
          <Link to="/como-funciona">Cómo funciona</Link>
          <Link to="/registro">Registrarse</Link>
        </div>

        <div className="footer-column">
          <h3>Información</h3>
          <Link to="/sobre-nosotros">Sobre nosotros</Link>
          <Link to="/contacto">Contáctanos</Link>
          <Link to="/preguntas-frecuentes">Preguntas frecuentes</Link>
          <Link to="/ayuda">Centro de ayuda</Link>
        </div>

        <div className="footer-column">
          <h3>Legal</h3>
          <Link to="/terminos">Términos y condiciones</Link>
          <Link to="/privacidad">Política de privacidad</Link>
          <Link to="/cookies">Política de cookies</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>© {new Date().getFullYear()} Danzas.app. Todos los derechos reservados.</p>
          <p>Hecho para la comunidad de danza en Colombia 🇨🇴</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
