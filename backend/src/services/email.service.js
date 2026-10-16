const notificationEmitter = require("../events/notificationEmitter");

// Adaptador delgado sobre la API REST de Resend (sin dependencias nuevas).
// El proveedor definitivo (Resend / SendGrid / SES) sigue pendiente: para
// cambiarlo solo hay que tocar `enviarConProveedor`; quienes emiten el evento
// "correo" no dependen del proveedor (patron Strategy, MOD-06).
const RESEND_URL = "https://api.resend.com/emails";
const TIMEOUT_ENVIO_MS = 10000;

/**
 * Entrega el correo al proveedor. Las credenciales se leen en cada envio (nunca
 * al importar el modulo) para que un entorno sin configurar no rompa el arranque.
 * Sin RESEND_API_KEY o EMAIL_FROM el correo se simula con un log.
 */
const enviarConProveedor = async ({ destinatario, asunto, cuerpo }) => {
  const apiKey = process.env.RESEND_API_KEY;
  const remitente = process.env.EMAIL_FROM;

  if (!apiKey || !remitente) {
    console.log(
      `[correo simulado] Para: ${destinatario} | Asunto: ${asunto} (RESEND_API_KEY o EMAIL_FROM sin configurar)`,
    );

    return { simulado: true };
  }

  const respuesta = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: remitente,
      to: destinatario,
      subject: asunto,
      text: cuerpo,
    }),
    signal: AbortSignal.timeout(TIMEOUT_ENVIO_MS),
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.text().catch(() => "");

    throw new Error(`El proveedor de correo respondió ${respuesta.status}. ${detalle}`.trim());
  }

  return await respuesta.json().catch(() => ({}));
};

const enviarNotificacion = async ({ destinatario, asunto, cuerpo } = {}) => {
  if (!destinatario || !asunto || !cuerpo) {
    throw new Error("Destinatario, asunto y cuerpo son obligatorios para enviar el correo.");
  }

  return await enviarConProveedor({ destinatario, asunto, cuerpo });
};

/**
 * Listener del evento "correo". Nunca lanza ni deja una promesa rechazada: un
 * correo fallido no debe romper la operacion de negocio ni tumbar el proceso.
 */
const manejarEventoCorreo = (datos) => {
  try {
    Promise.resolve(enviarNotificacion(datos)).catch((error) => {
      console.error("[notificaciones] No se pudo enviar el correo:", error.message);
    });
  } catch (error) {
    console.error("[notificaciones] No se pudo enviar el correo:", error.message);
  }
};

/**
 * Mantiene el contrato anterior: nunca lanza (p. ej. la recuperacion de
 * contrasena no debe revelar ni romperse por un fallo del proveedor).
 */
const enviarCorreoVerificacion = async (destinatario, link) => {
  try {
    return await enviarNotificacion({
      destinatario,
      asunto: "Verifica tu cuenta en Danzas.app",
      cuerpo: `Hola,

Para continuar, ingresa al siguiente enlace:

${link || ""}

Si no solicitaste esta acción, puedes ignorar este mensaje.`,
    });
  } catch (error) {
    console.error("[notificaciones] No se pudo enviar el correo:", error.message);
  }
};

/**
 * Correo de recuperacion de contrasena. Mismo patron "a prueba de fallos" que
 * enviarCorreoVerificacion: nunca lanza, para no revelar si el correo existe ni
 * romper la solicitud por un fallo del proveedor. El enlace vence a los 30
 * minutos (la vigencia la fija el token firmado en auth.service).
 */
const enviarCorreoRecuperacion = async (destinatario, link) => {
  try {
    return await enviarNotificacion({
      destinatario,
      asunto: "Recupera tu contraseña en Danzas.app",
      cuerpo: `Hola,

Recibimos una solicitud para restablecer la contraseña de tu cuenta en Danzas.app.

Ingresa al siguiente enlace para elegir una nueva contraseña (vence en 30 minutos):

${link || ""}

Si no solicitaste este cambio, puedes ignorar este mensaje: tu contraseña seguirá siendo la misma.`,
    });
  } catch (error) {
    console.error("[notificaciones] No se pudo enviar el correo:", error.message);
  }
};

notificationEmitter.on("correo", manejarEventoCorreo);

module.exports = {
  enviarCorreoVerificacion,
  enviarCorreoRecuperacion,
  enviarNotificacion,
  manejarEventoCorreo,
};
