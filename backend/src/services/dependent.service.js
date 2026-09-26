const dependentRepository = require("../repositories/dependent.repository");
const { AppError } = require("../middleware/errorHandler");

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

const obtenerMenorPorId = async (id) => {
  const menor = await dependentRepository.findById(id);

  if (!menor) {
    throw new AppError("Menor no encontrado.", 404, "DEPENDENT_NOT_FOUND");
  }

  return menor;
};

module.exports = {
  registrarMenor,
  listarMenores,
  obtenerMenorPorId,
};
