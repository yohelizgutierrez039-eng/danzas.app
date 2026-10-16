const notificationEmitter = require("./notificationEmitter");

/**
 * Emite el evento "correo" sin poder afectar a quien lo invoca. `construir` es
 * una funcion que arma uno o varios `{ destinatario, asunto, cuerpo }` (o
 * devuelve null para no enviar nada). Cualquier error al armar o emitir el
 * mensaje se registra y se descarta: un correo nunca debe romper la operacion
 * de negocio que lo origina. Los destinatarios vacios se omiten.
 */
const emitirCorreo = (construir) => {
  try {
    const mensajes = [].concat(construir() ?? []);

    for (const mensaje of mensajes) {
      if (!mensaje || !mensaje.destinatario) {
        continue;
      }

      try {
        notificationEmitter.emit("correo", mensaje);
      } catch (error) {
        console.error("[notificaciones] Error al emitir el correo:", error.message);
      }
    }
  } catch (error) {
    console.error("[notificaciones] Error al preparar el correo:", error.message);
  }
};

module.exports = emitirCorreo;
