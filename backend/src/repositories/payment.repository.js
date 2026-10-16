const prisma = require("../config/prisma");



const create = async ({ inscripcionId, monto, estado, referenciaPasarela }, client = prisma) => {
  return await client.pago.create({
    data: {
      inscripcionId,
      monto,
      estado,
      esSimulado: true,
      referenciaPasarela,
      procesadoEn: new Date(),
    },
  });
};

const findByInscripcionId = async (inscripcionId, client = prisma) => {
  return await client.pago.findUnique({ where: { inscripcionId } });
};

const marcarComoReembolsado = async (pagoId, motivoReembolso, client = prisma) => {
  return await client.pago.update({
    where: { id: pagoId },
    data: {
      reembolsado: true,
      motivoReembolso,
      procesadoEn: new Date(),
    },
  });
};
const buscarParaReporte = async ({
  desde,
  hasta,
  instructorId,
  academia,
}) => {
  const where = {};

  if (desde || hasta) {
    where.procesadoEn = {};

    if (desde) {
      const fechaDesde = new Date(desde);
      fechaDesde.setHours(0, 0, 0, 0);
      where.procesadoEn.gte = fechaDesde;
    }

    if (hasta) {
      const fechaHasta = new Date(hasta);
      fechaHasta.setHours(23, 59, 59, 999);
      where.procesadoEn.lte = fechaHasta;
    }
  }

  if (instructorId) {
    where.inscripcion = {
      ...where.inscripcion,
      clase: {
        instructorId,
      },
    };
  }

  if (academia) {
    where.inscripcion = {
      ...where.inscripcion,
      clase: {
        ...where.inscripcion?.clase,
        instructor: {
          solicitudes: {
            some: {
              estado: "aprobada",
              nombreAcademia: academia,
            },
          },
        },
      },
    };
  }

  return prisma.pago.findMany({
    where,
    include: {
      inscripcion: {
        include: {
          clase: {
            select: {
              id: true,
              tipoBaile: true,
              instructor: {
                select: {
                  id: true,
                  nombre: true,
                },
              },
            },
          },
          usuario: {
            select: {
              id: true,
              nombre: true,
              correo: true,
            },
          },
          menor: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      },
    },
    orderBy: {
      procesadoEn: "desc",
    },
  });
};
module.exports = {
  create,
  findByInscripcionId,
  marcarComoReembolsado,
  buscarParaReporte,
};
