const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const requireRole = require("../middlewares/roleGuard.middleware");
const academyRequestController = require("../controllers/academyRequest.controller");

// Obtener solicitudes de academia
router.get(
  "/",
  authMiddleware,
  requireRole("admin"),
  academyRequestController.getRequests
);

// Aprobar solicitud
router.post(
  "/:id/approve",
  authMiddleware,
  requireRole("admin"),
  academyRequestController.approveRequest
);

// Rechazar solicitud
router.post(
  "/:id/reject",
  authMiddleware,
  requireRole("admin"),
  academyRequestController.rejectRequest
);

module.exports = router;