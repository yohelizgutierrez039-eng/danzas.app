const express = require("express");
const router = express.Router();

const reportController = require("../controllers/report.controller");
const authMiddleware = require("../middleware/auth.middleware");
const requireRole = require("../middleware/roleGuard.middleware");

// Reporte de pagos recibidos - RF-015
router.get(
  "/payments",
  authMiddleware,
  requireRole("admin", "instructor"),
  reportController.getPaymentsReport,
);

// Reporte de asistencia de un hijo - RF-016
router.get(
  "/attendance",
  authMiddleware,
  requireRole("padre"),
  reportController.getAttendanceReport,
);

module.exports = router;
