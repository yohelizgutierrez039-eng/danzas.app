import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/common/Loading/Loading";
import ErrorMessage from "../../components/common/ErrorMessage/ErrorMessage";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import useAuth from "../../hooks/useAuth";
import { getEnrollmentHistory } from "../../services/enrollments.service";
import "./MyEnrollmentsParent.css";

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

function MyEnrollmentsParent() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const menores = useMemo(() => user?.menores || [], [user]);

  const [selectedMenorId, setSelectedMenorId] = useState(
    () => menores[0]?.id || "",
  );
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(Boolean(selectedMenorId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedMenorId) {
      return;
    }

    const loadEnrollments = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getEnrollmentHistory(selectedMenorId);

        setEnrollments(Array.isArray(data) ? data : data?.enrollments || []);
      } catch (err) {
        setError(err.message || "No fue posible cargar las inscripciones.");
      } finally {
        setLoading(false);
      }
    };

    loadEnrollments();
  }, [selectedMenorId]);

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

  const selectedMenor = menores.find((menor) => menor.id === selectedMenorId);

  if (menores.length === 0) {
    return (
      <div className="my-enrollments-parent">
        <header className="my-enrollments-parent-header">
          <div>
            <span className="parent-enrollments-eyebrow">
              PADRE DE FAMILIA
            </span>

            <h1>Inscripciones de mis hijos</h1>
          </div>
        </header>

        <EmptyState
          title="No tienes menores registrados"
          description="Registra a tus hijos para poder inscribirlos en clases y ver su historial."
          actionText="Registrar menor"
          onAction={() => navigate("/padre/dependientes")}
        />
      </div>
    );
  }

  return (
    <div className="my-enrollments-parent">
      <header className="my-enrollments-parent-header">
        <div>
          <span className="parent-enrollments-eyebrow">PADRE DE FAMILIA</span>

          <h1>Inscripciones de mis hijos</h1>

          <p>
            Consulta el historial de inscripciones de cada uno de tus hijos y
            revisa el estado de sus pagos y asistencias.
          </p>
        </div>

        <button
          type="button"
          className="parent-explore-button"
          onClick={() => navigate("/padre/clases")}
        >
          + Inscribir en una clase
        </button>
      </header>

      <section className="parent-enrollments-filter">
        <div>
          <h2>Filtrar por hijo/a</h2>
          <p>Selecciona de quién quieres consultar el historial.</p>
        </div>

        <select
          value={selectedMenorId}
          onChange={(event) => setSelectedMenorId(event.target.value)}
        >
          {menores.map((menor) => (
            <option key={menor.id} value={menor.id}>
              {menor.nombre}
            </option>
          ))}
        </select>
      </section>

      {error && (
        <ErrorMessage
          title="Error al cargar las inscripciones"
          message={error}
          onClose={() => setError("")}
        />
      )}

      {loading ? (
        <div className="my-enrollments-parent-loading">
          <Loading text="Cargando inscripciones..." />
        </div>
      ) : enrollments.length === 0 ? (
        <EmptyState
          title="No hay inscripciones"
          description={`${
            selectedMenor?.nombre || "Este hijo/a"
          } todavía no tiene inscripciones registradas.`}
          actionText="Explorar clases"
          onAction={() => navigate("/padre/clases")}
        />
      ) : (
        <section className="parent-enrollments-list">
          {enrollments.map((enrollment) => (
            <article
              className="parent-enrollment-card"
              key={enrollment.id || enrollment.enrollment_id}
            >
              <div className="parent-enrollment-header">
                <h2>{getClassName(enrollment)}</h2>

                <span
                  className={`parent-enrollment-status status-${
                    enrollment.estado || enrollment.status || "pendiente"
                  }`}
                >
                  {getStatusLabel(enrollment)}
                </span>
              </div>

              <div className="parent-class-details">
                <div>
                  <span>Fecha de inscripción</span>
                  <strong>{getDate(enrollment)}</strong>
                </div>

                <div>
                  <span>Estado del pago</span>
                  <strong>{getPaymentLabel(enrollment)}</strong>
                </div>

                <div>
                  <span>Asistencia</span>
                  <strong>{getAttendanceLabel(enrollment)}</strong>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

export default MyEnrollmentsParent;
