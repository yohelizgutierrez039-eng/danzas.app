import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Loading from "../../components/common/Loading/Loading";
import ErrorMessage from "../../components/common/ErrorMessage/ErrorMessage";
import ConfirmDialog from "../../components/common/ConfirmDialog/ConfirmDialog";
import ClassStatusBadge from "../../components/classes/ClassStatusBadge";

import useClasses from "../../hooks/useClasses";
import {
  getAttendance,
  registerAttendance,
} from "../../services/classes.service";
import { fechaDeHoy, formatearHorario } from "../../utils/formatDate";
import { formatearPrecio } from "../../utils/formatCurrency";

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

  // Asistencia de la sesión de una fecha (YYYY-MM-DD).
  // Cada alumno llega como { inscripcionId, nombre, esMenor, asistio },
  // donde asistio es null si todavía no se registró.
  const [fecha, setFecha] = useState(fechaDeHoy);
  const [alumnos, setAlumnos] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [attendanceSaved, setAttendanceSaved] = useState(false);
  const [attendanceError, setAttendanceError] = useState("");

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
  }, [id, getById]);

  useEffect(() => {
    let isActive = true;

    const loadAttendance = async () => {
      setLoadingAttendance(true);
      setAttendanceError("");
      setAttendanceSaved(false);

      try {
        const result = await getAttendance(id, fecha);

        if (isActive) {
          setAlumnos(result.alumnos);
        }
      } catch (err) {
        if (isActive) {
          setAlumnos([]);
          setAttendanceError(
            err?.message || "No se pudo cargar la asistencia de la clase.",
          );
        }
      } finally {
        if (isActive) {
          setLoadingAttendance(false);
        }
      }
    };

    loadAttendance();

    return () => {
      isActive = false;
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

  const handleChangeFecha = (e) => {
    if (e.target.value) {
      setFecha(e.target.value);
    }
  };

  const toggleAttendance = (inscripcionId) => {
    setAttendanceSaved(false);

    setAlumnos((prev) =>
      prev.map((alumno) =>
        alumno.inscripcionId === inscripcionId
          ? { ...alumno, asistio: !alumno.asistio }
          : alumno,
      ),
    );
  };

  const handleSaveAttendance = async () => {
    try {
      setSavingAttendance(true);
      setAttendanceError("");
      setAttendanceSaved(false);

      await registerAttendance(id, {
        fechaSesion: fecha,
        registros: alumnos.map((alumno) => ({
          inscripcionId: alumno.inscripcionId,
          asistio: alumno.asistio === true,
        })),
      });

      setAttendanceSaved(true);
    } catch (err) {
      setAttendanceError(err?.message || "No se pudo guardar la asistencia.");
    } finally {
      setSavingAttendance(false);
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

  const isClassActive = classData.estado === "activa";
  const modalidad =
    classData.modalidad === "virtual" ? "Virtual" : "Presencial";
  const capacity = classData.cupoMaximo;
  const availablePlaces = classData.cupoDisponible;
  const enrolled = capacity - availablePlaces;
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
                <h1>Clase de {classData.tipoBaile}</h1>

                <div className="title-meta">
                  <span>{classData.ciudad}</span>
                  <span>•</span>
                  <span>{modalidad}</span>
                </div>
              </div>

              <ClassStatusBadge estado={classData.estado} />
            </div>
          </div>

          {isClassActive && (
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
          )}
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
              <strong>{formatearPrecio(classData.precio)}</strong>
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
                <span className="info-label">Tipo de baile</span>
                <span>{classData.tipoBaile}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Modalidad</span>
                <span>{modalidad}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Ciudad</span>
                <span>{classData.ciudad}</span>
              </div>
            </div>
          </section>

          {/* Horarios */}
          <section className="detail-card">
            <div className="card-header">
              <h2>Horario</h2>
            </div>

            <div className="info-content">
              {classData.horarios.map((horario) => (
                <div className="info-item" key={horario.id}>
                  <span>{formatearHorario(horario)}</span>
                </div>
              ))}
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

            <div className="attendance-date">
              <label htmlFor="fecha-asistencia">Fecha de la sesión</label>

              <input
                id="fecha-asistencia"
                type="date"
                value={fecha}
                onChange={handleChangeFecha}
              />
            </div>

            {attendanceError && (
              <ErrorMessage
                message={attendanceError}
                onClose={() => setAttendanceError("")}
              />
            )}

            {loadingAttendance && <Loading text="Cargando alumnos..." />}

            {!loadingAttendance && !attendanceError && alumnos.length === 0 && (
              <p className="attendance-empty">
                Todavía no hay estudiantes inscritos en esta clase.
              </p>
            )}

            {!loadingAttendance && alumnos.length > 0 && (
              <>
                <ul className="attendance-list">
                  {alumnos.map((alumno) => (
                    <li key={alumno.inscripcionId} className="attendance-item">
                      <label>
                        <input
                          type="checkbox"
                          checked={alumno.asistio === true}
                          onChange={() =>
                            toggleAttendance(alumno.inscripcionId)
                          }
                        />

                        <span>{alumno.nombre}</span>

                        {alumno.esMenor && (
                          <small className="attendance-minor">Menor</small>
                        )}
                      </label>
                    </li>
                  ))}
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
                    Asistencia guardada correctamente.
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

          {isClassActive && (
            <button type="button" className="btn-primary" onClick={handleEdit}>
              Editar clase
            </button>
          )}
        </div>
      </div>

      {/* Confirmación de cancelación */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        title="Cancelar clase"
        message={`¿Estás seguro de que deseas cancelar la clase de ${classData.tipoBaile}? Esta acción no se puede deshacer.`}
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
