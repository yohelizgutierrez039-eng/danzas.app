
const paymentRepository = require("../repositories/payment.repository");
const { AppError } = require("../middleware/errorHandler");

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const esFechaValida = (fecha) => {
  if (!DATE_REGEX.test(fecha)) return false;

  const [year, month, day] = fecha.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const convertirMonto = (monto) => Number(monto ?? 0);

const reportePagos = async (usuario, filtros = {}) => {
  let { desde, hasta, instructorId, academia } = filtros;

  // Validar el rango de fechas.
  if (
    (desde && !esFechaValida(desde)) ||
    (hasta && !esFechaValida(hasta)) ||
    (desde && hasta && desde > hasta)
  ) {
    throw new AppError(
      "Rango de fechas inválido.",
      400,
      "INVALID_DATE_RANGE"
    );
  }

  // Los instructores solo pueden consultar sus propios pagos.
  if (usuario.rol === "instructor") {
    if (instructorId && String(instructorId) !== String(usuario.id)) {
      throw new AppError(
        "No podés ver los pagos de otro instructor.",
        403,
        "FORBIDDEN"
      );
    }

    instructorId = usuario.id;
  }

  const filtrosAplicados = {
    desde,
    hasta,
    instructorId,
    academia,
  };

  // Obtener los pagos mediante el repositorio.
  const pagos = await paymentRepository.buscarParaReporte(filtrosAplicados);

  // Calcular el resumen.
  let totalRecibido = 0;
  let totalReembolsado = 0;

  for (const pago of pagos) {
    const monto = convertirMonto(pago.monto);

    if (pago.estado === "aprobado") {
      totalRecibido += monto;
    }

    if (pago.reembolsado === true) {
      totalReembolsado += monto;
    }
  }

  return {
    filtros: filtrosAplicados,
    resumen: {
      cantidad: pagos.length,
      totalRecibido,
      totalReembolsado,
      neto: totalRecibido - totalReembolsado,
    },
    pagos,
  };
};

module.exports = {
  reportePagos,
};
