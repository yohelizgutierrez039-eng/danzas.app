const prisma = require("../config/prisma");
const classRepository = require("../repositories/class.repository");
const enrollmentRepository = require("../repositories/enrollment.repository");
const scheduleService = require("./schedule.service");
const { AppError } = require("../middleware/errorHandler");
const emitirCorreo = require("../events/emitirCorreo");
const plantillas = require("../utils/emailTemplates");

/**
 * RF-017: un correo por cada inscripcion afectada por la cancelacion de la clase
 * (al estudiante, o al padre si la inscripcion es de un menor). Se arma con las
 * inscripciones leidas antes de cancelarlas y se emite despues del commit.
 */
const notificarClaseCancelada = (clase, inscripciones) => {
  emitirCorreo(() =>
    inscripciones.map((inscripcion) => {
      const pago = inscripcion.pago;
      const reembolso = Boolean(pago) && pago.estado === "aprobado" && !pago.reembolsado;

      return {
        destinatario: inscripcion.usuario?.correo,
        ...plantillas.claseCanceladaPorInstructor({
          nombre: inscripcion.usuario?.nombre,
          clase,
          reembolso,
          monto: pago?.monto,
          nombreMenor: inscripcion.menor?.nombre,
        }),
      };
    }),
  );
};

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

  if (clase.estado === "cancelada") {
    throw new AppError("La clase ya está cancelada.", 409, "CLASS_ALREADY_CANCELLED");
  }

  // RF-009: la clase y todas sus inscripciones se cancelan de forma atómica.
  // Marcar primero la clase toma su lock de fila, así que una inscripción
  // concurrente (que bloquea esa misma fila) verá la clase ya cancelada.
  const { claseCancelada, resumen, afectadas } = await prisma.$transaction(async (tx) => {
    const claseActualizada = await classRepository.delete(claseId, tx);
    // Se leen antes de cancelarlas: despues ya no serian "activas".
    const inscripcionesAfectadas = await enrollmentRepository.findActivasPorClase(claseId, tx);
    const resultado = await enrollmentRepository.cancelarPorClaseDeInstructor(claseId, tx);

    return {
      claseCancelada: claseActualizada,
      resumen: resultado,
      afectadas: inscripcionesAfectadas,
    };
  });

  notificarClaseCancelada(clase, afectadas);

  return { ...claseCancelada, ...resumen };
};

module.exports = {
  searchClasses,
  crearClase,
  editarClase,
  cancelarClase,
};
