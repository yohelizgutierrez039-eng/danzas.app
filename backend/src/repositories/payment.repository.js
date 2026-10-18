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

// RF-015: los dias del reporte son dias de Colombia (UTC-5, sin horario de verano),
// igual que los horarios de las clases. Los filtros llegan como YYYY-MM-DD ya validados.
const inicioDelDia = (fecha) => new Date(`${fecha}T00:00:00.000-05:00`);
const finDelDia = (fecha) => new Date(`${fecha}T23:59:59.999-05:00`);

// Solo los pagos aprobados cuentan como recibidos; un reembolso no cambia el estado
// del pago, solo marca `reembolsado`. Limitacion conocida: `marcarComoReembolsado`
// sobrescribe `procesadoEn`, asi que un pago reembolsado cae en el rango de fechas del
// reembolso y no en el del cobro.
const buscarParaReporte = async ({ desde, hasta, instructorId, academia }) => {
  const where = { estado: "aprobado" };

  if (desde || hasta) {
    where.procesadoEn = {
      ...(desde && { gte: inicioDelDia(desde) }),
      ...(hasta && { lte: finDelDia(hasta) }),
    };
  }

  const clase = {
    ...(instructorId && { instructorId }),
    ...(academia && {
      instructor: { solicitudes: { some: { estado: "aprobada", nombreAcademia: academia } } },
    }),
  };

  if (Object.keys(clase).length > 0) {
    where.inscripcion = { clase };
  }

  return await prisma.pago.findMany({
    where,
    include: {
      inscripcion: {
        include: {
          clase: {
            select: {
              id: true,
              tipoBaile: true,
              instructor: { select: { id: true, nombre: true } },
            },
          },
          usuario: { select: { id: true, nombre: true } },
          menor: { select: { id: true, nombre: true } },
        },
      },
    },
    orderBy: { procesadoEn: "desc" },
  });
};

module.exports = {
  create,
  findByInscripcionId,
  marcarComoReembolsado,
  buscarParaReporte,
};
