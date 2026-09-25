const academyRequestRepository = require("../repositories/academyRequest.repository");

const listarPendientes = async () => {
  return await academyRequestRepository.findPending();
};

const aprobar = async (solicitudId, adminId) => {
  const solicitud = await academyRequestRepository.updateEstado(solicitudId, {
    estado: "aprobada",
    revisadoPor: adminId,
    revisadoEn: new Date(),
  });

  console.log("Notificación al solicitante:", solicitud);

  return solicitud;
};

const rechazar = async (solicitudId, adminId) => {
  const solicitud = await academyRequestRepository.updateEstado(solicitudId, {
    estado: "rechazada",
    revisadoPor: adminId,
    revisadoEn: new Date(),
  });

  console.log("Notificación al solicitante:", solicitud);

  return solicitud;
};

module.exports = {
  listarPendientes,
  aprobar,
  rechazar,
};
