const prisma = require("../config/prisma");
const enrollmentRepository = require("../repositories/enrollment.repository");
const paymentRepository = require("../repositories/payment.repository");
const userRepository = require("../repositories/user.repository");
const { paymentProvider } = require("./payment/paymentProvider");
const { AppError } = require("../middleware/errorHandler");
const emitirCorreo = require("../events/emitirCorreo");
const plantillas = require("../utils/emailTemplates");

const estadoYaCambio = () =>
  new AppError("Esta inscripción ya no está pendiente de pago.", 409, "INVALID_ENROLLMENT_STATE");

/**
 * RF-017: avisa por correo al dueno de la inscripcion (el estudiante, o el padre
 * que inscribio al menor) el resultado del pago. Se ejecuta despues del commit,
 * sin esperarse, y nunca lanza: un correo fallido no afecta al pago.
 */
const notificarResultadoPago = async (inscripcion, pago, aprobado) => {
  try {
    const usuario = await userRepository.findById(inscripcion.usuarioId);

    emitirCorreo(() => {
      if (!usuario || !usuario.correo) {
        return null;
      }

      const datos = {
        nombre: usuario.nombre,
        clase: inscripcion.clase,
        monto: pago.monto,
        referencia: pago.referenciaPasarela,
        fecha: pago.procesadoEn || new Date(),
        nombreMenor: inscripcion.menor ? inscripcion.menor.nombre : null,
      };

      return {
        destinatario: usuario.correo,
        ...(aprobado ? plantillas.pagoAprobado(datos) : plantillas.pagoRechazado(datos)),
      };
    });
  } catch (error) {
    console.error("[notificaciones] No se pudo preparar el correo del pago:", error.message);
  }
};

/**
 * RF-013: simula el pago de una inscripción `pendiente_pago`.
 *  - Aprobado: se registra el Pago y la inscripcion pasa a `confirmada`.
 *  - Rechazado: se registra el Pago rechazado, la inscripcion se cancela y el
 *    cupo se libera (criterio de aceptacion del ERS); el usuario puede volver
 *    a inscribirse desde cero.
 * Solo el dueno de la inscripcion (el estudiante, o el padre que inscribio al
 * menor) puede pagarla.
 */
const simularPago = async (inscripcionId, solicitante, { simularRechazo = false } = {}) => {
  const inscripcion = await enrollmentRepository.findById(inscripcionId);

  if (!inscripcion) {
    throw new AppError("Inscripción no encontrada.", 404, "ENROLLMENT_NOT_FOUND");
  }

  if (inscripcion.usuarioId !== solicitante.id) {
    throw new AppError("No tenés permiso para pagar esta inscripción.", 403, "FORBIDDEN");
  }

  if (inscripcion.estado !== "pendiente_pago") {
    throw estadoYaCambio();
  }

  const resultado = await paymentProvider.processPayment(Number(inscripcion.clase.precio), {
    inscripcionId,
    simularRechazo,
  });

  const aprobado = resultado.aprobado === true;

  const pago = await prisma.$transaction(async (tx) => {
    // Primero el lock de la clase (ver bloquearClase): serializa este pago con
    // otras inscripciones/cancelaciones de la clase, incluida la del instructor.
    await enrollmentRepository.bloquearClase(inscripcion.claseId, tx);

    // La transicion condicional evita que dos pagos simultaneos de la misma
    // inscripcion se apliquen ambos.
    const cambio = await enrollmentRepository.transicionarEstado(
      inscripcionId,
      "pendiente_pago",
      aprobado ? "confirmada" : "cancelada",
      {},
      tx,
    );

    if (!cambio) {
      throw estadoYaCambio();
    }

    if (!aprobado) {
      await enrollmentRepository.incrementarCupoDisponible(inscripcion.claseId, tx);
    }

    return await paymentRepository.create(
      {
        inscripcionId,
        monto: inscripcion.clase.precio,
        estado: aprobado ? "aprobado" : "rechazado",
        referenciaPasarela: resultado.referencia,
      },
      tx,
    );
  });

  notificarResultadoPago(inscripcion, pago, aprobado);

  return {
    paymentStatus: pago.estado,
    receiptId: pago.referenciaPasarela,
    pago,
    inscripcion: {
      id: inscripcionId,
      estado: aprobado ? "confirmada" : "cancelada",
    },
    // Comprobante simulado con la informacion de uno real (RF-013).
    comprobante: {
      referencia: pago.referenciaPasarela,
      claseId: inscripcion.claseId,
      clase: inscripcion.clase.tipoBaile,
      monto: pago.monto,
      fecha: pago.procesadoEn,
      estado: pago.estado,
      esSimulado: true,
    },
  };
};

module.exports = {
  simularPago,
};
