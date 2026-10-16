const classRepository = require("../repositories/class.repository");
const attendanceRepository = require("../repositories/attendance.repository");
const { AppError } = require("../middleware/errorHandler");

const registrarAsistencia = async (claseId, instructorId, fechaSesion, registros) => {
  const clase = await classRepository.findById(claseId);
  
const obtenerAsistencia = async (claseId, instructorId, fecha) => {
  // Validar el formato de la fecha.
  const formatoFecha = /^\d{4}-\d{2}-\d{2}$/;

  if (!formatoFecha.test(fecha)) {
    throw new AppError("Fecha inválida.", 400, "INVALID_DATE");
  }

  const [year, month, day] = fecha.split("-").map(Number);
  const fechaValidada = new Date(Date.UTC(year, month - 1, day));

  if (
    fechaValidada.getUTCFullYear() !== year ||
    fechaValidada.getUTCMonth() !== month - 1 ||
    fechaValidada.getUTCDate() !== day
  ) {
    throw new AppError("Fecha inválida.", 400, "INVALID_DATE");
  }

  // Verificar que la clase exista.
  const clase = await classRepository.findDetalleById(claseId);

  if (!clase) {
    throw new AppError(
      "Clase no encontrada.",
      404,
      "CLASS_NOT_FOUND"
    );
  }

  // Verificar que la clase pertenezca al instructor.
  if (String(clase.instructorId) !== String(instructorId)) {
    throw new AppError(
      "No tienes permiso para consultar esta clase.",
      403,
      "FORBIDDEN"
    );
  }

  // Obtener alumnos confirmados y asistencias registradas.
  const alumnosConfirmados =
    await enrollmentRepository.findAlumnosConfirmados(claseId);

  const asistencias =
    await attendanceRepository.findByClaseYFecha(claseId, fecha);

  const asistenciasPorInscripcion = new Map(
    asistencias.map((asistencia) => [
      String(asistencia.inscripcionId),
      asistencia,
    ])
  );

  const alumnos = alumnosConfirmados.map((inscripcion) => {
    const menor = inscripcion.menor;
    const usuario = inscripcion.usuario;

    const asistencia = asistenciasPorInscripcion.get(
      String(inscripcion.id)
    );

    return {
      inscripcionId: inscripcion.id,
      nombre: menor
        ? menor.nombre
        : usuario.nombre,
      esMenor: Boolean(menor),
      asistio: asistencia ? asistencia.asistio : null,
    };
  });

  return {
    claseId,
    fecha,
    alumnos,
  };
};


  if (!clase) {
    throw new AppError("Clase no encontrada.", 404, "CLASS_NOT_FOUND");
  }

  if (clase.instructorId !== instructorId) {
    throw new AppError("No tenés permiso para registrar asistencia en esta clase.", 403, "FORBIDDEN");
  }

  return await attendanceRepository.registrarVarias(claseId, fechaSesion, registros);
};

module.exports = {
  registrarAsistencia,
};
