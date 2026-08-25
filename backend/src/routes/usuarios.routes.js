const express = require("express");
const router = express.Router();

const pool = require("../config/database");

router.get("/", async (req, res) => {
    try {
        const [usuarios] = await pool.query(
            "SELECT * FROM usuarios"
        );

        res.json(usuarios);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje: "Error al obtener los usuarios"
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const { nombre, correo } = req.body;

        if (!nombre || !correo) {
            return res.status(400).json({
                mensaje: "Nombre y correo son obligatorios"
            });
        }

        const [resultado] = await pool.query(
            "INSERT INTO usuarios (nombre, correo) VALUES (?, ?)",
            [nombre, correo]
        );

        res.status(201).json({
            mensaje: "Usuario creado correctamente",
            id: resultado.insertId
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje: "Error al crear el usuario"
        });
    }
});

module.exports = router;
