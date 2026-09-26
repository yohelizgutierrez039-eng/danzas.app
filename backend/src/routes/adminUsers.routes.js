const express = require("express");

const router = express.Router();

const userController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");
const requireRole = require("../middleware/roleGuard.middleware");

// Todas las rutas requieren autenticación y rol admin
router.use(authMiddleware, requireRole("admin"));

// Obtener usuarios
router.get("/", userController.getUsers);

// Suspender usuario
router.patch("/:id/suspend", userController.suspendUser);

// Eliminar usuario
router.delete("/:id", userController.deleteUser);

module.exports = router;