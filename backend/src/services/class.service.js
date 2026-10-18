const prisma = require("../config/prisma");
const classRepository = require("../repositories/class.repository");
const academyRequestRepository = require("../repositories/academyRequest.repository");
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

// RF-011: detalle público de una clase (horarios + instructor).
const obtenerClase = async (claseId) => {
  const clase = await classRepository.findDetalleById(claseId);

  if (!clase) {
    throw new AppError("Clase no encontrada.", 404, "CLASS_NOT_FOUND");
  }

  return clase;
};

// RF-008: clases del instructor autenticado, con sus horarios.
// Nota: Clase no tiene fecha de creación, así que no hay forma de ordenar "más recientes
// primero" sin una migración; se devuelve el orden natural de la consulta.
const listarClasesDelInstructor = async (instructorId) => {
  return await classRepository.findByInstructor(instructorId);
};

/**
 * RF-006 / RF-008: un instructor no puede publicar clases hasta que el administrador
 * apruebe su solicitud de academia (o de instructor independiente). Una solicitud
 * pendiente o rechazada, o la ausencia de solicitud, bloquean la publicación.
 * Si el instructor tiene varias solicitudes (varias academias), basta una aprobada.
 */
const exigirAcademiaAprobada = async (instructorId) => {
  const solicitudes = await academyRequestRepository.findByInstructor(instructorId);

  if (solicitudes.some((solicitud) => solicitud.estado === "aprobada")) {
    return;
  }

  let motivo = "Aún no tienes una solicitud de academia aprobada.";

  if (solicitudes.some((solicitud) => solicitud.estado === "pendiente")) {
    motivo = "Tu solicitud de academia sigue pendiente de aprobación.";
  } else if (solicitudes.some((solicitud) => solicitud.estado === "rechazada")) {
    motivo = "Tu solicitud de academia fue rechazada.";
  }

  throw new AppError(
    `${motivo} No puedes publicar clases hasta que el administrador la apruebe.`,
    403,
    "ACADEMY_NOT_APPROVED",
  );
};

const crearClase = async (instructorId, datos) => {
  const { diaSemana, horaInicio, horaFin } = datos;

  await exigirAcademiaAprobada(instructorId);

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

  // cupoDisponible nunca se acepta del cliente: lo deriva el service de cupoMaximo.
  const { cupoDisponible: _descartado, ...datos } = datosNuevos;

  if (datos.cupoMaximo === undefined) {
    return await classRepository.update(claseId, datos);
  }

  return await actualizarConNuevoCupo(claseId, datos);
};

/**
 * RF-008 / RF-009: inscritos = cupoMaximo - cupoDisponible. Al cambiar cupoMaximo se
 * recalcula cupoDisponible para no desfasar ese conteo, y no se permite bajarlo por
 * debajo de los inscritos. Se bloquea la fila de la clase (igual que inscribir) y se
 * relee dentro de la transacción, así una inscripción concurrente no se pierde.
 */
const actualizarConNuevoCupo = async (claseId, datos) => {
  const nuevoCupo = datos.cupoMaximo;

  if (!Number.isInteger(nuevoCupo) || nuevoCupo < 1) {
    throw new AppError("El cupo máximo debe ser un número entero mayor a 0.", 400, "INVALID_CAPACITY");
  }

  return await prisma.$transaction(async (tx) => {
    await enrollmentRepository.bloquearClase(claseId, tx);

    const actual = await classRepository.findById(claseId, tx);
    const inscritos = actual.cupoMaximo - actual.cupoDisponible;

    if (nuevoCupo < inscritos) {
      throw new AppError(
        `No puedes bajar el cupo a ${nuevoCupo}: la clase ya tiene ${inscritos} inscritos.`,
        400,
        "INVALID_CAPACITY",
      );
    }

    return await classRepository.update(
      claseId,
      { ...datos, cupoDisponible: nuevoCupo - inscritos },
      tx,
    );
  });
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
  obtenerClase,
  listarClasesDelInstructor,
  crearClase,
  editarClase,
  cancelarClase,
};
