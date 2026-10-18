const prisma = require("../config/prisma");
const enrollmentRepository = require("./enrollment.repository");

/**
 * RF-010: guardar la asistencia de una fecha es idempotente. Asistencia no tiene
 * clave única (inscripción + fecha), así que dentro de una transacción se borran las
 * filas existentes de esos alumnos para esa fecha y se vuelven a crear: guardar dos
 * veces deja una fila por alumno con los últimos valores. Se bloquea la fila de la
 * clase para que dos guardados simultáneos (doble clic) se serialicen y no dupliquen.
 * Si un alumno viene repetido en la petición, gana el último valor.
 */
const registrarVarias = async (claseId, fechaSesion, registros) => {
  const fecha = new Date(fechaSesion);
  const asistioPorInscripcion = new Map(
    registros.map((registro) => [registro.inscripcionId, registro.asistio]),
  );

  return await prisma.$transaction(async (tx) => {
    await enrollmentRepository.bloquearClase(claseId, tx);

    const inscripcionesDeLaClase = await tx.inscripcion.findMany({
      where: {
        id: { in: [...asistioPorInscripcion.keys()] },
        claseId,
      },
      select: { id: true },
    });

    const data = inscripcionesDeLaClase.map((inscripcion) => ({
      inscripcionId: inscripcion.id,
      fechaSesion: fecha,
      asistio: asistioPorInscripcion.get(inscripcion.id),
    }));

    await tx.asistencia.deleteMany({
      where: {
        inscripcionId: { in: data.map((fila) => fila.inscripcionId) },
        fechaSesion: fecha,
      },
    });

    return await tx.asistencia.createMany({ data });
  });
};

const findByClaseYFecha = async (claseId, fechaSesion) => {
  return await prisma.asistencia.findMany({
    where: {
      fechaSesion: new Date(fechaSesion),
      inscripcion: { claseId },
    },
    include: { inscripcion: true },
  });
};

module.exports = {
  registrarVarias,
  findByClaseYFecha,
};
