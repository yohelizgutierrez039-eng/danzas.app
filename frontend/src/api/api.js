const API_URL = import.meta.env.VITE_API_URL;

/**
 * Obtiene el token guardado en localStorage.
 *
 * El AuthContext puede encargarse de guardar/actualizar
 * el token después del login.
 */
const getToken = () => {
  return localStorage.getItem("token");
};

/**
 * Wrapper base para realizar peticiones al backend.
 *
 * @param {string} endpoint - Ruta del endpoint.
 * @param {object} options - Opciones de fetch.
 * @returns {Promise<any>}
 */
const api = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  /*
   * Si existe un token, se agrega automáticamente
   * el encabezado Authorization.
   */
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  /*
   * Intentamos obtener la respuesta como JSON.
   * Si el backend no devuelve contenido, dejamos data en null.
   */
  let data;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  /*
   * Si la respuesta HTTP no fue exitosa,
   * lanzamos un error para que cada pantalla
   * pueda manejarlo con try/catch.
   */
  if (!response.ok) {
    const message =
      data?.error?.message ||
      data?.message ||
      "Ocurrió un error al comunicarse con el servidor.";

    const error = new Error(message);

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
};

export default api;
