const usersRoutes = require("./routes/users.routes");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/database");
const { errorHandler } = require("./middleware/errorHandler");
const authRoutes = require("./routes/auth.routes");
const academyRequestsRoutes = require("./routes/academyRequests.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    mensaje: "Servidor funcionando correctamente",
  });
});

app.get("/api/prueba-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS resultado");

    res.json({
      mensaje: "Conexión con MySQL correcta",
      datos: rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al conectar con MySQL",
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/admin/academy-requests", academyRequestsRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
