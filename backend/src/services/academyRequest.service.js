const academyRequestRepository = require("../repositories/academyRequest.repository");
const userRepository = require("../repositories/user.repository");
const emitirCorreo = require("../events/emitirCorreo");
const plantillas = require("../utils/emailTemplates");
const { AppError } = require("../middleware/errorHandler");

/**
 * RF-017: avisa por correo al instructor solicitante la decision del admin.
 * Sin esperarse y sin lanzar: no afecta a la revision ya guardada.
 */
const notificarSolicitante = async (solicitud, aprobada) => {
  try {
    const instructor = await userRepository.findById(solicitud.instructorId);

    emitirCorreo(() => {
      if (!instructor || !instructor.correo) {
        return null;
      }

      return {
        destinatario: instructor.correo,
        ...plantillas.solicitudAcademiaResuelta({
          nombre: instructor.nombre,
          nombreAcademia: solicitud.nombreAcademia,
          aprobada,
        }),
      };
    });
  } catch (error) {
    console.error("[notificaciones] No se pudo preparar el correo de la solicitud:", error.message);
  }
};

const listarPendientes = async () => {
  return await academyRequestRepository.findPending();
};

const obtenerSolicitud = async (solicitudId) => {
  const solicitud = await academyRequestRepository.findById(solicitudId);

  if (!solicitud) {
    throw new AppError("Solicitud no encontrada.", 404, "REQUEST_NOT_FOUND");
  }

  return solicitud;
};

const aprobar = async (solicitudId, adminId) => {
  const solicitud = await academyRequestRepository.updateEstado(solicitudId, {
    estado: "aprobada",
    revisadoPor: adminId,
    revisadoEn: new Date(),
  });

  notificarSolicitante(solicitud, true);

  return solicitud;
};

const rechazar = async (solicitudId, adminId) => {
  const solicitud = await academyRequestRepository.updateEstado(solicitudId, {
    estado: "rechazada",
    revisadoPor: adminId,
    revisadoEn: new Date(),
  });

  notificarSolicitante(solicitud, false);

  return solicitud;
};

module.exports = {
  listarPendientes,
  obtenerSolicitud,
  aprobar,
  rechazar,
};
