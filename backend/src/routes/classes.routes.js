const express = require("express");
const router = express.Router();

const classController = require("../controllers/class.controller");
const attendanceController = require("../controllers/attendance.controller");
const authMiddleware = require("../middleware/auth.middleware");
const requireRole = require("../middleware/roleGuard.middleware");

// Búsqueda pública - RF-011
router.get("/search", classController.searchClasses);

// Mis clases (instructor) y detalle público - RF-008, RF-011, RF-005.
// ORDEN: /search y /my-classes van ANTES de /:id; si no, Express las tomaría como ids.
router.get("/my-classes", authMiddleware, requireRole("instructor"), classController.getMyClasses);
router.get("/:id", classController.getClassById);

// Creación, edición y cancelación - RF-008, RF-009
router.post("/", authMiddleware, requireRole("instructor"), classController.createClass);
router.put("/:id", authMiddleware, requireRole("instructor"), classController.updateClass);
router.delete("/:id", authMiddleware, requireRole("instructor"), classController.cancelClass);

// Asistencia - RF-010
router.post(
  "/:id/attendance",
  authMiddleware,
  requireRole("instructor"),
  attendanceController.registerAttendance,
);

module.exports = router;
