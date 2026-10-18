/**
 * Utilidad compartida por los scripts de despliegue (db:check y create:admin):
 * muestra A QUÉ base se van a conectar sin exponer credenciales.
 */

/**
 * Extrae host/puerto/base de DATABASE_URL sin exponer credenciales.
 *
 * Devuelve null (y nunca lanza ni incluye la URL en un error) si no se puede
 * interpretar con seguridad. En particular, una contraseña con "/" o "@" sin
 * codificar hace que `new URL` mezcle partes de la contraseña en host, puerto o
 * ruta: en ese caso es preferible no mostrar nada antes que filtrar la clave.
 */
const describirDestino = (databaseUrl) => {
  try {
    const url = new URL(databaseUrl);

    if (url.username === "" || url.pathname.includes("@")) {
      return null;
    }

    return {
      host: url.hostname,
      puerto: url.port || "3306",
      base: decodeURIComponent(url.pathname.replace(/^\//, "")),
    };
  } catch {
    return null;
  }
};

const formatearDestino = ({ host, puerto, base }) => `${host}:${puerto} (base: ${base || "sin nombre"})`;

module.exports = { describirDestino, formatearDestino };
