const API_URL = "http://localhost:3000/api";

/**
 * Iniciar sesión
 * @param {Object} credenciales - Correo y contraseña del usuario
 * @returns {Promise<Object>}
 */
export const login = async (credenciales) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credenciales),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "No fue posible iniciar sesión."
    );
  }

  return data;
};

/**
 * Recuperar contraseña
 * @param {string} correo - Correo electrónico de la cuenta
 * @returns {Promise<Object>}
 */
export const recoverPassword = async (correo) => {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: correo,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "No fue posible procesar la recuperación de contraseña."
    );
  }

  return data;
};

/**
 * Restablecer contraseña
 * @param {string} token - Token recibido para recuperar la cuenta
 * @param {string} nuevaPassword - Nueva contraseña
 * @returns {Promise<Object>}
 */
export const resetPassword = async (token, nuevaPassword) => {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token,
      password: nuevaPassword,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "No fue posible restablecer la contraseña."
    );
  }

  return data;
};
