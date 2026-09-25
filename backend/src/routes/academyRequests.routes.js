const express = require("express");
const router = express.Router();

const academyRequestController = require("../controllers/academyRequest.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const requireRole = require("../middlewares/roleGuard.middleware");

// Todas las rutas requieren autenticación y rol de administrador
router.use(authMiddleware);
router.use(requireRole("admin"));

// Obtener solicitudes de academias
router.get("/", academyRequestController.getAll);

// Aprobar solicitud
router.post("/:id/approve", academyRequestController.approve);

// Rechazar solicitud
router.post("/:id/reject", academyRequestController.reject);

module.exports = router;