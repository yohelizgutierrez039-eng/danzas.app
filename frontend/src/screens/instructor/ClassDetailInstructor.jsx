import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Loading from "../../components/common/Loading/Loading";
import ErrorMessage from "../../components/common/ErrorMessage/ErrorMessage";
import ConfirmDialog from "../../components/common/ConfirmDialog/ConfirmDialog";

import useClasses from "../../hooks/useClasses";
import classesService from "../../services/classes.service";

import "./ClassDetailInstructor.css";

const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getEnrollmentId = (item) =>
  item.inscripcionId ??
  item.inscripcion_id ??
  item.enrollmentId ??
  item.enrollment_id ??
  item.inscripcion?.id ??
  item.enrollment?.id ??
  item.id;

const getStudentName = (item) => {
  const student = item.estudiante || item.student || item.alumno || item;

  return (
    student.nombreCompleto ||
    student.nombre_completo ||
    student.name ||
    student.nombre ||
    "Estudiante"
  );
};

const getResponseData = (response) => response?.data ?? response;

function ClassDetailInstructor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById, remove } = useClasses();

  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const [sessionDate, setSessionDate] = useState(getToday());
  const [attendance, setAttendance] = useState({});
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [attendanceSaved, setAttendanceSaved] = useState(false);
  const [attendanceError, setAttendanceError] = useState("");

  useEffect(() => {
    let active = true;

    const loadClass = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getById(id);

        if (active) {
          setClassData(getResponseData(response));
        }
      } catch (err) {
        if (active) {
          setError(
            err?.message || "No se pudo cargar la información de la clase.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadClass();

    return () => {
      active = false;
    };
  }, [id]);

  const students = useMemo(() => {
    const list =
      classData?.students ||
      classData?.enrolled_students ||
      classData?.enrollments ||
      classData?.inscripciones ||
      [];

    return Array.isArray(list) ? list : [];
  }, [classData]);

  // Carga la asistencia registrada para la fecha seleccionada.
  useEffect(() => {
    let active = true;

    const loadAttendance = async () => {
      if (!id || !sessionDate || !classData) {
        return;
      }

      if (students.length === 0) {
        setAttendance({});
        setAttendanceError("");
        return;
      }

      try {
        setLoadingAttendance(true);
        setAttendanceError("");
        setAttendanceSaved(false);

        const response = await classesService.getAttendance(id, sessionDate);

        const data = getResponseData(response);
        const records = Array.isArray(data)
          ? data
          : data?.registros || data?.attendance || data?.asistencias || [];

        const nextAttendance = {};

        records.forEach((record) => {
          const enrollmentId =
            record.inscripcionId ??
            record.inscripcion_id ??
            record.enrollmentId ??
            record.enrollment_id;

          if (enrollmentId != null) {
            nextAttendance[enrollmentId] = Boolean(
              record.asistio ?? record.attended,
            );
          }
        });

        if (active) {
          setAttendance(nextAttendance);
        }
      } catch (err) {
        if (active) {
          setAttendance({});
          setAttendanceError(
            err?.message || "No se pudo cargar la asistencia de esta sesión.",
          );
        }
      } finally {
        if (active) {
          setLoadingAttendance(false);
        }
      }
    };

    loadAttendance();

    return () => {
      active = false;
    };
  }, [id, sessionDate, classData, students]);

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

  const toggleAttendance = (enrollmentId) => {
    setAttendanceSaved(false);
    setAttendanceError("");

    setAttendance((previous) => ({
      ...previous,
      [enrollmentId]: !previous[enrollmentId],
    }));
  };

  const handleSaveAttendance = async () => {
    const records = students
      .map((student) => {
        const enrollmentId = getEnrollmentId(student);

        if (enrollmentId == null) {
          return null;
        }

        return {
          inscripcionId: enrollmentId,
          asistio: Boolean(attendance[enrollmentId]),
        };
      })
      .filter(Boolean);

    if (records.length === 0) {
      setAttendanceError(
        "No se encontraron identificadores de inscripción para guardar la asistencia.",
      );
      return;
    }

    try {
      setSavingAttendance(true);
      setAttendanceError("");
      setAttendanceSaved(false);

      await classesService.registerAttendance(id, {
        fechaSesion: sessionDate,
        registros: records,
      });

      setAttendanceSaved(true);
    } catch (err) {
      setAttendanceError(err?.message || "No se pudo guardar la asistencia.");
    } finally {
      setSavingAttendance(false);
    }
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
  const enrolled = Number(classData.enrolled_count ?? students.length ?? 0);
  const availablePlaces = capacity - enrolled;
  const occupancy = capacity > 0 ? Math.round((enrolled / capacity) * 100) : 0;

  return (
    <div className="class-detail-instructor-page">
      <div className="class-detail-container">
        <div className="detail-header">
          <div>
            <button type="button" className="back-button" onClick={handleBack}>
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

        <div className="detail-grid">
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

          <section className="detail-card detail-card-full">
            <div className="card-header">
              <div>
                <h2>Registro de asistencia</h2>
                <p>Selecciona la fecha de la sesión y marca quién asistió.</p>
              </div>
            </div>

            <div className="info-item">
              <label htmlFor="attendance-session-date">
                Fecha de la sesión
              </label>
              <input
                id="attendance-session-date"
                type="date"
                value={sessionDate}
                onChange={(event) => {
                  setSessionDate(event.target.value);
                  setAttendanceSaved(false);
                }}
              />
            </div>

            {attendanceError && (
              <div className="detail-error-message">
                <ErrorMessage
                  message={attendanceError}
                  onClose={() => setAttendanceError("")}
                />
              </div>
            )}

            {loadingAttendance ? (
              <Loading />
            ) : students.length === 0 ? (
              <p className="attendance-empty">
                Todavía no hay estudiantes inscritos en esta clase.
              </p>
            ) : (
              <>
                <ul className="attendance-list">
                  {students.map((student, index) => {
                    const enrollmentId = getEnrollmentId(student);
                    const studentName = getStudentName(student);
                    const key =
                      enrollmentId ??
                      student.estudiante?.id ??
                      student.student?.id ??
                      index;

                    return (
                      <li key={key} className="attendance-item">
                        <label>
                          <input
                            type="checkbox"
                            checked={
                              enrollmentId != null &&
                              Boolean(attendance[enrollmentId])
                            }
                            disabled={savingAttendance || enrollmentId == null}
                            onChange={() => toggleAttendance(enrollmentId)}
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
                  disabled={
                    savingAttendance ||
                    loadingAttendance ||
                    Boolean(attendanceError)
                  }
                >
                  {savingAttendance ? "Guardando..." : "Guardar asistencia"}
                </button>

                {attendanceSaved && (
                  <p className="attendance-saved-note" role="status">
                    La asistencia se guardó correctamente.
                  </p>
                )}
              </>
            )}
          </section>
        </div>

        <div className="bottom-actions">
          <button type="button" className="btn-secondary" onClick={handleBack}>
            Volver a mis clases
          </button>

          <button type="button" className="btn-primary" onClick={handleEdit}>
            Editar clase
          </button>
        </div>
      </div>

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
