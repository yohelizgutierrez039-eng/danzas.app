const prisma = require("../config/prisma");
const enrollmentRepository = require("../repositories/enrollment.repository");
const paymentRepository = require("../repositories/payment.repository");
const dependentRepository = require("../repositories/dependent.repository");
const userRepository = require("../repositories/user.repository");
const { proximaSesion } = require("../utils/classSchedule.util");
const { AppError } = require("../middleware/errorHandler");

const ERRORES_DE_CREACION = {
  CLASE_NO_ENCONTRADA: ["Clase no encontrada.", 404, "CLASS_NOT_FOUND"],
  CLASE_NO_ACTIVA: ["La clase no está disponible para inscripción.", 409, "CLASS_NOT_ACTIVE"],
  SIN_CUPO: ["La clase no tiene cupos disponibles.", 409, "CLASS_FULL"],
  INSCRIPCION_DUPLICADA: [
    "Ya existe una inscripción activa en esta clase.",
    409,
    "ENROLLMENT_ALREADY_EXISTS",
  ],
};

/**
 * RF-012: inscribe al estudiante autenticado, o a uno de los menores del padre
 * autenticado, en una clase. La inscripción nace en `pendiente_pago`.
 */
const crearInscripcion = async (solicitante, { claseId, menorId }) => {
  if (!claseId) {
    throw new AppError("El identificador de la clase es obligatorio.", 400, "VALIDATION_ERROR");
  }

  // Los ids llegan del body: se exige texto para no pasarle objetos a Prisma.
  if (typeof claseId !== "string" || (menorId != null && typeof menorId !== "string")) {
    throw new AppError("Los identificadores enviados no son válidos.", 400, "VALIDATION_ERROR");
  }

  let usuarioId = solicitante.id;
  let menorAInscribir = null;

  if (solicitante.rol === "padre") {
    if (!menorId) {
      throw new AppError(
        "Un padre debe indicar el menor que desea inscribir.",
        400,
        "VALIDATION_ERROR",
      );
    }

    const menor = await dependentRepository.findById(menorId);

    if (!menor) {
      throw new AppError("Menor no encontrado.", 404, "DEPENDENT_NOT_FOUND");
    }

    if (menor.padreId !== solicitante.id) {
      throw new AppError("El menor no pertenece a tu cuenta.", 403, "FORBIDDEN");
    }

    menorAInscribir = menor.id;
  } else if (solicitante.rol === "estudiante") {
    if (menorId) {
      throw new AppError(
        "Solo un padre puede inscribir a un menor.",
        403,
        "FORBIDDEN",
      );
    }
  } else {
    throw new AppError("Tu rol no puede inscribirse en clases.", 403, "FORBIDDEN");
  }

  const { error, inscripcion } = await enrollmentRepository.crearConDecrementoDeCupo({
    claseId,
    usuarioId,
    menorId: menorAInscribir,
  });

  if (error) {
    const [mensaje, status, codigo] = ERRORES_DE_CREACION[error];
    throw new AppError(mensaje, status, codigo);
  }

  return inscripcion;
};

/**
 * RF-014: historial de inscripciones. `objetivoId` es el id de un usuario o el
 * de un menor (el frontend usa la misma ruta para ambos casos).
 *  - Cualquier usuario consulta el suyo.
 *  - Un padre consulta el de sus menores.
 *  - El administrador consulta el de cualquier usuario o menor.
 */
const obtenerHistorial = async (solicitante, objetivoId) => {
  if (objetivoId === solicitante.id) {
    return await enrollmentRepository.findByUsuario(objetivoId);
  }

  if (solicitante.rol === "admin") {
    const usuario = await userRepository.findById(objetivoId);

    if (usuario) {
      return await enrollmentRepository.findByUsuario(objetivoId);
    }

    const menor = await dependentRepository.findById(objetivoId);

    if (menor) {
      return await enrollmentRepository.findByMenor(objetivoId);
    }

    throw new AppError("Usuario no encontrado.", 404, "USER_NOT_FOUND");
  }

  const menor = await dependentRepository.findById(objetivoId);

  if (menor && menor.padreId === solicitante.id) {
    return await enrollmentRepository.findByMenor(objetivoId);
  }

  throw new AppError("No tenés permiso para ver este historial.", 403, "FORBIDDEN");
};

const HORAS_MINIMAS_PARA_REEMBOLSO = 2;
const MS_POR_HORA = 60 * 60 * 1000;

/**
 * RF-018: cancela una inscripción del estudiante (o del padre en nombre de su
 * menor) antes de que la clase empiece.
 *  - La inscripción pasa a `cancelada` y el cupo se libera siempre.
 *  - Si tenía un pago aprobado y faltan 2 horas o más para la próxima sesión,
 *    el pago se marca como reembolsado (reembolso completo). Con menos de 2
 *    horas no hay reembolso.
 * La clase es semanal, así que el "inicio" es el de la próxima sesión; si hay
 * una sesión en curso la clase ya empezó y no se puede cancelar.
 */
const cancelarInscripcion = async (inscripcionId, solicitante, ahora = new Date()) => {
  const inscripcion = await enrollmentRepository.findById(inscripcionId);

  if (!inscripcion) {
    throw new AppError("Inscripción no encontrada.", 404, "ENROLLMENT_NOT_FOUND");
  }

  if (inscripcion.usuarioId !== solicitante.id) {
    throw new AppError("No tenés permiso para cancelar esta inscripción.", 403, "FORBIDDEN");
  }

  if (inscripcion.estado === "cancelada") {
    throw new AppError("La inscripción ya está cancelada.", 409, "ENROLLMENT_ALREADY_CANCELLED");
  }

  const { enCurso, inicio } = proximaSesion(inscripcion.clase.horarios, ahora);

  if (enCurso || inscripcion.clase.estado === "finalizada") {
    throw new AppError(
      "La clase ya comenzó, no se puede cancelar la inscripción.",
      409,
      "CLASS_ALREADY_STARTED",
    );
  }

  const horasRestantes = inicio ? (inicio.getTime() - ahora.getTime()) / MS_POR_HORA : Infinity;
  const pago = inscripcion.pago;
  const tienePagoReembolsable = Boolean(pago) && pago.estado === "aprobado" && !pago.reembolsado;
  const reembolsado = tienePagoReembolsable && horasRestantes >= HORAS_MINIMAS_PARA_REEMBOLSO;

  await prisma.$transaction(async (tx) => {
    const cambio = await enrollmentRepository.transicionarEstado(
      inscripcionId,
      inscripcion.estado,
      "cancelada",
      { canceladoPor: "estudiante" },
      tx,
    );

    if (!cambio) {
      throw new AppError("La inscripción ya cambió de estado.", 409, "INVALID_ENROLLMENT_STATE");
    }

    await enrollmentRepository.incrementarCupoDisponible(inscripcion.claseId, tx);

    if (reembolsado) {
      await paymentRepository.marcarComoReembolsado(
        pago.id,
        "cancelacion_estudiante_anticipada",
        tx,
      );
    }
  });

  return {
    cancelada: true,
    reembolsado,
    inscripcion: { id: inscripcionId, estado: "cancelada" },
    mensaje: reembolsado
      ? "Inscripción cancelada. Se generó un reembolso completo."
      : tienePagoReembolsable
        ? "Inscripción cancelada sin reembolso: faltaban menos de 2 horas para la clase."
        : "Inscripción cancelada.",
  };
};

module.exports = {
  crearInscripcion,
  obtenerHistorial,
  cancelarInscripcion,
};
