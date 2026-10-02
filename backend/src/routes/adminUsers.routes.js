const express = require("express");

const router = express.Router();

const userController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");
const requireRole = require("../middleware/roleGuard.middleware");

// Todas las rutas requieren autenticación y rol admin
router.use(authMiddleware, requireRole("admin"));

// Obtener usuarios
router.get("/", userController.getUsers);

// Obtener un usuario por id
router.get("/:id", userController.getUserById);

// Editar usuario (nombre, correo, ciudad, estado)
router.put("/:id", userController.updateUser);

// Suspender usuario
router.patch("/:id/suspend", userController.suspendUser);

// Eliminar usuario
router.delete("/:id", userController.deleteUser);

module.exports = router;