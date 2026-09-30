import enrollmentRepository from "../repositories/enrollment.repository.js";
import dependentRepository from "../repositories/dependent.repository.js";
import AppError from "../utils/AppError.js";

export const obtenerHistorial = async (
  usuarioId,
  solicitanteId,
  solicitanteRol
) => {
  // El usuario puede consultar su propio historial
  if (usuarioId === solicitanteId) {
    return enrollmentRepository.findHistorialByUsuario(usuarioId);
  }

  // Un padre puede consultar el historial de uno de sus menores
  if (solicitanteRol === "padre") {
    const menor = await dependentRepository.findById(usuarioId);

    if (menor && menor.padreId === solicitanteId) {
      return enrollmentRepository.findHistorialByUsuario(usuarioId);
    }
  }

  // Cualquier otro caso no tiene autorización
  throw new AppError(
    "No tenés permiso para ver este historial.",
    403,
    "FORBIDDEN"
  );
};