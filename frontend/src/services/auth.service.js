import api from "../api/api";

/**
 * Registrar un nuevo usuario
 * @param {Object} datos - { rol, nombre, correo, contraseña, ciudad }
 * @returns {Promise<Object>}
 */
export const register = async (datos) => {
  return await api("/auth/register", {
    method: "POST",
    body: JSON.stringify(datos),
  });
};

/**
 * Iniciar sesión
 * @param {Object} credenciales - Correo y contraseña del usuario
 * @returns {Promise<Object>}
 */
export const login = async (credenciales) => {
  return await api("/auth/login", {
    method: "POST",
    body: JSON.stringify(credenciales),
  });
};

/**
 * Recuperar contraseña
 * @param {string} correo - Correo electrónico de la cuenta
 * @returns {Promise<Object>}
 */
export const recoverPassword = async (correo) => {
  return await api("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email: correo }),
  });
};

/**
 * Restablecer contraseña
 * @param {string} token - Token recibido para recuperar la cuenta
 * @param {string} nuevaPassword - Nueva contraseña
 * @returns {Promise<Object>}
 */
export const resetPassword = async (token, nuevaPassword) => {
  return await api("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password: nuevaPassword }),
  });
};
