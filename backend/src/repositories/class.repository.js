const prisma = require("../config/prisma");

const searchClasses = async ({ tipoBaile, ciudad }) => {
  return await prisma.clase.findMany({
    where: {
      tipoBaile,
      ciudad,
      estado: "activa",
    },
  });
};

const create = async (datos) => {
  const {
    instructorId,
    tipoBaile,
    ciudad,
    modalidad,
    cupoMaximo,
    precio,
    diaSemana,
    horaInicio,
    horaFin,
  } = datos;

  return await prisma.clase.create({
    data: {
      instructorId,
      tipoBaile,
      ciudad,
      modalidad,
      cupoMaximo,
      cupoDisponible: cupoMaximo,
      precio,
      horarios: {
        create: [{ diaSemana, horaInicio, horaFin }],
      },
    },
    include: { horarios: true },
  });
};

const findById = async (id) => {
  return await prisma.clase.findUnique({
    where: { id },
    include: { horarios: true },
  });
};

const findByInstructor = async (instructorId, { estado } = {}, client = prisma) => {
  return await client.clase.findMany({
    where: {
      instructorId,
      ...(estado && { estado }),
    },
    include: { horarios: true },
  });
};

const search = async ({ tipoBaile, ciudad }) => {
  return await prisma.clase.findMany({
    where: {
      estado: "activa",
      ...(tipoBaile && { tipoBaile }),
      ...(ciudad && { ciudad }),
    },
  });
};

const update = async (id, datos) => {
  const {
    tipoBaile,
    ciudad,
    modalidad,
    cupoMaximo,
    precio,
    estado,
    diaSemana,
    horaInicio,
    horaFin,
  } = datos;

  const actualizaHorario =
    diaSemana !== undefined || horaInicio !== undefined || horaFin !== undefined;

  return await prisma.clase.update({
    where: { id },
    data: {
      ...(tipoBaile !== undefined && { tipoBaile }),
      ...(ciudad !== undefined && { ciudad }),
      ...(modalidad !== undefined && { modalidad }),
      ...(cupoMaximo !== undefined && { cupoMaximo }),
      ...(precio !== undefined && { precio }),
      ...(estado !== undefined && { estado }),
      ...(actualizaHorario && {
        horarios: {
          updateMany: {
            where: {},
            data: {
              ...(diaSemana !== undefined && { diaSemana }),
              ...(horaInicio !== undefined && { horaInicio }),
              ...(horaFin !== undefined && { horaFin }),
            },
          },
        },
      }),
    },
    include: { horarios: true },
  });
};

const eliminar = async (id) => {
  return await prisma.clase.update({
    where: { id },
    data: { estado: "cancelada" },
  });
};

module.exports = {
  searchClasses,
  create,
  findById,
  findByInstructor,
  update,
  delete: eliminar,
  search
};
