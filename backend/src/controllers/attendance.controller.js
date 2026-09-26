const attendanceService = require("../services/attendance.service");

const registerAttendance = async (req, res, next) => {
  try {
    const claseId = req.params.id;
    const instructorId = req.user.id;
    const { fechaSesion, registros } = req.body;

    const resultado = await attendanceService.registrarAsistencia(
      claseId,
      instructorId,
      fechaSesion,
      registros,
    );

    return res.status(201).json(resultado);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerAttendance,
};
