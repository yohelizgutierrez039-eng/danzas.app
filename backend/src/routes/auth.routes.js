const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post("/register", authController.register);
router.post("/login", authController.login);

// Recuperación de contraseña - RF-003
router.post("/forgot-password", authController.recoverPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
