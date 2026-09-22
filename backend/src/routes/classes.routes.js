const express = require("express");
const router = express.Router();

const classController = require("../controllers/class.controller");

// Búsqueda y filtrado de clases - RF-011
// Ruta pública, sin verifyToken
router.get("/search", classController.searchClasses);

module.exports = router;