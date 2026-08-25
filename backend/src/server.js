const express = require("express");
const cors = require("cors");
const usuariosRoutes = require("./routes/usuarios.routes");
require("dotenv").config();

const pool = require("./config/database");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        mensaje: "Servidor funcionando correctamente"
    });
});

app.get("/api/prueba-db", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT 1 AS resultado");

        res.json({
            mensaje: "Conexión con MySQL correcta",
            datos: rows
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje: "Error al conectar con MySQL"
        });
    }
});

app.use("/api/usuarios", usuariosRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

