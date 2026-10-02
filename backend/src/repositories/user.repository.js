const prisma = require("../config/prisma");

// Campos que se pueden exponer en las respuestas del panel de administración.
// Deja fuera passwordHash e intentos de login (datos sensibles).
const selectPublico = {
  id: true,
  nombre: true,
  correo: true,
  rol: true,
  ciudad: true,
  estado: true,
  creadoEn: true,
};

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
  return await prisma.usuario.findMany({
    select: selectPublico,
    orderBy: { creadoEn: "desc" },
  });
};

const findPublicById = async (id) => {
  return await prisma.usuario.findUnique({
    where: { id },
    select: selectPublico,
  });
};

const updatePublic = async (id, datos) => {
  return await prisma.usuario.update({
    where: { id },
    data: datos,
    select: selectPublico,
  });
};

const updateEstado = async (id, estado) => {
  return await prisma.usuario.update({
    where: { id },
    data: { estado },
    select: selectPublico,
  });
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
  findPublicById,
  updatePublic,
  updateEstado,
  deleteById,
};
