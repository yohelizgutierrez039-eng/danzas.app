const classRepository = require("../repositories/class.repository");
const scheduleService = require("./schedule.service");
const { AppError } = require("../middleware/errorHandler");

const searchClasses = async ({ tipoBaile, ciudad }) => {
  return await classRepository.searchClasses({
    tipoBaile,
    ciudad,
  });
};

const crearClase = async (instructorId, datos) => {
  const { diaSemana, horaInicio, horaFin } = datos;

  await scheduleService.hayConflictoDeHorario(instructorId, { diaSemana, horaInicio, horaFin }, null);

  return await classRepository.create({ instructorId, ...datos });
};

const editarClase = async (claseId, instructorId, datosNuevos) => {
  const clase = await classRepository.findById(claseId);

  if (!clase) {
    throw new AppError("Clase no encontrada.", 404, "CLASS_NOT_FOUND");
  }

  if (clase.instructorId !== instructorId) {
    throw new AppError("No tenés permiso para modificar esta clase.", 403, "FORBIDDEN");
  }

  const horarioActual = clase.horarios[0];
  const nuevoHorario = {
    diaSemana: datosNuevos.diaSemana ?? horarioActual?.diaSemana,
    horaInicio: datosNuevos.horaInicio ?? horarioActual?.horaInicio,
    horaFin: datosNuevos.horaFin ?? horarioActual?.horaFin,
  };

  await scheduleService.hayConflictoDeHorario(instructorId, nuevoHorario, claseId);

  return await classRepository.update(claseId, datosNuevos);
};

const cancelarClase = async (claseId, instructorId) => {
  const clase = await classRepository.findById(claseId);

  if (!clase) {
    throw new AppError("Clase no encontrada.", 404, "CLASS_NOT_FOUND");
  }

  if (clase.instructorId !== instructorId) {
    throw new AppError("No tenés permiso para cancelar esta clase.", 403, "FORBIDDEN");
  }

  return await classRepository.delete(claseId);
};

module.exports = {
  searchClasses,
  crearClase,
  editarClase,
  cancelarClase,
};
