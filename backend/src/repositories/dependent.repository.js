const prisma = require("../config/prisma");

const create = async ({ padreId, nombre, fechaNacimiento }) => {
  return await prisma.menor.create({
    data: {
      padreId,
      nombre,
      fechaNacimiento: new Date(fechaNacimiento),
    },
  });
};

const findByPadre = async (padreId) => {
  return await prisma.menor.findMany({ where: { padreId } });
};

const findById = async (id) => {
  return await prisma.menor.findUnique({ where: { id } });
};

module.exports = {
  create,
  findByPadre,
  findById,
};
