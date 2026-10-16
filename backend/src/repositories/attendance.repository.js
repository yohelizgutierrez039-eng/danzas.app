const prisma = require("../config/prisma");

const registrarVarias = async (claseId, fechaSesion, registros) => {
  const inscripcionIds = registros.map((registro) => registro.inscripcionId);

  const inscripcionesDeLaClase = await prisma.inscripcion.findMany({
    where: {
      id: { in: inscripcionIds },
      claseId,
    },
    select: { id: true },
  });

  const idsValidos = new Set(inscripcionesDeLaClase.map((inscripcion) => inscripcion.id));

  const data = registros
    .filter((registro) => idsValidos.has(registro.inscripcionId))
    .map((registro) => ({
      inscripcionId: registro.inscripcionId,
      fechaSesion: new Date(fechaSesion),
      asistio: registro.asistio,
    }));

  return await prisma.asistencia.createMany({ data });
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
