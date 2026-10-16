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

const unwrapResponse = (response) => response?.data ?? response;

const getEnrollmentId = (alumno) =>
  alumno.inscripcionId ??
  alumno.inscripcion_id ??
  alumno.enrollmentId ??
  alumno.enrollment_id;

const getStudentName = (alumno) =>
  alumno.nombreCompleto ||
  alumno.nombre_completo ||
  alumno.nombre ||
  alumno.name ||
  alumno.estudiante?.nombre ||
  alumno.student?.name ||
  "Estudiante";

const formatTime = (value) => {
  if (!value) return "No disponible";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Bogota",
  });
};

function ClassDetailInstructor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById, remove } = useClasses();

  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const [fecha, setFecha] = useState(getToday());
  const [alumnos, setAlumnos] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [attendanceSaved, setAttendanceSaved] = useState(false);
  const [attendanceError, setAttendanceError] = useState("");

  // Cargar los datos reales de la clase.
  useEffect(() => {
    let active = true;

    const loadClass = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getById(id);

        if (active) {
          setClassData(unwrapResponse(response));
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

  // Consultar alumnos y asistencia para la fecha seleccionada.
  useEffect(() => {
    let active = true;

    const loadAttendance = async () => {
      if (!id || !fecha) return;

      try {
        setLoadingAttendance(true);
        setAttendanceError("");
        setAttendanceSaved(false);
        setAlumnos([]);
        setAttendance({});

        const response = await classesService.getAttendance(id, fecha);
        const data = unwrapResponse(response);

        const lista = Array.isArray(data?.alumnos) ? data.alumnos : [];

        const nextAttendance = {};

        lista.forEach((alumno) => {
          const enrollmentId = getEnrollmentId(alumno);

          if (enrollmentId == null) return;

          // null significa que aún no se había registrado asistencia.
          if (alumno.asistio !== null && alumno.asistio !== undefined) {
            nextAttendance[enrollmentId] = Boolean(alumno.asistio);
          }
        });

        if (active) {
          setAlumnos(lista);
          setAttendance(nextAttendance);
        }
      } catch (err) {
        if (active) {
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
  }, [id, fecha]);

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
      [enrollmentId]: !Boolean(previous[enrollmentId]),
    }));
  };

  // Guardar la asistencia en el backend, sin setTimeout simulado.
  const handleSaveAttendance = async () => {
    const registros = alumnos
      .map((alumno) => {
        const inscripcionId = getEnrollmentId(alumno);

        if (inscripcionId == null) return null;

        return {
          inscripcionId,
          asistio: Boolean(attendance[inscripcionId]),
        };
      })
      .filter(Boolean);

    if (registros.length === 0) {
      setAttendanceError(
        "No hay alumnos con una inscripción válida para registrar.",
      );
      return;
    }

    try {
      setSavingAttendance(true);
      setAttendanceError("");
      setAttendanceSaved(false);

      await classesService.registerAttendance(id, {
        fechaSesion: fecha,
        registros,
      });

      setAttendanceSaved(true);
    } catch (err) {
      setAttendanceError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo guardar la asistencia.",
      );
    } finally {
      setSavingAttendance(false);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      publicada: "Publicada",
      publicado: "Publicado",
      borrador: "Borrador",
      inactiva: "Inactiva",
      inactive: "Inactiva",
      published: "Publicada",
      draft: "Borrador",
    };

    return labels[status] || status || "Sin estado";
  };

  const horarios = useMemo(
    () => (Array.isArray(classData?.horarios) ? classData.horarios : []),
    [classData],
  );

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

  const capacity = Number(classData.cupoMaximo || 0);
  const availablePlaces = Number(classData.cupoDisponible || 0);
  const enrolled = Math.max(0, capacity - availablePlaces);
  const occupancy = capacity > 0 ? Math.round((enrolled / capacity) * 100) : 0;

  const price = Number(classData.precio || 0);

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
                <h1>
                  {classData.nombre || classData.name || classData.tipoBaile}
                </h1>

                <div className="title-meta">
                  <span>{classData.tipoBaile}</span>
                  <span>•</span>
                  <span>{classData.ciudad}</span>
                </div>
              </div>

              <span className={`status-badge status-${classData.estado}`}>
                {getStatusLabel(classData.estado)}
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
              <strong>${price.toLocaleString("es-CO")}</strong>
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
                <span className="info-label">Tipo de danza</span>
                <span>{classData.tipoBaile || "No disponible"}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Ciudad</span>
                <span>{classData.ciudad || "No disponible"}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Descripción</span>
                <p>
                  {classData.descripcion ||
                    classData.description ||
                    "Sin descripción."}
                </p>
              </div>

              <div className="info-item">
                <span className="info-label">Modalidad</span>
                <span>
                  {classData.modalidad || classData.modality || "No disponible"}
                </span>
              </div>

              {(classData.modalidad || classData.modality) === "Presencial" && (
                <div className="info-item">
                  <span className="info-label">Dirección</span>
                  <span>
                    {classData.direccion ||
                      classData.address ||
                      "No disponible"}
                  </span>
                </div>
              )}
            </div>
          </section>

          <section className="detail-card">
            <div className="card-header">
              <h2>Horarios</h2>
            </div>

            <div className="info-content">
              {horarios.length === 0 ? (
                <p>No hay horarios disponibles.</p>
              ) : (
                horarios.map((horario, index) => (
                  <div className="info-item" key={horario.id || index}>
                    <span className="info-label">
                      {horario.diaSemana ||
                        horario.dia ||
                        `Horario ${index + 1}`}
                    </span>
                    <span>
                      {formatTime(horario.horaInicio)} –{" "}
                      {formatTime(horario.horaFin)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="detail-card">
            <div className="card-header">
              <h2>Requisitos</h2>
            </div>

            <div className="card-body">
              <p>
                {classData.requisitos ||
                  classData.requirements ||
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
              <label htmlFor="attendance-date">Fecha de la sesión</label>
              <input
                id="attendance-date"
                type="date"
                value={fecha}
                onChange={(event) => {
                  setFecha(event.target.value);
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
            ) : alumnos.length === 0 ? (
              <p className="attendance-empty">
                No hay alumnos inscritos para mostrar en esta consulta.
              </p>
            ) : (
              <>
                <ul className="attendance-list">
                  {alumnos.map((alumno, index) => {
                    const enrollmentId = getEnrollmentId(alumno);
                    const studentName = getStudentName(alumno);

                    return (
                      <li
                        key={enrollmentId ?? index}
                        className="attendance-item"
                      >
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
                  disabled={savingAttendance || loadingAttendance}
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
        message={`¿Estás seguro de que deseas cancelar "${classData.nombre || classData.name || classData.tipoBaile}"? Esta acción no se puede deshacer.`}
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
