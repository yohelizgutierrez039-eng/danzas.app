const enrollmentRepository = require("../repositories/enrollment.repository");
const dependentRepository = require("../repositories/dependent.repository");
const userRepository = require("../repositories/user.repository");
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

module.exports = {
  crearInscripcion,
  obtenerHistorial,
};
