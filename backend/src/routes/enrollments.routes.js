const express = require('express');

const {
  crearInscripcion,
  obtenerInscripcionesPorUsuario,
} = require('../controllers/enrollment.controller');

const authMiddleware = require('../middlewares/auth.middleware');
const roleGuard = require('../middlewares/roleGuard.middleware');

const router = express.Router();

/**
 * Crear una inscripción.
 *
 * POST /api/enrollments/:claseId
 *
 * Solo usuarios autenticados con rol ESTUDIANTE.
 */
router.post(
  '/:claseId',
  authMiddleware,
  roleGuard('ESTUDIANTE'),
  crearInscripcion
);

/**
 * Obtener las inscripciones de un usuario.
 *
 * GET /api/enrollments/usuario/:usuarioId
 *
 * Solo usuarios autenticados.
 */
router.get(
  '/usuario/:usuarioId',
  authMiddleware,
  obtenerInscripcionesPorUsuario
);

module.exports = router;
