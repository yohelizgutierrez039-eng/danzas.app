const express = require("express");
const router = express.Router();

const classController = require("../controllers/class.controller");
const attendanceController = require("../controllers/attendance.controller");
const authMiddleware = require("../middleware/auth.middleware");
const requireRole = require("../middleware/requireRole");

// Búsqueda y filtrado de clases - RF-011
// Ruta pública, sin verifyToken
router.get("/search", classController.searchClasses);

// Registro de asistencia
router.post(
  "/:id/attendance",
  authMiddleware,
  requireRole("instructor"),
  attendanceController.registerAttendance
);

module.exports = router;
