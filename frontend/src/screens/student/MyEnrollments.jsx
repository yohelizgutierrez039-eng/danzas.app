import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/common/Loading/Loading";
import ErrorMessage from "../../components/common/ErrorMessage/ErrorMessage";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import useAuth from "../../hooks/useAuth";
import { getEnrollmentHistory } from "../../services/enrollments.service";
import "./MyEnrollments.css";

const STATUS_LABELS = {
  confirmada: "Confirmada",
  pendiente_pago: "Pago pendiente",
  cancelada: "Cancelada",
};

const PAYMENT_LABELS = {
  aprobado: "Pagado",
  pendiente: "Pendiente",
  rechazado: "Rechazado",
};

function MyEnrollments() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;

  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) {
      return;
    }

    const loadEnrollments = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getEnrollmentHistory(userId);

        setEnrollments(Array.isArray(data) ? data : data?.enrollments || []);
      } catch (err) {
        setError(err.message || "No fue posible cargar tus inscripciones.");
      } finally {
        setLoading(false);
      }
    };

    loadEnrollments();
  }, [userId]);

  const getClassName = (enrollment) =>
    enrollment.clase?.tipoBaile ||
    enrollment.class_name ||
    enrollment.nombre_clase ||
    "Clase de danza";

  const getDate = (enrollment) => {
    const rawDate =
      enrollment.creadoEn || enrollment.created_at || enrollment.date;

    if (!rawDate) {
      return "Sin fecha disponible";
    }

    try {
      return new Date(rawDate).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Sin fecha disponible";
    }
  };

  const getStatusLabel = (enrollment) => {
    const status = enrollment.estado || enrollment.status;
    return STATUS_LABELS[status] || status || "Sin estado";
  };

  const getPaymentLabel = (enrollment) => {
    const paymentStatus = enrollment.pago?.estado || enrollment.payment_status;
    return PAYMENT_LABELS[paymentStatus] || paymentStatus || "Sin información";
  };

  const getAttendanceLabel = (enrollment) => {
    const attendances = enrollment.asistencias || enrollment.attendances;

    if (!Array.isArray(attendances) || attendances.length === 0) {
      return "Sin registros de asistencia";
    }

    const attended = attendances.filter(
      (item) => item.asistio ?? item.attended,
    ).length;

    return `${attended} de ${attendances.length} sesiones`;
  };

  if (!userId) {
    return (
      <div className="my-enrollments">
        <ErrorMessage
          title="No se pudo identificar al usuario"
          message="No fue posible identificar al usuario autenticado."
        />
      </div>
    );
  }

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
            Consulta el historial de las clases en las que te has inscrito y
            revisa el estado de tus pagos y asistencias.
          </p>
        </div>

        <button
          type="button"
          className="explore-classes-button"
          onClick={() => navigate("/estudiante/clases")}
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
          description="Todavía no estás inscrito en ninguna clase de danza."
          actionText="Explorar clases"
          onAction={() => navigate("/estudiante/clases")}
        />
      ) : (
        <div className="enrollments-list">
          {enrollments.map((enrollment) => (
            <article
              className="enrollment-card"
              key={enrollment.id || enrollment.enrollment_id}
            >
              <div className="enrollment-card-header">
                <h2>{getClassName(enrollment)}</h2>

                <span
                  className={`enrollment-status enrollment-status-${
                    enrollment.estado || enrollment.status || "pendiente"
                  }`}
                >
                  {getStatusLabel(enrollment)}
                </span>
              </div>

              <div className="enrollment-details">
                <div className="enrollment-detail">
                  <span>Fecha de inscripción</span>
                  <strong>{getDate(enrollment)}</strong>
                </div>

                <div className="enrollment-detail">
                  <span>Estado del pago</span>
                  <strong>{getPaymentLabel(enrollment)}</strong>
                </div>

                <div className="enrollment-detail">
                  <span>Asistencia</span>
                  <strong>{getAttendanceLabel(enrollment)}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyEnrollments;
