const express = require("express");
const router = express.Router();

const enrollmentController = require("../controllers/enrollment.controller");
const authMiddleware = require("../middleware/auth.middleware");
const requireRole = require("../middleware/roleGuard.middleware");

// Inscripción a una clase - RF-012
router.post(
  "/",
  authMiddleware,
  requireRole("estudiante", "padre"),
  enrollmentController.crearInscripcion,
);

module.exports = router;
