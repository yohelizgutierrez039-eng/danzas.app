const express = require("express");
const router = express.Router();

const dependentController = require("../controllers/dependent.controller");
const enrollmentController = require("../controllers/enrollment.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/dependents", authMiddleware, dependentController.createDependent);

router.get("/dependents", authMiddleware, dependentController.getDependents);

router.get(
  "/dependents/:id",
  authMiddleware,
  dependentController.getDependentById,
);

// Historial de inscripciones de un usuario o de un menor a cargo - RF-014
router.get("/:id/enrollments", authMiddleware, enrollmentController.obtenerHistorial);

module.exports = router;
