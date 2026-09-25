const academyRequestService = require("../services/academyRequest.service");

const getRequests = async (req, res, next) => {
  try {
    const requests = await academyRequestService.listarPendientes();
    return res.status(200).json({ requests });
  } catch (error) {
    next(error);
  }
};

const approveRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const solicitud = await academyRequestService.aprobar(id, adminId);
    return res.status(200).json({ request: solicitud });
  } catch (error) {
    next(error);
  }
};

const rejectRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const solicitud = await academyRequestService.rechazar(id, adminId);
    return res.status(200).json({ request: solicitud });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRequests,
  approveRequest,
  rejectRequest,
};
