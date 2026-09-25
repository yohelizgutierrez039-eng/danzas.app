const prisma = require("../config/prisma");

const create = async ({ rol, nombre, correo, passwordHash, ciudad }) => {
  return await prisma.usuario.create({
    data: { rol, nombre, correo, passwordHash, ciudad },
  });
};

const findByEmail = async (correo) => {
  return await prisma.usuario.findUnique({ where: { correo } });
};

const findById = async (id) => {
  return await prisma.usuario.findUnique({ where: { id } });
};

const update = async (id, datos) => {
  return await prisma.usuario.update({ where: { id }, data: datos });
};

const findAll = async () => {
  return await prisma.usuario.findMany();
};

const updateEstado = async (id, estado) => {
  return await prisma.usuario.update({ where: { id }, data: { estado } });
};

const deleteById = async (id) => {
  return await prisma.usuario.delete({ where: { id } });
};

module.exports = {
  create,
  findByEmail,
  findById,
  update,
  findAll,
  updateEstado,
  deleteById,
};
