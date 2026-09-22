const dependentRepository = require("../repositories/dependent.repository");

const registrarMenor = async (
  padreId,
  rolSolicitante,
  { nombre, fechaNacimiento },
) => {
  // El solicitante debe ser padre
  if (rolSolicitante !== "padre") {
    const error = new Error(
      "Solo los usuarios con rol padre pueden registrar menores.",
    );
    error.status = 403;
    throw error;
  }

  // El padreId proviene del usuario autenticado
  return await dependentRepository.create({
    padreId,
    nombre,
    fechaNacimiento,
  });
};

module.exports = {
  registrarMenor,
};
