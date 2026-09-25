const prisma = require("../config/prisma");

const findPending = async () => {
  return await prisma.solicitudAcademia.findMany({
    where: {
      estado: "pendiente",
    },
  });
};

const findById = async (id) => {
  return await prisma.solicitudAcademia.findUnique({
    where: {
      id,
    },
  });
};

const updateEstado = async (id, { estado, revisadoPor, revisadoEn }) => {
  return await prisma.solicitudAcademia.update({
    where: {
      id,
    },
    data: {
      estado,
      revisadoPor,
      revisadoEn,
    },
  });
};

module.exports = {
  findPending,
  findById,
  updateEstado,
};
