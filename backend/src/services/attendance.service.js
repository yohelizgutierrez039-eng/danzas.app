const classRepository = require("../repositories/class.repository");
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

module.exports = {
  registrarAsistencia,
};
