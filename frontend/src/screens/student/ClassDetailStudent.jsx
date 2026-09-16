import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../components/common/Loading/Loading";
import ErrorMessage from "../../components/common/ErrorMessage/ErrorMessage";
import ConfirmDialog from "../../components/common/ConfirmDialog/ConfirmDialog";
import api from "../../api/api";
import "./ClassDetailStudent.css";

function ClassDetailStudent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [danceClass, setDanceClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");

  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    loadClass();
  }, [id]);

  const loadClass = async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * Cuando esté disponible el endpoint del backend:
       *
       * const data = await api(`/classes/${id}`);
       * setDanceClass(data);
       */

      // Datos temporales.
      setDanceClass({
        id,
        name: "Salsa Básica",
        type: "Salsa",
        modality: "Presencial",
        city: "Barranquilla",
        academy: "Academia Ritmo Caribe",
        instructor: "Carlos Rodríguez",
        description:
          "Clase diseñada para aprender los pasos básicos de salsa y desarrollar ritmo y coordinación.",
        schedule: "Lunes y miércoles",
        time: "6:00 PM - 7:30 PM",
        duration: "1 hora y 30 minutos",
        startDate: "20 de septiembre de 2026",
        capacity: 20,
        availableSpots: 8,
        price: 80000,
        requirements: "No se requiere experiencia previa. Llevar ropa cómoda.",
        enrolled: false,
      });
    } catch (err) {
      setError(
        err.message || "No fue posible cargar la información de la clase.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = () => {
    if (danceClass?.enrolled) {
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirmEnrollment = async () => {
    try {
      setEnrolling(true);
      setError("");

      /*
       * Endpoint definido en el proyecto:
       *
       * POST /enrollments
       *
       * Ejemplo:
       *
       * const response = await api("/enrollments", {
       *   method: "POST",
       *   body: JSON.stringify({
       *     class_id: danceClass.id,
       *   }),
       * });
       *
       * El backend puede devolver una URL
       * para continuar con el pago.
       */

      const response = await api("/enrollments", {
        method: "POST",
        body: JSON.stringify({
          class_id: danceClass.id,
        }),
      });

      setShowConfirm(false);

      if (response?.paymentUrl) {
        window.location.href = response.paymentUrl;
        return;
      }

      navigate("/estudiante/inscripciones");
    } catch (err) {
      setError(err.message || "No fue posible realizar la inscripción.");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <Loading text="Cargando clase..." />;
  }

  if (!danceClass) {
    return (
      <div className="class-detail-student">
        <ErrorMessage message="No se encontró la clase." type="error" />
      </div>
    );
  }

  return (
    <div className="class-detail-student">
      <div className="class-detail-student-header">
        <button
          type="button"
          className="student-back-button"
          onClick={() => navigate("/estudiante/clases")}
        >
          ← Volver a mis clases
        </button>

        <div className="student-class-heading">
          <div>
            <span className="student-class-type">{danceClass.type}</span>

            <h1>{danceClass.name}</h1>

            <p>{danceClass.description}</p>
          </div>

          <span className="student-class-status">
            {danceClass.enrolled ? "✓ Inscrito" : "Disponible"}
          </span>
        </div>
      </div>

      {error && (
        <ErrorMessage
          message={error}
          type="error"
          onClose={() => setError("")}
        />
      )}

      <div className="class-detail-student-content">
        <div className="class-detail-student-main">
          <section className="student-detail-card">
            <h2>Información de la clase</h2>

            <div className="student-info-grid">
              <div>
                <span>📅 Horario</span>
                <strong>{danceClass.schedule}</strong>
                <p>{danceClass.time}</p>
              </div>

              <div>
                <span>⏱ Duración</span>
                <strong>{danceClass.duration}</strong>
              </div>

              <div>
                <span>📍 Ciudad</span>
                <strong>{danceClass.city}</strong>
              </div>

              <div>
                <span>🎭 Modalidad</span>
                <strong>{danceClass.modality}</strong>
              </div>

              <div>
                <span>📆 Fecha de inicio</span>
                <strong>{danceClass.startDate}</strong>
              </div>

              <div>
                <span>👥 Cupos disponibles</span>
                <strong>{danceClass.availableSpots}</strong>
              </div>
            </div>
          </section>

          <section className="student-detail-card">
            <h2>Academia e instructor</h2>

            <div className="student-academy-info">
              <div className="student-academy-icon">
                {danceClass.academy.charAt(0)}
              </div>

              <div>
                <strong>{danceClass.academy}</strong>
                <span>{danceClass.instructor}</span>
              </div>
            </div>
          </section>

          <section className="student-detail-card">
            <h2>Requisitos</h2>

            <p className="student-requirements">{danceClass.requirements}</p>
          </section>
        </div>

        <aside className="student-enrollment-card">
          <span>Valor de la clase</span>

          <strong className="student-price">
            ${danceClass.price.toLocaleString("es-CO")}
          </strong>

          <span className="student-price-label">por inscripción</span>

          <div className="student-spots">
            <span>Cupos disponibles</span>
            <strong>{danceClass.availableSpots}</strong>
          </div>

          <button
            type="button"
            className="student-enroll-button"
            onClick={handleEnroll}
            disabled={
              danceClass.enrolled || danceClass.availableSpots <= 0 || enrolling
            }
          >
            {danceClass.enrolled
              ? "Ya estás inscrito"
              : danceClass.availableSpots <= 0
                ? "Cupos agotados"
                : "Inscribirme"}
          </button>

          <p className="student-payment-note">
            Después de confirmar la inscripción podrás continuar con el proceso
            de pago.
          </p>
        </aside>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => !enrolling && setShowConfirm(false)}
        onConfirm={handleConfirmEnrollment}
        title="Confirmar inscripción"
        message={`¿Deseas inscribirte en "${danceClass.name}" por $${danceClass.price.toLocaleString(
          "es-CO",
        )}?`}
        confirmText="Confirmar inscripción"
        cancelText="Cancelar"
        type="success"
        loading={enrolling}
      />
    </div>
  );
}

export default ClassDetailStudent;
