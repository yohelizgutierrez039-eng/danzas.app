import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Loading from "../../components/common/Loading/Loading";
import ErrorMessage from "../../components/common/ErrorMessage/ErrorMessage";
import ConfirmDialog from "../../components/common/ConfirmDialog/ConfirmDialog";

import useClasses from "../../hooks/useClasses";

import "./ClassDetailInstructor.css";

function ClassDetailInstructor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { getById, remove } = useClasses();

  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Asistencia: se mantiene en estado local porque todavía no existe
  // un endpoint de asistencia expuesto por el hook ni por classes.service.js.
  // TODO: falta backend RF-010
  const [attendance, setAttendance] = useState({});
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [attendanceSaved, setAttendanceSaved] = useState(false);

  useEffect(() => {
    const loadClass = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getById(id);

        setClassData(data);
      } catch (err) {
        setError(
          err?.message || "No se pudo cargar la información de la clase.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadClass();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // La lista de estudiantes inscritos, si el backend la incluye en el
  // detalle de la clase. Mientras no exista un endpoint dedicado, se
  // toma de forma defensiva desde distintas formas posibles de respuesta.
  const students = useMemo(() => {
    const list =
      classData?.students ||
      classData?.enrolled_students ||
      classData?.enrollments ||
      [];

    return Array.isArray(list) ? list : [];
  }, [classData]);

  const handleCancelClass = async () => {
    try {
      setCancelling(true);
      setError("");

      await remove(id);

      navigate("/instructor/clases");
    } catch (err) {
      setError(err?.message || "No se pudo cancelar la clase.");
      setCancelling(false);
      setShowCancelDialog(false);
    }
  };

  const handleEdit = () => {
    navigate(`/instructor/clases/${id}/editar`);
  };

  const handleBack = () => {
    navigate("/instructor/clases");
  };

  const toggleAttendance = (studentId) => {
    setAttendanceSaved(false);

    setAttendance((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleSaveAttendance = async () => {
    // TODO: falta backend RF-010 — todavía no hay un endpoint para
    // registrar la asistencia. Por ahora solo se guarda localmente
    // para que la interfaz sea funcional y no falle.
    setSavingAttendance(true);

    await new Promise((resolve) => setTimeout(resolve, 300));

    setSavingAttendance(false);
    setAttendanceSaved(true);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "published":
        return "Publicada";
      case "draft":
        return "Borrador";
      case "inactive":
        return "Inactiva";
      default:
        return status || "Sin estado";
    }
  };

  if (loading) {
    return (
      <div className="class-detail-instructor-page">
        <Loading />
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="class-detail-instructor-page">
        <div className="detail-error">
          {error && <ErrorMessage message={error} />}

          <h2>No se encontró la clase</h2>

          <button type="button" className="btn-primary" onClick={handleBack}>
            Volver a mis clases
          </button>
        </div>
      </div>
    );
  }

  const capacity = Number(classData.capacity || 0);
  const enrolled = Number(classData.enrolled_count || students.length || 0);
  const availablePlaces = capacity - enrolled;
  const occupancy = capacity > 0 ? Math.round((enrolled / capacity) * 100) : 0;

  return (
    <div className="class-detail-instructor-page">
      <div className="class-detail-container">
        {/* Encabezado */}
        <div className="detail-header">
          <div>
            <button
              type="button"
              className="back-button"
              onClick={handleBack}
            >
              ← Volver a mis clases
            </button>

            <div className="title-row">
              <div>
                <h1>{classData.name}</h1>

                <div className="title-meta">
                  <span>{classData.dance_type}</span>
                  <span>•</span>
                  <span>{classData.city}</span>
                  <span>•</span>
                  <span>{classData.modality}</span>
                </div>
              </div>

              <span className={`status-badge status-${classData.status}`}>
                {getStatusLabel(classData.status)}
              </span>
            </div>
          </div>

          <div className="detail-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleEdit}
            >
              ✏️ Editar
            </button>

            <button
              type="button"
              className="btn-danger"
              onClick={() => setShowCancelDialog(true)}
            >
              🗑️ Cancelar clase
            </button>
          </div>
        </div>

        {error && (
          <div className="detail-error-message">
            <ErrorMessage message={error} onClose={() => setError("")} />
          </div>
        )}

        {/* Resumen */}
        <div className="class-summary">
          <div className="summary-card">
            <span className="summary-icon">👥</span>

            <div>
              <strong>
                {enrolled}/{capacity}
              </strong>
              <span>Estudiantes inscritos</span>
            </div>
          </div>

          <div className="summary-card">
            <span className="summary-icon">🪑</span>

            <div>
              <strong>{availablePlaces}</strong>
              <span>Cupos disponibles</span>
            </div>
          </div>

          <div className="summary-card">
            <span className="summary-icon">📊</span>

            <div>
              <strong>{occupancy}%</strong>
              <span>Ocupación</span>
            </div>
          </div>

          <div className="summary-card">
            <span className="summary-icon">💰</span>

            <div>
              <strong>
                ${Number(classData.price || 0).toLocaleString("es-CO")}
              </strong>
              <span>Precio</span>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="detail-grid">
          {/* Información principal */}
          <section className="detail-card">
            <div className="card-header">
              <h2>Información de la clase</h2>
            </div>

            <div className="info-content">
              <div className="info-item">
                <span className="info-label">Descripción</span>
                <p>{classData.description}</p>
              </div>

              <div className="info-item">
                <span className="info-label">Tipo de danza</span>
                <span>{classData.dance_type}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Modalidad</span>
                <span>{classData.modality}</span>
              </div>

              {classData.modality === "Presencial" && (
                <div className="info-item">
                  <span className="info-label">Dirección</span>
                  <span>{classData.address}</span>
                </div>
              )}

              <div className="info-item">
                <span className="info-label">Ciudad</span>
                <span>{classData.city}</span>
              </div>
            </div>
          </section>

          {/* Horarios */}
          <section className="detail-card">
            <div className="card-header">
              <h2>Fecha y horario</h2>
            </div>

            <div className="info-content">
              <div className="info-item">
                <span className="info-label">Fecha de inicio</span>
                <span>{classData.start_date}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Fecha de finalización</span>
                <span>{classData.end_date}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Horario</span>
                <span>{classData.schedule}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Duración</span>
                <span>{classData.duration}</span>
              </div>
            </div>
          </section>

          {/* Requisitos */}
          <section className="detail-card">
            <div className="card-header">
              <h2>Requisitos</h2>
            </div>

            <div className="card-body">
              <p>
                {classData.requirements ||
                  "No se especificaron requisitos para esta clase."}
              </p>
            </div>
          </section>

          {/* Asistencia */}
          <section className="detail-card detail-card-full">
            <div className="card-header">
              <div>
                <h2>Registro de asistencia</h2>
                <p>Marca los estudiantes que asistieron a la clase.</p>
              </div>
            </div>

            {students.length === 0 ? (
              <p className="attendance-empty">
                Todavía no hay estudiantes inscritos en esta clase.
              </p>
            ) : (
              <>
                <ul className="attendance-list">
                  {students.map((student) => {
                    const studentId = student.id || student.student_id;
                    const studentName =
                      student.name || student.nombre || "Estudiante";

                    return (
                      <li key={studentId} className="attendance-item">
                        <label>
                          <input
                            type="checkbox"
                            checked={Boolean(attendance[studentId])}
                            onChange={() => toggleAttendance(studentId)}
                          />

                          <span>{studentName}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSaveAttendance}
                  disabled={savingAttendance}
                >
                  {savingAttendance ? "Guardando..." : "Guardar asistencia"}
                </button>

                {attendanceSaved && (
                  <p className="attendance-saved-note">
                    Asistencia guardada localmente. La conexión con el
                    backend todavía está pendiente (RF-010).
                  </p>
                )}
              </>
            )}
          </section>
        </div>

        {/* Botones inferiores */}
        <div className="bottom-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleBack}
          >
            Volver a mis clases
          </button>

          <button type="button" className="btn-primary" onClick={handleEdit}>
            Editar clase
          </button>
        </div>
      </div>

      {/* Confirmación de cancelación */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        title="Cancelar clase"
        message={`¿Estás seguro de que deseas cancelar "${classData.name}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, cancelar"
        cancelText="Volver"
        variant="danger"
        loading={cancelling}
        onConfirm={handleCancelClass}
        onCancel={() => setShowCancelDialog(false)}
      />
    </div>
  );
}

export default ClassDetailInstructor;
