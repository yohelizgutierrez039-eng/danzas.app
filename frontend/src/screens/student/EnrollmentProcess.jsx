import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../components/Loading/Loading";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import api from "../../services/api";
import "./EnrollmentProcess.css";

function EnrollmentProcess() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");

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
       * setClassData(data);
       */

      // Datos temporales para la interfaz.
      setClassData({
        id,
        name: "Salsa Básica",
        type: "Salsa",
        academy: "Academia Ritmo Caribe",
        instructor: "Carlos Rodríguez",
        city: "Barranquilla",
        modality: "Presencial",
        schedule: "Lunes y miércoles",
        time: "6:00 PM - 7:30 PM",
        startDate: "20 de septiembre de 2026",
        duration: "1 hora y 30 minutos",
        price: 80000,
      });
    } catch (err) {
      setError(err.message || "No fue posible cargar la información.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollment = async () => {
    try {
      setEnrolling(true);
      setError("");

      const response = await api("/enrollments", {
        method: "POST",
        body: JSON.stringify({
          class_id: classData.id,
        }),
      });

      /*
       * El backend puede devolver paymentUrl
       * para continuar con el pago.
       */
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
    return <Loading text="Preparando inscripción..." />;
  }

  if (!classData) {
    return (
      <div className="enrollment-process">
        <ErrorMessage message="No se encontró la clase." type="error" />
      </div>
    );
  }

  return (
    <div className="enrollment-process">
      <div className="enrollment-process-container">
        <button
          type="button"
          className="enrollment-back"
          onClick={() => navigate(`/estudiante/clases/${id}`)}
        >
          ← Volver al detalle
        </button>

        <div className="enrollment-header">
          <span>Inscripción</span>
          <h1>Confirma tu inscripción</h1>
          <p>Revisa la información antes de continuar con el pago.</p>
        </div>

        {error && (
          <ErrorMessage
            message={error}
            type="error"
            onClose={() => setError("")}
          />
        )}

        <div className="enrollment-layout">
          <main className="enrollment-main">
            <section className="enrollment-card">
              <div className="enrollment-card-title">
                <div className="enrollment-class-icon">
                  {classData.name.charAt(0)}
                </div>

                <div>
                  <h2>{classData.name}</h2>
                  <span>{classData.type}</span>
                </div>
              </div>

              <div className="enrollment-details">
                <div>
                  <span>Academia</span>
                  <strong>{classData.academy}</strong>
                </div>

                <div>
                  <span>Instructor</span>
                  <strong>{classData.instructor}</strong>
                </div>

                <div>
                  <span>Ciudad</span>
                  <strong>{classData.city}</strong>
                </div>

                <div>
                  <span>Modalidad</span>
                  <strong>{classData.modality}</strong>
                </div>

                <div>
                  <span>Horario</span>
                  <strong>{classData.schedule}</strong>
                  <small>{classData.time}</small>
                </div>

                <div>
                  <span>Fecha de inicio</span>
                  <strong>{classData.startDate}</strong>
                </div>

                <div>
                  <span>Duración</span>
                  <strong>{classData.duration}</strong>
                </div>
              </div>
            </section>

            <section className="enrollment-card enrollment-payment-info">
              <h2>Proceso de pago</h2>

              <p>
                Al confirmar la inscripción serás dirigido al proveedor de pago
                para completar el proceso.
              </p>

              <div className="payment-security">
                <span>🔒</span>
                <div>
                  <strong>Pago seguro</strong>
                  <p>
                    El pago será procesado mediante el proveedor externo
                    configurado por Danzas.app.
                  </p>
                </div>
              </div>
            </section>
          </main>

          <aside className="enrollment-summary">
            <h2>Resumen</h2>

            <div className="summary-class">
              <span>Clase</span>
              <strong>{classData.name}</strong>
            </div>

            <div className="summary-row">
              <span>Inscripción</span>
              <strong>${classData.price.toLocaleString("es-CO")}</strong>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-total">
              <span>Total</span>
              <strong>${classData.price.toLocaleString("es-CO")}</strong>
            </div>

            <button
              type="button"
              className="enrollment-confirm-button"
              onClick={handleEnrollment}
              disabled={enrolling}
            >
              {enrolling ? "Procesando..." : "Confirmar y continuar al pago"}
            </button>

            <p className="summary-note">
              Al continuar confirmas que deseas inscribirte en esta clase.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default EnrollmentProcess;
