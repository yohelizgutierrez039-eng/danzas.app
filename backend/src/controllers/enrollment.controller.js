const enrollmentService = require("../services/enrollment.service");

// El frontend envía class_id / dependent_id (snake_case); se aceptan también
// claseId / menorId por consistencia con el resto de la API.
const crearInscripcion = async (req, res, next) => {
  try {
    const body = req.body || {};

    const inscripcion = await enrollmentService.crearInscripcion(req.user, {
      claseId: body.class_id ?? body.claseId,
      menorId: body.dependent_id ?? body.menorId,
    });

    // enrollmentId y status son los nombres que lee el flujo de pago del frontend.
    return res.status(201).json({
      ...inscripcion,
      enrollmentId: inscripcion.id,
      status: inscripcion.estado,
    });
  } catch (error) {
    next(error);
  }
};

const obtenerHistorial = async (req, res, next) => {
  try {
    const inscripciones = await enrollmentService.obtenerHistorial(req.user, req.params.id);

    return res.status(200).json(inscripciones);
  } catch (error) {
    next(error);
  }
};

const cancelarInscripcion = async (req, res, next) => {
  try {
    const resultado = await enrollmentService.cancelarInscripcion(req.params.id, req.user);

    return res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  crearInscripcion,
  obtenerHistorial,
  cancelarInscripcion,
};
