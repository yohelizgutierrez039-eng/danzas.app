import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Loading from "../../components/common/Loading/Loading";
import ErrorMessage from "../../components/common/ErrorMessage/ErrorMessage";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import ConfirmDialog from "../../components/common/ConfirmDialog/ConfirmDialog";

import useClasses from "../../hooks/useClasses";

import "./MyClasses.css";

function MyClasses() {
  const navigate = useNavigate();

  const { classes, loading, error, getMine, remove, clearError } =
    useClasses();

  const [classToCancel, setClassToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    getMine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(Number(price) || 0);
  };

  const getStatusText = (status) => {
    switch (status) {
      case "published":
        return "Publicada";
      case "draft":
        return "Borrador";
      case "inactive":
        return "Inactiva";
      default:
        return "Sin estado";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "published":
        return "status-published";
      case "draft":
        return "status-draft";
      case "inactive":
        return "status-inactive";
      default:
        return "";
    }
  };

  const totalStudents = classes.reduce(
    (total, item) => total + Number(item.enrolled_count || 0),
    0,
  );

  const publishedClasses = classes.filter(
    (item) => item.status === "published",
  ).length;

  const handleRequestCancel = (danceClass) => {
    setCancelError("");
    setClassToCancel(danceClass);
  };

  const handleConfirmCancel = async () => {
    if (!classToCancel) return;

    try {
      setCancelling(true);
      setCancelError("");

      await remove(classToCancel.id);

      setClassToCancel(null);
    } catch (err) {
      setCancelError(
        err?.message || "No se pudo cancelar la clase. Inténtalo nuevamente.",
      );
    } finally {
      setCancelling(false);
    }
  };

  if (loading && classes.length === 0) {
    return <Loading text="Cargando tus clases..." fullScreen />;
  }

  return (
    <div className="my-classes">
      <div className="my-classes-header">
        <div>
          <span className="page-badge">Instructor</span>

          <h1>Mis clases</h1>

          <p>
            Administra las clases que has creado y consulta la información de
            tus estudiantes.
          </p>
        </div>

        <button
          type="button"
          className="new-class-button"
          onClick={() => navigate("/instructor/clases/nueva")}
        >
          + Nueva clase
        </button>
      </div>

      {error && (
        <ErrorMessage
          message={error.message || "No fue posible cargar tus clases."}
          onClose={clearError}
        />
      )}

      <div className="classes-summary">
        <div className="summary-card">
          <div className="summary-icon">📚</div>

          <div>
            <strong>{classes.length}</strong>
            <span>Total de clases</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">✓</div>

          <div>
            <strong>{publishedClasses}</strong>
            <span>Clases publicadas</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">👥</div>

          <div>
            <strong>{totalStudents}</strong>
            <span>Estudiantes inscritos</span>
          </div>
        </div>
      </div>

      <section className="classes-section">
        <div className="section-title">
          <div>
            <h2>Clases creadas</h2>
            <p>Consulta, edita y administra tus clases.</p>
          </div>
        </div>

        {classes.length === 0 ? (
          <EmptyState
            icon="💃"
            title="No tienes clases todavía"
            description="Crea tu primera clase para comenzar a ofrecer tus clases de danza."
            actionText="Crear nueva clase"
            onAction={() => navigate("/instructor/clases/nueva")}
          />
        ) : (
          <div className="classes-table-container">
            <table className="classes-table">
              <thead>
                <tr>
                  <th>Clase</th>
                  <th>Tipo</th>
                  <th>Modalidad</th>
                  <th>Horario</th>
                  <th>Estudiantes</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {classes.map((danceClass) => (
                  <tr key={danceClass.id}>
                    <td>
                      <div className="class-name-cell">
                        <strong>{danceClass.name}</strong>

                        <small>{danceClass.city}</small>
                      </div>
                    </td>

                    <td>{danceClass.dance_type}</td>

                    <td>
                      <span className="modality-badge">
                        {danceClass.modality}
                      </span>
                    </td>

                    <td>
                      <div className="schedule-cell">
                        <strong>{danceClass.schedule}</strong>

                        <span>{danceClass.duration}</span>
                      </div>
                    </td>

                    <td>
                      <div className="students-cell">
                        <strong>{danceClass.enrolled_count || 0}</strong>
                        <span>/ {danceClass.capacity}</span>
                      </div>
                    </td>

                    <td>
                      <strong className="price">
                        {formatPrice(danceClass.price)}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          danceClass.status,
                        )}`}
                      >
                        {getStatusText(danceClass.status)}
                      </span>
                    </td>

                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/instructor/clases/${danceClass.id}`)
                          }
                        >
                          Ver
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/instructor/clases/${danceClass.id}/editar`,
                            )
                          }
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className="action-button-danger"
                          onClick={() => handleRequestCancel(danceClass)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmDialog
        isOpen={Boolean(classToCancel)}
        title="Cancelar clase"
        message={
          cancelError ||
          `¿Estás seguro de que deseas cancelar "${
            classToCancel?.name || ""
          }"? Esta acción no se puede deshacer.`
        }
        confirmText="Sí, cancelar"
        cancelText="Volver"
        variant="danger"
        loading={cancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setClassToCancel(null)}
      />
    </div>
  );
}

export default MyClasses;
