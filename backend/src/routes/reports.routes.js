
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const requireRole = require("../middleware/roleGuard.middleware");
const reportController = require("../controllers/report.controller");

router.get(
  "/payments",
  authMiddleware,
  requireRole("admin", "instructor"),
  reportController.getPaymentsReport
);

module.exports = router;
