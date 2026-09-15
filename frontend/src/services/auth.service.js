import api from "./api";

/**
 * Registra un nuevo usuario.
 *
 * @param {object} datos - Datos del usuario a registrar.
 * @returns {Promise<any>}
 */
export const register = async (datos) => {
  return await api("/auth/register", {
    method: "POST",
    body: JSON.stringify(datos),
  });
};

export default {
  register,
};
