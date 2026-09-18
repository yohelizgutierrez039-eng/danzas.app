import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/Loading/Loading";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import EmptyState from "../../components/EmptyState/EmptyState";
import api from "../../services/api";
import "./MyEnrollments.css";

function MyEnrollments() {
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEnrollments = async () => {
      try {
        setLoading(true);
        setError("");

        // Endpoint definido para consultar las inscripciones
        const data = await api("/users/me/enrollments");

        setEnrollments(Array.isArray(data) ? data : data?.enrollments || []);
      } catch (err) {
        setError(err.message || "No fue posible cargar tus inscripciones.");
      } finally {
        setLoading(false);
      }
    };

    loadEnrollments();
  }, []);

  const getStatusLabel = (status) => {
    const statuses = {
      active: "Activa",
      pending: "Pendiente",
      cancelled: "Cancelada",
      completed: "Finalizada",
    };

    return statuses[status] || status || "Sin estado";
  };

  const getPaymentLabel = (status) => {
    const statuses = {
      paid: "Pagado",
      pending: "Pendiente",
      failed: "Fallido",
    };

    return statuses[status] || status || "Sin información";
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) {
      return "No disponible";
    }

    return `$${Number(price).toLocaleString("es-CO")}`;
  };

  if (loading) {
    return (
      <div className="my-enrollments-loading">
        <Loading text="Cargando tus inscripciones..." />
      </div>
    );
  }

  return (
    <div className="my-enrollments">
      <header className="my-enrollments-header">
        <div>
          <span className="my-enrollments-eyebrow">ESTUDIANTE</span>

          <h1>Mis inscripciones</h1>

          <p>
            Consulta las clases en las que estás inscrito y revisa el estado de
            tus pagos.
          </p>
        </div>

        <button
          type="button"
          className="explore-classes-button"
          onClick={() => navigate("/clases")}
        >
          + Explorar clases
        </button>
      </header>

      {error && (
        <ErrorMessage
          title="No se pudieron cargar las inscripciones"
          message={error}
          onClose={() => setError("")}
        />
      )}

      {enrollments.length === 0 ? (
        <EmptyState
          title="No tienes inscripciones"
          message="Todavía no estás inscrito en ninguna clase de danza."
          action={
            <button type="button" onClick={() => navigate("/clases")}>
              Explorar clases
            </button>
          }
        />
      ) : (
        <div className="enrollments-list">
          {enrollments.map((enrollment) => {
            const classId = enrollment.class_id || enrollment.clase_id;

            const enrollmentId = enrollment.id || enrollment.enrollment_id;

            return (
              <article
                className="enrollment-card"
                key={enrollmentId || classId}
              >
                <div className="enrollment-card-header">
                  <div>
                    <span className="enrollment-dance-type">
                      {enrollment.dance_type ||
                        enrollment.tipo_danza ||
                        "Danza"}
                    </span>

                    <h2>
                      {enrollment.class_name ||
                        enrollment.nombre_clase ||
                        "Clase de danza"}
                    </h2>

                    <p className="enrollment-academy">
                      🏫{" "}
                      {enrollment.academy ||
                        enrollment.academia ||
                        "Academia no disponible"}
                    </p>
                  </div>

                  <span
                    className={`enrollment-status enrollment-status-${
                      enrollment.status || "pending"
                    }`}
                  >
                    {getStatusLabel(enrollment.status)}
                  </span>
                </div>

                <div className="enrollment-details">
                  <div className="enrollment-detail">
                    <span>👤 Instructor</span>
                    <strong>{enrollment.instructor || "No disponible"}</strong>
                  </div>

                  <div className="enrollment-detail">
                    <span>📅 Horario</span>
                    <strong>{enrollment.schedule || "No disponible"}</strong>
                  </div>

                  <div className="enrollment-detail">
                    <span>📍 Ciudad</span>
                    <strong>{enrollment.city || "No disponible"}</strong>
                  </div>

                  <div className="enrollment-detail">
                    <span>💻 Modalidad</span>
                    <strong>{enrollment.modality || "No disponible"}</strong>
                  </div>
                </div>

                <div className="enrollment-card-footer">
                  <div className="enrollment-price">
                    <span>Mensualidad</span>

                    <strong>
                      {formatPrice(enrollment.price || enrollment.precio)}
                    </strong>
                  </div>

                  <div
                    className={`payment-status payment-status-${
                      enrollment.payment_status || "pending"
                    }`}
                  >
                    <span>Pago:</span>

                    <strong>
                      {getPaymentLabel(enrollment.payment_status)}
                    </strong>
                  </div>

                  {classId && (
                    <button
                      type="button"
                      className="view-class-button"
                      onClick={() => navigate(`/estudiante/clases/${classId}`)}
                    >
                      Ver clase
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyEnrollments;
