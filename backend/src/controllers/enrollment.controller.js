const {
  crearConDecrementoDeCupo,
  findByUsuario,
} = require('../repositories/enrollment.repository');

/**
 * Crear una inscripción a una clase.
 *
 * POST /api/enrollments/:claseId
 */
const crearInscripcion = async (req, res) => {
  try {
    const { claseId } = req.params;
    const datosInscripcion = req.body;

    if (!claseId) {
      return res.status(400).json({
        success: false,
        message: 'El ID de la clase es obligatorio',
      });
    }

    if (!datosInscripcion.usuarioId) {
      return res.status(400).json({
        success: false,
        message: 'El ID del usuario es obligatorio',
      });
    }

    const inscripcion = await crearConDecrementoDeCupo(
      Number(claseId),
      datosInscripcion
    );

    return res.status(201).json({
      success: true,
      message: 'Inscripción creada exitosamente',
      data: inscripcion,
    });
  } catch (error) {
    console.error('Error al crear inscripción:', error);

    if (error.message === 'La clase no existe') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === 'No hay cupos disponibles para esta clase') {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error interno al crear la inscripción',
    });
  }
};

/**
 * Obtener las inscripciones de un usuario.
 *
 * GET /api/enrollments/usuario/:usuarioId
 */
const obtenerInscripcionesPorUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    if (!usuarioId) {
      return res.status(400).json({
        success: false,
        message: 'El ID del usuario es obligatorio',
      });
    }

    const inscripciones = await findByUsuario(Number(usuarioId));

    return res.status(200).json({
      success: true,
      data: inscripciones,
    });
  } catch (error) {
    console.error(
      'Error al obtener las inscripciones del usuario:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Error interno al obtener las inscripciones',
    });
  }
};

module.exports = {
  crearInscripcion,
  obtenerInscripcionesPorUsuario,
};
