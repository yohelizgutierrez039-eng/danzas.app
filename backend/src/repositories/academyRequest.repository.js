const prisma = require("../config/prisma");

// Datos del instructor solicitante que necesitan las pantallas de administracion.
const incluirInstructor = {
  instructor: {
    select: { id: true, nombre: true, correo: true, ciudad: true },
  },
};

const findPending = async () => {
  return await prisma.solicitudAcademia.findMany({
    where: {
      estado: "pendiente",
    },
    include: incluirInstructor,
  });
};

const findById = async (id) => {
  return await prisma.solicitudAcademia.findUnique({
    where: {
      id,
    },
    include: incluirInstructor,
  });
};

const findByInstructor = async (instructorId) => {
  return await prisma.solicitudAcademia.findMany({
    where: {
      instructorId,
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
  findByInstructor,
  updateEstado,
};
