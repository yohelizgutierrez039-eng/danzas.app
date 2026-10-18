const usersRoutes = require("./routes/users.routes");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const prisma = require("./config/prisma");
const { errorHandler } = require("./middleware/errorHandler");
const authRoutes = require("./routes/auth.routes");
const academyRequestsRoutes = require("./routes/academyRequests.routes");
const adminUsersRoutes = require("./routes/adminUsers.routes");
const classesRoutes = require("./routes/classes.routes");
const enrollmentsRoutes = require("./routes/enrollments.routes");
const reportsRoutes = require("./routes/reports.routes");
// Registra el listener del evento "correo" (RF-017) aunque ninguna ruta lo importe.
require("./services/email.service");

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
    // Se usa Prisma (y no un pool aparte) para probar exactamente la misma
    // conexión y los mismos argumentos de la URL (ssl, connection_limit) que el resto de la API.
    const filas = await prisma.$queryRaw`SELECT 1 AS resultado`;

    res.json({
      mensaje: "Conexión con MySQL correcta",
      // MySQL devuelve el entero como BigInt y JSON.stringify no lo soporta.
      datos: filas.map((fila) => ({ resultado: Number(fila.resultado) })),
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
app.use("/api/admin/users", adminUsersRoutes);
app.use("/api/classes", classesRoutes);
app.use("/api/enrollments", enrollmentsRoutes);
app.use("/api/reports", reportsRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});