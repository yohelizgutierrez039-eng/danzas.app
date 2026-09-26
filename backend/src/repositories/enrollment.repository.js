export const findHistorialByUsuario = async (usuarioId) => {
  return prisma.inscripcion.findMany({
    where: {
      usuarioId,
    },
    include: {
      clase: true,
    },
    orderBy: {
      fecha: "desc",
    },
  });
};

export const findHistorialByUsuario = async (usuarioId) => {
  return prisma.inscripcion.findMany({
    where: {
      usuarioId,
    },
    include: {
      clase: true,
    },
    orderBy: {
      fecha: "desc",
    },
  });
};