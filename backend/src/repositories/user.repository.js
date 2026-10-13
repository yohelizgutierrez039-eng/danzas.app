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

/**
 * Si se recibe `solicitudAcademia` ({ nombreAcademia }), la solicitud pendiente se
 * crea con una escritura anidada: Prisma ejecuta usuario + solicitud en una misma
 * transacción, así nunca queda un instructor sin solicitud (ni al revés).
 */
const create = async ({ rol, nombre, correo, passwordHash, ciudad, solicitudAcademia }) => {
  return await prisma.usuario.create({
    data: {
      rol,
      nombre,
      correo,
      passwordHash,
      ciudad,
      ...(solicitudAcademia && {
        solicitudes: {
          create: {
            nombreAcademia: solicitudAcademia.nombreAcademia ?? null,
            estado: "pendiente",
          },
        },
      }),
    },
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
