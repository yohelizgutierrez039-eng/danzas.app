import { obtenerHistorial } from "../services/enrollment.service.js";

export const getHistory = async (req, res, next) => {
  try {
    const usuarioId = req.params.id;
    const solicitanteId = req.user.id;
    const solicitanteRol = req.user.rol;

    const historial = await obtenerHistorial(
      usuarioId,
      solicitanteId,
      solicitanteRol
    );

    return res.status(200).json(historial);
  } catch (error) {
    next(error);
  }
};