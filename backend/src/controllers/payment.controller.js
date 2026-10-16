const paymentService = require("../services/payment.service");

const simulatePayment = async (req, res, next) => {
  try {
    // Solo fuera de produccion se permite forzar un rechazo para probar ese flujo.
    const simularRechazo =
      req.body?.simularRechazo === true && process.env.NODE_ENV !== "production";

    const resultado = await paymentService.simularPago(req.params.id, req.user, {
      simularRechazo,
    });

    // Un pago rechazado es un resultado valido de la simulacion, no un error HTTP.
    return res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  simulatePayment,
};
