import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/common/Loading/Loading";
import ErrorMessage from "../../components/common/ErrorMessage/ErrorMessage";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import ConfirmDialog from "../../components/common/ConfirmDialog/ConfirmDialog";
import {
  cancelEnrollment,
  getEnrollmentHistory,
} from "../../services/enrollments.service";
import Select from "../../components/common/Select/Select";
import { getDependents } from "../../services/users.service";
import { formatearHorario } from "../../utils/formatDate";
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

const getClassName = (enrollment) =>
  enrollment.clase?.tipoBaile || "Clase de danza";

const getDate = (enrollment) =>
  new Date(enrollment.creadoEn).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const getPaymentLabel = (enrollment) => {
  if (enrollment.pago?.reembolsado) {
    return "Reembolsado";
  }

  const paymentStatus = enrollment.pago?.estado;

  return PAYMENT_LABELS[paymentStatus] || paymentStatus || "Sin información";
};

const getAttendanceLabel = (enrollment) => {
  const attendances = enrollment.asistencias;

  if (!Array.isArray(attendances) || attendances.length === 0) {
    return "Sin registros de asistencia";
  }

  const attended = attendances.filter((item) => item.asistio).length;

  return `${attended} de ${attendances.length} sesiones`;
};

function MyEnrollmentsParent() {
  const navigate = useNavigate();

  const [dependents, setDependents] = useState([]);
  const [dependentsLoading, setDependentsLoading] = useState(true);
  const [dependentsError, setDependentsError] = useState("");

  const [chosenId, setChosenId] = useState("");
  const [enrollments, setEnrollments] = useState([]);
  // Hijo cuyas inscripciones ya terminaron de cargar (con exito o error).
  const [loadedMenorId, setLoadedMenorId] = useState("");
  const [error, setError] = useState("");

  // RF-018: cancelacion con aviso de reembolso.
  const [enrollmentToCancel, setEnrollmentToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelNotice, setCancelNotice] = useState("");

  // Mientras el padre no elige, se consulta el primer hijo.
  const selectedMenorId = chosenId || dependents[0]?.id;
  const selectedMenor = dependents.find(
    (menor) => menor.id === selectedMenorId,
  );
  const loading = loadedMenorId !== selectedMenorId;

  useEffect(() => {
    const loadDependents = async () => {
      try {
        const data = await getDependents();

        setDependents(data.dependents ?? []);
      } catch (err) {
        setDependentsError(err.message || "No se pudieron cargar los menores.");
      } finally {
        setDependentsLoading(false);
      }
    };

    loadDependents();
  }, []);

  // GET /users/:menorId/enrollments
  useEffect(() => {
    if (!selectedMenorId) {
      return;
    }

    let cancelled = false;

    const loadEnrollments = async () => {
      try {
        const data = await getEnrollmentHistory(selectedMenorId);

        if (!cancelled) {
          setEnrollments(Array.isArray(data) ? data : data?.enrollments || []);
        }
      } catch (err) {
        if (!cancelled) {
          setEnrollments([]);
          setError(err.message || "No fue posible cargar las inscripciones.");
        }
      } finally {
        if (!cancelled) {
          setLoadedMenorId(selectedMenorId);
        }
      }
    };

    loadEnrollments();

    return () => {
      cancelled = true;
    };
  }, [selectedMenorId]);

  const handleSelectMenor = (event) => {
    setChosenId(event.target.value);
    setError("");
    setCancelNotice("");
  };

  // DELETE /enrollments/:id -> { cancelada, reembolsado }
  const handleConfirmCancel = async () => {
    if (!enrollmentToCancel) {
      return;
    }

    const enrollmentId = enrollmentToCancel.id;

    try {
      setCancelling(true);
      setError("");
      setCancelNotice("");

      const result = await cancelEnrollment(enrollmentId);

      setEnrollments((current) =>
        current.map((item) =>
          item.id === enrollmentId
            ? {
                ...item,
                estado: "cancelada",
                pago: item.pago && {
                  ...item.pago,
                  reembolsado: Boolean(result?.reembolsado),
                },
              }
            : item,
        ),
      );

      setCancelNotice(
        result?.reembolsado
          ? `La inscripción de ${selectedMenor.nombre} fue cancelada y el pago será reembolsado.`
          : `La inscripción de ${selectedMenor.nombre} fue cancelada. No aplica reembolso porque faltaban menos de 2 horas para la clase.`,
      );
      setEnrollmentToCancel(null);
    } catch (err) {
      setError(err.message || "No fue posible cancelar la inscripción.");
      setEnrollmentToCancel(null);
    } finally {
      setCancelling(false);
    }
  };

  if (dependentsLoading) {
    return (
      <div className="my-enrollments-parent-loading">
        <Loading text="Cargando menores..." />
      </div>
    );
  }

  const renderEnrollments = () => {
    if (loading) {
      return (
        <div className="my-enrollments-parent-loading">
          <Loading text="Cargando inscripciones..." />
        </div>
      );
    }

    if (enrollments.length === 0) {
      return (
        <EmptyState
          title="No hay inscripciones"
          description={`${selectedMenor.nombre} todavía no tiene inscripciones registradas.`}
          actionText="Explorar clases"
          onAction={() => navigate("/padre/clases")}
        />
      );
    }

    return (
      <section className="parent-enrollments-list">
        {enrollments.map((enrollment) => (
          <article className="parent-enrollment-card" key={enrollment.id}>
            <div className="parent-enrollment-header">
              <h2>{getClassName(enrollment)}</h2>

              <span
                className={`parent-enrollment-status status-${enrollment.estado}`}
              >
                {STATUS_LABELS[enrollment.estado] || enrollment.estado}
              </span>
            </div>

            <div className="parent-class-details">
              <div>
                <span>Horario</span>

                {enrollment.clase.horarios.map((horario) => (
                  <strong key={horario.id}>{formatearHorario(horario)}</strong>
                ))}
              </div>

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

            {enrollment.estado === "pendiente_pago" && (
              <div className="parent-enrollment-actions">
                <button
                  type="button"
                  className="parent-enrollment-pay-button"
                  onClick={() =>
                    navigate(`/padre/inscripciones/${enrollment.id}/pago`, {
                      state: { enrollment },
                    })
                  }
                >
                  Completar pago
                </button>
              </div>
            )}

            {enrollment.estado === "confirmada" && (
              <div className="parent-enrollment-actions">
                <button
                  type="button"
                  className="parent-enrollment-cancel-button"
                  onClick={() => setEnrollmentToCancel(enrollment)}
                >
                  Cancelar inscripción
                </button>
              </div>
            )}
          </article>
        ))}
      </section>
    );
  };

  const renderContent = () => {
    if (dependentsError) {
      return (
        <ErrorMessage
          title="No se pudieron cargar los menores"
          message={dependentsError}
        />
      );
    }

    if (dependents.length === 0) {
      return (
        <EmptyState
          title="No tienes menores registrados"
          description="Registra a tus hijos para poder inscribirlos en clases y ver su historial."
          actionText="Registrar menor"
          onAction={() => navigate("/padre/menores/nuevo")}
        />
      );
    }

    return (
      <>
        <section className="parent-enrollments-filter">
          <div>
            <h2>Filtrar por hijo/a</h2>
            <p>Selecciona de quién quieres consultar el historial.</p>
          </div>

          <Select
            label="Hijo/a"
            name="menorId"
            value={selectedMenorId}
            onChange={handleSelectMenor}
            placeholder=""
            options={dependents.map((menor) => ({
              value: menor.id,
              label: menor.nombre,
            }))}
            fullWidth={false}
          />
        </section>

        {error && (
          <ErrorMessage
            title="No se pudo completar la operación"
            message={error}
            onClose={() => setError("")}
          />
        )}

        {cancelNotice && (
          <ErrorMessage
            title="Inscripción cancelada"
            message={cancelNotice}
            type="success"
            onClose={() => setCancelNotice("")}
          />
        )}

        {renderEnrollments()}
      </>
    );
  };

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

      {renderContent()}

      <ConfirmDialog
        isOpen={Boolean(enrollmentToCancel)}
        title="Cancelar inscripción"
        message={`¿Seguro que quieres cancelar la inscripción de ${
          selectedMenor?.nombre
        } en "${
          enrollmentToCancel ? getClassName(enrollmentToCancel) : ""
        }"? Si faltan 2 horas o más para la próxima sesión, el pago será reembolsado. Si falta menos tiempo, no se realizará el reembolso.`}
        confirmText="Sí, cancelar"
        cancelText="Mantener inscripción"
        variant="danger"
        loading={cancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => !cancelling && setEnrollmentToCancel(null)}
      />
    </div>
  );
}

export default MyEnrollmentsParent;
