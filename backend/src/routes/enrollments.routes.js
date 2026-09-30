const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const requireRole = require("../middlewares/requireRole");
const paymentController = require("../controllers/payment.controller");

router.post(
  "/:id/simulate-payment",
  authMiddleware,
  requireRole("estudiante", "padre"),
  paymentController.simulatePayment
);

module.exports = router;