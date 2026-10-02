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

module.exports = {
  create,
  findByInscripcionId,
  marcarComoReembolsado,
};
