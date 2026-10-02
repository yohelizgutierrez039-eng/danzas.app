const express = require("express");
const router = express.Router();

const enrollmentController = require("../controllers/enrollment.controller");
const paymentController = require("../controllers/payment.controller");
const authMiddleware = require("../middleware/auth.middleware");
const requireRole = require("../middleware/roleGuard.middleware");

// Inscripción a una clase - RF-012
router.post(
  "/",
  authMiddleware,
  requireRole("estudiante", "padre"),
  enrollmentController.crearInscripcion,
);

// Pago simulado de una inscripción pendiente - RF-013
router.post(
  "/:id/simulate-payment",
  authMiddleware,
  requireRole("estudiante", "padre"),
  paymentController.simulatePayment,
);

module.exports = router;
