import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "../../components/common/Modal/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog/ConfirmDialog";
import "./ClassDetail.css";

function ClassDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /*
    Datos de demostración.
    Posteriormente serán reemplazados por la información
    obtenida desde el backend utilizando el id de la URL.
  */
  const danceClass = {
    id: id || 1,

    name: "Salsa Básica",

    type: "Salsa",

    city: "Barranquilla",

    modality: "Presencial",

    schedule: "Lunes y miércoles · 6:00 PM",

    duration: "1 hora",

    price: "$80.000",

    available: 8,

    capacity: 15,

    academy: "Academia Ritmo Caribe",

    academyAddress: "Carrera 45 # 72-18",

    instructor: "Carlos Martínez",

    instructorEmail: "carlos.martinez@danzas.app",

    instructorPhone: "300 456 7890",

    description:
      "Clase diseñada para aprender los fundamentos de la salsa desde cero. Durante las sesiones se trabajan pasos básicos, ritmo, coordinación y movimientos fundamentales para desenvolverse con mayor seguridad en este estilo de baile.",

    requirements: [
      "No se requiere experiencia previa.",
      "Ropa cómoda para realizar los movimientos.",
      "Disponibilidad para asistir a los horarios establecidos.",
    ],
  };

  /*
    Para la versión conectada al backend:

    POST /enrollments

    Request:
    {
      classId: danceClass.id,
      dependentId: null
    }

    Response:
    {
      enrollmentId: "...",
      status: "pendiente_pago",
      paymentUrl: "..."
    }

    Después se redirige a la pasarela de pago.
  */

  const handleLogin = () => {
    setShowLoginModal(false);
    navigate("/login");
  };

  const handleRegister = () => {
    setShowLoginModal(false);
    navigate("/registro");
  };

  const handleEnroll = () => {
    /*
      Actualmente se muestra una confirmación
      de demostración.

      Posteriormente aquí se realizará:
      POST /enrollments
    */
    setShowConfirm(true);
  };

  const handleConfirmEnrollment = () => {
    setShowConfirm(false);

    /*
      Cuando el backend esté conectado:

      1. Crear inscripción.
      2. Reservar temporalmente el cupo.
      3. Recibir paymentUrl.
      4. Redirigir al checkout.

      Ejemplo:

      navigate(paymentUrl);
    */

    setShowLoginModal(true);
  };

  return (
    <div className="class-detail-page">
      {/* =========================
          HEADER
      ========================= */}

      <header className="class-detail-header">
        <div className="class-detail-header-container">
          <button
            type="button"
            className="class-detail-logo"
            onClick={() => navigate("/")}
          >
            <span className="class-detail-logo-icon">♫</span>

            <span>
              Danzas<span>.app</span>
            </span>
          </button>

          <nav className="class-detail-nav">
            <button type="button" onClick={() => navigate("/")}>
              Inicio
            </button>

            <button type="button" onClick={() => navigate("/academias")}>
              Academias
            </button>

            <button
              type="button"
              className="active"
              onClick={() => navigate("/clases")}
            >
              Clases
            </button>
          </nav>

          <div className="class-detail-actions">
            <button
              type="button"
              className="class-detail-login"
              onClick={() => navigate("/login")}
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              className="class-detail-register"
              onClick={() => navigate("/registro")}
            >
              Registrarse
            </button>
          </div>
        </div>
      </header>

      {/* =========================
          CONTENIDO
      ========================= */}

      <main className="class-detail-content">
        {/* VOLVER */}

        <button
          type="button"
          className="class-detail-back"
          onClick={() => navigate("/clases")}
        >
          ← Volver a clases
        </button>

        {/* =========================
            PRESENTACIÓN
        ========================= */}

        <section className="class-detail-hero">
          <div className="class-detail-hero-icon">♫</div>

          <div className="class-detail-hero-info">
            <span className="class-detail-eyebrow">DETALLE DE LA CLASE</span>

            <h1>{danceClass.name}</h1>

            <div className="class-detail-hero-meta">
              <span>♫ {danceClass.type}</span>

              <span>📍 {danceClass.city}</span>

              <span>{danceClass.modality}</span>
            </div>

            <p>{danceClass.description}</p>
          </div>
        </section>

        {/* =========================
            INFORMACIÓN PRINCIPAL
        ========================= */}

        <section className="class-detail-main-grid">
          {/* INFORMACIÓN DE LA CLASE */}

          <div className="class-detail-card">
            <div className="class-detail-section-title">
              <div className="class-detail-section-icon">◷</div>

              <div>
                <h2>Información de la clase</h2>

                <p>Consulta los datos y horarios disponibles.</p>
              </div>
            </div>

            <div className="class-detail-info-grid">
              <div className="class-detail-info-item">
                <span>Tipo de baile</span>

                <strong>{danceClass.type}</strong>
              </div>

              <div className="class-detail-info-item">
                <span>Modalidad</span>

                <strong>{danceClass.modality}</strong>
              </div>

              <div className="class-detail-info-item">
                <span>Ciudad</span>

                <strong>{danceClass.city}</strong>
              </div>

              <div className="class-detail-info-item">
                <span>Duración</span>

                <strong>{danceClass.duration}</strong>
              </div>

              <div className="class-detail-info-item class-detail-info-wide">
                <span>Horario</span>

                <strong>{danceClass.schedule}</strong>
              </div>
            </div>
          </div>

          {/* PRECIO Y CUPO */}

          <div className="class-detail-price-card">
            <span className="class-detail-price-label">PRECIO DE LA CLASE</span>

            <strong className="class-detail-price">{danceClass.price}</strong>

            <div className="class-detail-price-divider"></div>

            <div className="class-detail-availability">
              <span className="class-detail-availability-icon">✓</span>

              <div>
                <small>CUPOS DISPONIBLES</small>

                <strong>{danceClass.available} cupos</strong>
              </div>
            </div>

            <button
              type="button"
              className="class-detail-enroll-button"
              onClick={handleEnroll}
              disabled={danceClass.available <= 0}
            >
              {danceClass.available > 0
                ? "Inscribirme"
                : "Sin cupos disponibles"}
            </button>

            <small className="class-detail-payment-note">
              El pago se realizará de forma segura después de crear la
              inscripción.
            </small>
          </div>
        </section>

        {/* =========================
            INSTRUCTOR Y ACADEMIA
        ========================= */}

        <section className="class-detail-secondary-grid">
          {/* INSTRUCTOR */}

          <div className="class-detail-card">
            <div className="class-detail-section-title">
              <div className="class-detail-section-icon">♙</div>

              <div>
                <h2>Instructor</h2>

                <p>Información del instructor de la clase.</p>
              </div>
            </div>

            <div className="class-detail-profile">
              <div className="class-detail-profile-avatar">
                {danceClass.instructor.charAt(0)}
              </div>

              <div className="class-detail-profile-info">
                <strong>{danceClass.instructor}</strong>

                <span>Instructor de danza</span>

                <small>{danceClass.instructorEmail}</small>
              </div>
            </div>
          </div>

          {/* ACADEMIA */}

          <div className="class-detail-card">
            <div className="class-detail-section-title">
              <div className="class-detail-section-icon">⌂</div>

              <div>
                <h2>Academia</h2>

                <p>Lugar donde se realiza la clase.</p>
              </div>
            </div>

            <div className="class-detail-academy">
              <strong>{danceClass.academy}</strong>

              <span>📍 {danceClass.academyAddress}</span>

              <span>{danceClass.city}</span>

              <button type="button" onClick={() => navigate("/academias/1")}>
                Ver academia →
              </button>
            </div>
          </div>
        </section>

        {/* =========================
            REQUISITOS
        ========================= */}

        <section className="class-detail-requirements class-detail-card">
          <div className="class-detail-section-title">
            <div className="class-detail-section-icon">✓</div>

            <div>
              <h2>Antes de inscribirte</h2>

              <p>Ten en cuenta estas recomendaciones.</p>
            </div>
          </div>

          <div className="class-detail-requirements-list">
            {danceClass.requirements.map((requirement, index) => (
              <div className="class-detail-requirement" key={index}>
                <span>✓</span>

                <p>{requirement}</p>
              </div>
            ))}
          </div>
        </section>

        {/* =========================
            AVISO DE INSCRIPCIÓN
        ========================= */}

        <section className="class-detail-notice">
          <div className="class-detail-notice-icon">♫</div>

          <div className="class-detail-notice-text">
            <h2>¿Listo para comenzar?</h2>

            <p>
              Inscríbete en esta clase para reservar tu cupo y continuar con el
              proceso de pago.
            </p>
          </div>

          <button
            type="button"
            className="class-detail-notice-button"
            onClick={handleEnroll}
            disabled={danceClass.available <= 0}
          >
            Inscribirme
          </button>
        </section>
      </main>

      {/* =========================
          FOOTER
      ========================= */}

      <footer className="class-detail-footer">
        <div className="class-detail-footer-container">
          <div className="class-detail-footer-brand">
            <strong>
              Danzas<span>.app</span>
            </strong>

            <p>Conectando personas con la danza.</p>
          </div>

          <div className="class-detail-footer-links">
            <button type="button" onClick={() => navigate("/")}>
              Inicio
            </button>

            <button type="button" onClick={() => navigate("/academias")}>
              Academias
            </button>

            <button type="button" onClick={() => navigate("/clases")}>
              Clases
            </button>

            <button type="button" onClick={() => navigate("/login")}>
              Iniciar sesión
            </button>
          </div>
        </div>

        <div className="class-detail-footer-bottom">
          © 2026 Danzas.app. Todos los derechos reservados.
        </div>
      </footer>

      {/* =========================
          CONFIRMACIÓN
      ========================= */}

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmEnrollment}
        title="¿Deseas inscribirte?"
        message={`Vas a iniciar el proceso de inscripción para "${danceClass.name}". El cupo será reservado temporalmente mientras realizas el pago.`}
        confirmText="Continuar"
        cancelText="Cancelar"
        type="info"
      />

      {/* =========================
          LOGIN MODAL
      ========================= */}

      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Inicia sesión para continuar"
        size="small"
      >
        <div className="class-detail-login-modal">
          <div className="class-detail-login-modal-icon">♫</div>

          <h3>Necesitas una cuenta</h3>

          <p>
            Para inscribirte en una clase y realizar el pago debes iniciar
            sesión o crear una cuenta en Danzas.app.
          </p>

          <div className="class-detail-login-modal-actions">
            <button
              type="button"
              className="class-detail-modal-login"
              onClick={handleLogin}
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              className="class-detail-modal-register"
              onClick={handleRegister}
            >
              Crear cuenta
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ClassDetail;
