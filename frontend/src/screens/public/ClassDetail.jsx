import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Modal from "../../../components/Modal/Modal";
import Loading from "../../../components/Loading/Loading";
import ErrorMessage from "../../../components/ErrorMessage/ErrorMessage";
import "./ClassDetail.css";

function ClassDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading] = useState(false);
  const [error, setError] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Datos temporales. Posteriormente vendrán del backend.
  const danceClass = {
    id,
    name: "Salsa Básica",
    type: "Salsa",
    modality: "Presencial",
    city: "Barranquilla",
    academy: "Academia Ritmo Caribe",
    academyId: 1,
    instructor: "Carlos Rodríguez",
    description:
      "Aprende los pasos básicos de salsa y desarrolla tu ritmo, coordinación y confianza mientras disfrutas de la danza.",
    schedule: "Lunes y miércoles",
    time: "6:00 PM - 7:30 PM",
    duration: "1 hora y 30 minutos",
    startDate: "20 de septiembre de 2026",
    capacity: 20,
    availableSpots: 8,
    price: 80000,
    requirements: "No se requiere experiencia previa. Llevar ropa cómoda.",
  };

  const handleEnroll = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setShowLoginModal(true);
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmEnrollment = async () => {
    try {
      setError("");

      /*
       * Próxima conexión con el backend:
       *
       * const response = await api("/enrollments", {
       *   method: "POST",
       *   body: JSON.stringify({
       *     class_id: danceClass.id,
       *   }),
       * });
       *
       * Después se utilizaría el paymentUrl
       * proporcionado por el backend.
       */

      setShowConfirmModal(false);

      navigate("/estudiante/inscripciones");
    } catch (err) {
      setError(err.message || "No fue posible realizar la inscripción.");
    }
  };

  if (loading) {
    return <Loading text="Cargando clase..." />;
  }

  return (
    <div className="class-detail-page">
      <div className="class-detail-container">
        <Link to="/clases" className="class-detail-back">
          ← Volver a clases
        </Link>

        {error && (
          <ErrorMessage
            message={error}
            type="error"
            onClose={() => setError("")}
          />
        )}

        <div className="class-detail-hero">
          <div className="class-detail-hero-content">
            <span className="class-detail-category">{danceClass.type}</span>

            <h1>{danceClass.name}</h1>

            <p className="class-detail-description">{danceClass.description}</p>

            <div className="class-detail-academy">
              <span>Academia</span>

              <Link to={`/academias/${danceClass.academyId}`}>
                {danceClass.academy}
              </Link>
            </div>
          </div>

          <div className="class-detail-price-card">
            <span>Precio</span>

            <strong>${danceClass.price.toLocaleString("es-CO")}</strong>

            <small>por inscripción</small>

            <button
              type="button"
              className="class-detail-enroll-button"
              onClick={handleEnroll}
              disabled={danceClass.availableSpots <= 0}
            >
              {danceClass.availableSpots > 0 ? "Inscribirme" : "Cupos agotados"}
            </button>

            <p className="class-detail-spots">
              {danceClass.availableSpots} cupos disponibles
            </p>
          </div>
        </div>

        <div className="class-detail-grid">
          <section className="class-detail-card">
            <h2>Información de la clase</h2>

            <div className="class-detail-info-grid">
              <div className="class-detail-info-item">
                <span>📅 Horario</span>
                <strong>{danceClass.schedule}</strong>
                <p>{danceClass.time}</p>
              </div>

              <div className="class-detail-info-item">
                <span>⏱ Duración</span>
                <strong>{danceClass.duration}</strong>
              </div>

              <div className="class-detail-info-item">
                <span>📍 Ciudad</span>
                <strong>{danceClass.city}</strong>
              </div>

              <div className="class-detail-info-item">
                <span>🎭 Modalidad</span>
                <strong>{danceClass.modality}</strong>
              </div>

              <div className="class-detail-info-item">
                <span>📆 Inicio</span>
                <strong>{danceClass.startDate}</strong>
              </div>

              <div className="class-detail-info-item">
                <span>👥 Capacidad</span>
                <strong>{danceClass.capacity} estudiantes</strong>
              </div>
            </div>
          </section>

          <section className="class-detail-card">
            <h2>Instructor</h2>

            <div className="class-detail-instructor">
              <div className="class-detail-avatar">
                {danceClass.instructor.charAt(0)}
              </div>

              <div>
                <strong>{danceClass.instructor}</strong>
                <span>Instructor de danza</span>
              </div>
            </div>
          </section>

          <section className="class-detail-card">
            <h2>Requisitos</h2>

            <p className="class-detail-requirements">
              {danceClass.requirements}
            </p>
          </section>
        </div>

        <div className="class-detail-bottom-cta">
          <div>
            <span>¿Listo para comenzar?</span>
            <h2>Reserva tu cupo en esta clase</h2>
          </div>

          <button
            type="button"
            onClick={handleEnroll}
            disabled={danceClass.availableSpots <= 0}
          >
            Inscribirme
          </button>
        </div>
      </div>

      {/* Modal para visitantes no autenticados */}
      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Inicia sesión para inscribirte"
        size="small"
        footer={
          <div className="class-detail-modal-actions">
            <button
              type="button"
              className="class-detail-modal-secondary"
              onClick={() => setShowLoginModal(false)}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="class-detail-modal-primary"
              onClick={() => navigate("/login")}
            >
              Iniciar sesión
            </button>
          </div>
        }
      >
        <p>
          Para inscribirte en una clase necesitas tener una cuenta en
          Danzas.app.
        </p>

        <p>
          Si todavía no tienes una cuenta, puedes registrarte gratuitamente.
        </p>

        <Link
          to="/registro"
          className="class-detail-register-link"
          onClick={() => setShowLoginModal(false)}
        >
          Crear una cuenta
        </Link>
      </Modal>

      {/* Confirmación de inscripción */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirmar inscripción"
        size="small"
        footer={
          <div className="class-detail-modal-actions">
            <button
              type="button"
              className="class-detail-modal-secondary"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="class-detail-modal-primary"
              onClick={handleConfirmEnrollment}
            >
              Confirmar inscripción
            </button>
          </div>
        }
      >
        <p>
          Vas a inscribirte en <strong>{danceClass.name}</strong>.
        </p>

        <div className="class-detail-confirm-info">
          <span>Precio</span>
          <strong>${danceClass.price.toLocaleString("es-CO")}</strong>
        </div>

        <p>Después de confirmar, continuarás con el proceso de pago.</p>
      </Modal>
    </div>
  );
}

export default ClassDetail;
