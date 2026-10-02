// Textos (en espanol) de los correos que emiten los modulos de negocio.
// Cada plantilla devuelve `{ asunto, cuerpo }`; el destinatario lo agrega quien emite.

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

const formatearMonto = (monto) => `$${Number(monto).toFixed(2)}`;

const formatearFecha = (fecha) =>
  new Date(fecha).toLocaleString("es-CO", { timeZone: "America/Bogota" });

// Las columnas TIME llegan como Date en UTC con la hora de pared (ver classSchedule.util).
const formatearHora = (hora) => {
  const fecha = new Date(hora);

  return `${String(fecha.getUTCHours()).padStart(2, "0")}:${String(fecha.getUTCMinutes()).padStart(2, "0")}`;
};

const describirClase = (clase) => {
  const horarios = (clase.horarios || []).map(
    (h) => `${DIAS[h.diaSemana]} ${formatearHora(h.horaInicio)}-${formatearHora(h.horaFin)}`,
  );

  return [
    `Clase de ${clase.tipoBaile} en ${clase.ciudad}`,
    horarios.length ? ` (${horarios.join(", ")})` : "",
  ].join("");
};

const paraQuien = (nombreMenor) => (nombreMenor ? ` de ${nombreMenor}` : "");

const pagoAprobado = ({ nombre, clase, monto, referencia, fecha, nombreMenor }) => ({
  asunto: `Pago aprobado: ${clase.tipoBaile}`,
  cuerpo: `Hola ${nombre},

Recibimos tu pago y la inscripción${paraQuien(nombreMenor)} quedó confirmada.

${describirClase(clase)}
Monto: ${formatearMonto(monto)}
Referencia del comprobante: ${referencia || "N/D"}
Fecha: ${formatearFecha(fecha)}

Este pago fue procesado en modo simulado.

Danzas.app`,
});

const pagoRechazado = ({ nombre, clase, monto, nombreMenor }) => ({
  asunto: `Pago rechazado: ${clase.tipoBaile}`,
  cuerpo: `Hola ${nombre},

Tu pago de ${formatearMonto(monto)} no fue aprobado, por lo que la inscripción${paraQuien(nombreMenor)} fue cancelada y el cupo se liberó.

${describirClase(clase)}

Puedes volver a inscribirte cuando quieras.

Danzas.app`,
});

const claseCanceladaPorInstructor = ({ nombre, clase, reembolso, monto, nombreMenor }) => ({
  asunto: `Clase cancelada: ${clase.tipoBaile}`,
  cuerpo: `Hola ${nombre},

El instructor canceló la clase y la inscripción${paraQuien(nombreMenor)} fue cancelada.

${describirClase(clase)}

${
  reembolso
    ? `Se generó un reembolso completo de ${formatearMonto(monto)}.`
    : "No había un pago aprobado, así que no corresponde reembolso."
}

Danzas.app`,
});

const solicitudAcademiaResuelta = ({ nombre, nombreAcademia, aprobada }) => ({
  asunto: aprobada ? "Solicitud de academia aprobada" : "Solicitud de academia rechazada",
  cuerpo: aprobada
    ? `Hola ${nombre},

Tu solicitud${nombreAcademia ? ` para la academia "${nombreAcademia}"` : ""} fue aprobada. Ya puedes publicar tus clases en Danzas.app.

Danzas.app`
    : `Hola ${nombre},

Lamentamos informarte que tu solicitud${nombreAcademia ? ` para la academia "${nombreAcademia}"` : ""} fue rechazada por el equipo de administración.

Danzas.app`,
});

const inscripcionCancelada = ({ nombre, clase, reembolsado, monto, habiaPagoReembolsable, nombreMenor }) => ({
  asunto: `Inscripción cancelada: ${clase.tipoBaile}`,
  cuerpo: `Hola ${nombre},

Cancelaste la inscripción${paraQuien(nombreMenor)} y el cupo fue liberado.

${describirClase(clase)}

${
  reembolsado
    ? `Se generó un reembolso completo de ${formatearMonto(monto)}.`
    : habiaPagoReembolsable
      ? "No hay reembolso: la cancelación se hizo con menos de 2 horas de anticipación a la clase."
      : "No había un pago aprobado, así que no corresponde reembolso."
}

Danzas.app`,
});

module.exports = {
  pagoAprobado,
  pagoRechazado,
  claseCanceladaPorInstructor,
  solicitudAcademiaResuelta,
  inscripcionCancelada,
};
