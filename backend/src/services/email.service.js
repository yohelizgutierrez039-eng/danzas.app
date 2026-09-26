const enviarCorreoVerificacion = async (destinatario, link) => {
  console.log("Enviando correo a...", destinatario, link || "");

  // TODO: conectar proveedor real (SendGrid/SES/Resend) — decisión pendiente, ver tarjeta de Despliegue en Notion.
};

module.exports = {
  enviarCorreoVerificacion,
};
