const dependentRepository = require("../repositories/dependent.repository");
const { AppError } = require("../middleware/errorHandler");

// Edad maxima aceptada para un menor a cargo (margen generoso sobre los 18 años).
const EDAD_MAXIMA_MENOR = 21;

// "Hoy" como dia de calendario en Colombia (UTC-5): con la hora UTC, de noche
// un padre podria registrar el dia siguiente.
const hoyEnColombia = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });

// Fecha real en formato YYYY-MM-DD (rechaza dias inexistentes como 2018-02-31),
// que no sea futura y que no tenga mas de EDAD_MAXIMA_MENOR años. Se comparan
// los dias como texto ISO, que ordena igual que las fechas.
const esFechaNacimientoValida = (valor) => {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return false;
  }

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime()) || fecha.toISOString().slice(0, 10) !== valor) {
    return false;
  }

  const hoy = hoyEnColombia();
  const masAntigua = `${Number(hoy.slice(0, 4)) - EDAD_MAXIMA_MENOR}${hoy.slice(4)}`;

  return valor <= hoy && valor >= masAntigua;
};

const registrarMenor = async (
  padreId,
  rolSolicitante,
  { nombre, fechaNacimiento },
) => {
  // El solicitante debe ser padre
  if (rolSolicitante !== "padre") {
    throw new AppError(
      "Solo los usuarios con rol padre pueden registrar menores.",
      403,
      "FORBIDDEN_NOT_PARENT",
    );
  }

  if (!esFechaNacimientoValida(fechaNacimiento)) {
    throw new AppError(
      `La fecha de nacimiento debe ser válida (AAAA-MM-DD), no futura y de una persona de hasta ${EDAD_MAXIMA_MENOR} años.`,
      400,
      "INVALID_BIRTHDATE",
    );
  }

  // El padreId proviene del usuario autenticado
  return await dependentRepository.create({
    padreId,
    nombre,
    fechaNacimiento,
  });
};

const listarMenores = async (padreId) => {
  return await dependentRepository.findByPadre(padreId);
};

const obtenerMenorPorId = async (id, solicitante) => {
  const menor = await dependentRepository.findById(id);

  if (!menor) {
    throw new AppError("Menor no encontrado.", 404, "DEPENDENT_NOT_FOUND");
  }

  // Solo el padre a cargo o un admin pueden ver los datos de un menor
  const esPadreACargo = solicitante.rol === "padre" && menor.padreId === solicitante.id;

  if (!esPadreACargo && solicitante.rol !== "admin") {
    throw new AppError("No tenés permiso para ver este menor.", 403, "FORBIDDEN");
  }

  return menor;
};

module.exports = {
  registrarMenor,
  listarMenores,
  obtenerMenorPorId,
};
