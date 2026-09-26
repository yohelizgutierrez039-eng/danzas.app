```javascript
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Crea una inscripción y descuenta un cupo de la clase
 * dentro de una única transacción.
 */
async function crearConDecrementoDeCupo(claseId, datosInscripcion) {
  return prisma.$transaction(async (tx) => {
    // Bloquea la fila de la clase para evitar condiciones de carrera.
    const clases = await tx.$queryRaw`
      SELECT *
      FROM "Clase"
      WHERE id = ${claseId}
      FOR UPDATE
    `;

    const clase = clases[0];

    if (!clase) {
      throw new Error("La clase no existe");
    }

    if (clase.cupoDisponible <= 0) {
      throw new Error("No hay cupos disponibles");
    }

    // Descontar un cupo.
    await tx.clase.update({
      where: { id: claseId },
      data: {
        cupoDisponible: {
          decrement: 1,
        },
      },
    });

    // Crear la inscripción.
    const inscripcion = await tx.inscripcion.create({
      data: {
        ...datosInscripcion,
        claseId,
      },
    });

    return inscripcion;
  });
}

/**
 * Busca las inscripciones pertenecientes a un usuario.
 */
async function findByUsuario(usuarioId) {
  return prisma.inscripcion.findMany({
    where: {
      usuarioId,
    },
  });
}

module.exports = {
  crearConDecrementoDeCupo,
  findByUsuario,
};

