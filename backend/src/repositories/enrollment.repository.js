const prisma = require("../config/prisma");

// Estados en los que una inscripción "ocupa" un cupo y bloquea una nueva
// inscripción del mismo estudiante/menor a la misma clase.
const ESTADOS_ACTIVOS = ["pendiente_pago", "confirmada"];

// Relaciones que consume el historial (RF-014): clase con horarios, pago,
// asistencias y, si aplica, el menor inscrito.
const INCLUDE_DETALLE = {
  clase: { include: { horarios: true } },
  pago: true,
  asistencias: true,
  menor: true,
};

/**
 * Crea una inscripción `pendiente_pago` y descuenta un cupo de la clase en una
 * única transacción. La fila de la clase se bloquea con SELECT ... FOR UPDATE,
 * de modo que dos solicitudes concurrentes por el último cupo se serializan
 * y solo una de ellas lo obtiene (SDD 7.2).
 *
 * No lanza errores de negocio: devuelve `{ error }` con un código para que el
 * service lo traduzca a una respuesta HTTP, o `{ inscripcion }` si tuvo éxito.
 */
const crearConDecrementoDeCupo = async ({ claseId, usuarioId, menorId = null }) => {
  return await prisma.$transaction(async (tx) => {
    const filas = await tx.$queryRaw`
      SELECT id, estado, cupo_disponible AS cupoDisponible
      FROM clase
      WHERE id = ${claseId}
      FOR UPDATE
    `;

    const clase = filas[0];

    if (!clase) {
      return { error: "CLASE_NO_ENCONTRADA" };
    }

    if (clase.estado !== "activa") {
      return { error: "CLASE_NO_ACTIVA" };
    }

    if (Number(clase.cupoDisponible) <= 0) {
      return { error: "SIN_CUPO" };
    }

    // Con la fila de la clase bloqueada, esta verificación no tiene carreras.
    const duplicada = await tx.inscripcion.findFirst({
      where: {
        claseId,
        usuarioId,
        menorId,
        estado: { in: ESTADOS_ACTIVOS },
      },
      select: { id: true },
    });

    if (duplicada) {
      return { error: "INSCRIPCION_DUPLICADA" };
    }

    await tx.clase.update({
      where: { id: claseId },
      data: { cupoDisponible: { decrement: 1 } },
    });

    const inscripcion = await tx.inscripcion.create({
      data: {
        claseId,
        usuarioId,
        menorId,
        estado: "pendiente_pago",
      },
      include: INCLUDE_DETALLE,
    });

    return { inscripcion };
  });
};

const findById = async (id, client = prisma) => {
  return await client.inscripcion.findUnique({
    where: { id },
    include: INCLUDE_DETALLE,
  });
};

// Inscripciones hechas por una cuenta (incluye las de sus menores si es padre).
const findByUsuario = async (usuarioId) => {
  return await prisma.inscripcion.findMany({
    where: { usuarioId },
    include: INCLUDE_DETALLE,
    orderBy: { creadoEn: "desc" },
  });
};

const findByMenor = async (menorId) => {
  return await prisma.inscripcion.findMany({
    where: { menorId },
    include: INCLUDE_DETALLE,
    orderBy: { creadoEn: "desc" },
  });
};

const updateEstado = async (id, estado, extra = {}, client = prisma) => {
  return await client.inscripcion.update({
    where: { id },
    data: { estado, ...extra },
  });
};

/**
 * Cambia el estado solo si la inscripción sigue en `estadoEsperado`.
 * Devuelve true si la transición se aplicó. Evita que dos solicitudes
 * concurrentes (p. ej. pagar dos veces) apliquen el mismo cambio.
 */
const transicionarEstado = async (id, estadoEsperado, estado, extra = {}, client = prisma) => {
  const { count } = await client.inscripcion.updateMany({
    where: { id, estado: estadoEsperado },
    data: { estado, ...extra },
  });

  return count === 1;
};

const incrementarCupoDisponible = async (claseId, client = prisma) => {
  return await client.clase.update({
    where: { id: claseId },
    data: { cupoDisponible: { increment: 1 } },
  });
};

module.exports = {
  ESTADOS_ACTIVOS,
  crearConDecrementoDeCupo,
  findById,
  findByUsuario,
  findByMenor,
  updateEstado,
  transicionarEstado,
  incrementarCupoDisponible,
};
