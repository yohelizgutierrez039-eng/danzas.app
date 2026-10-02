const crypto = require("crypto");

/**
 * Adaptador de pago (RNF-008 / SDD "Diseño desacoplado del pago").
 *
 * Contrato: `processPayment(monto, metadata)` devuelve
 * `{ aprobado: boolean, referencia: string }`. El resto del modulo de pagos
 * solo depende de este contrato; en v2.0 un MercadoPagoPaymentProvider o
 * WompiPaymentProvider lo implementa sin cambiar los servicios.
 */
class PaymentProvider {
  // eslint-disable-next-line no-unused-vars
  async processPayment(monto, metadata = {}) {
    throw new Error("processPayment no implementado");
  }
}

/**
 * Proveedor simulado de v1.0: sin red ni datos de tarjeta. Aprueba siempre,
 * salvo que `metadata.simularRechazo === true` (usado para probar el flujo de
 * rechazo).
 */
class SimulatedPaymentProvider extends PaymentProvider {
  async processPayment(monto, metadata = {}) {
    const aprobado = metadata.simularRechazo !== true;

    return {
      aprobado,
      referencia: `SIM-${crypto.randomBytes(5).toString("hex").toUpperCase()}`,
    };
  }
}

module.exports = {
  PaymentProvider,
  SimulatedPaymentProvider,
  paymentProvider: new SimulatedPaymentProvider(),
};
