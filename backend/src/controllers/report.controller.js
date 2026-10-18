const reportService = require("../services/report.service");

const getPaymentsReport = async (req, res, next) => {
  try {
    const { desde, hasta, academia } = req.query;

    const reporte = await reportService.reportePagos(req.user, {
      desde,
      hasta,
      instructorId: req.query.instructor_id,
      academia,
    });

    return res.status(200).json(reporte);
  } catch (error) {
    next(error);
  }
};

const getAttendanceReport = async (req, res, next) => {
  try {
    const reporte = await reportService.reporteAsistencia(req.user, req.query.dependent_id);

    return res.status(200).json(reporte);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPaymentsReport,
  getAttendanceReport,
};
