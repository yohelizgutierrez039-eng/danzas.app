const classRepository = require("../repositories/class.repository");
const enrollmentRepository = require("../repositories/enrollment.repository");
const attendanceRepository = require("../repositories/attendance.repository");
const { AppError } = require("../middleware/errorHandler");

const registrarAsistencia = async (claseId, instructorId, fechaSesion, registros) => {
  const clase = await classRepository.findById(claseId);

  if (!clase) {
    throw new AppError("Clase no encontrada.", 404, "CLASS_NOT_FOUND");
  }

  if (clase.instructorId !== instructorId) {
    throw new AppError("No tenés permiso para registrar asistencia en esta clase.", 403, "FORBIDDEN");
  }

  return await attendanceRepository.registrarVarias(claseId, fechaSesion, registros);
};

const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

// Valida YYYY-MM-DD y que sea una fecha real de calendario (rechaza 2026-02-30).
const esFechaValida = (fecha) => {
  if (typeof fecha !== "string" || !FORMATO_FECHA.test(fecha)) {
    return false;
  }

  const [anio, mes, dia] = fecha.split("-").map(Number);
  const calendario = new Date(Date.UTC(anio, mes - 1, dia));

  return (
    calendario.getUTCFullYear() === anio &&
    calendario.getUTCMonth() === mes - 1 &&
    calendario.getUTCDate() === dia
  );
};

/**
 * RF-010: lista de alumnos confirmados de una clase con su asistencia de una fecha.
 * `asistio` es true/false si ya se registró y null si todavía no se tomó asistencia.
 */
const obtenerAsistencia = async (claseId, instructorId, fecha) => {
  if (!esFechaValida(fecha)) {
    throw new AppError("Fecha inválida. Usá el formato YYYY-MM-DD.", 400, "INVALID_DATE");
  }

  const clase = await classRepository.findById(claseId);

  if (!clase) {
    throw new AppError("Clase no encontrada.", 404, "CLASS_NOT_FOUND");
  }

  if (clase.instructorId !== instructorId) {
    throw new AppError("No tenés permiso para consultar la asistencia de esta clase.", 403, "FORBIDDEN");
  }

  const alumnosConfirmados = await enrollmentRepository.findAlumnosConfirmados(claseId);
  const asistencias = await attendanceRepository.findByClaseYFecha(claseId, fecha);

  const asistioPorInscripcion = new Map(
    asistencias.map((asistencia) => [asistencia.inscripcionId, asistencia.asistio]),
  );

  const alumnos = alumnosConfirmados.map((inscripcion) => ({
    inscripcionId: inscripcion.id,
    nombre: inscripcion.menor ? inscripcion.menor.nombre : inscripcion.usuario.nombre,
    esMenor: Boolean(inscripcion.menor),
    asistio: asistioPorInscripcion.has(inscripcion.id) ? asistioPorInscripcion.get(inscripcion.id) : null,
  }));

  return { claseId, fecha, alumnos };
};

module.exports = {
  registrarAsistencia,
  obtenerAsistencia,
};
