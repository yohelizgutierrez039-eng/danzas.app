/**
 * Etiquetas legibles de los estados de una solicitud de academia.
 */
export const ETIQUETAS_ESTADO_SOLICITUD = {
  pendiente: "Pendiente",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
};

/**
 * Convierte la solicitud cruda del backend (fila de SolicitudAcademia con el
 * instructor incluido) en la forma que consumen las pantallas de administracion.
 * Conserva los campos originales y agrega los derivados.
 *
 * @param {object} solicitud
 * @returns {object}
 */
export const normalizarSolicitud = (solicitud) => {
  const { id, nombreAcademia, estado, revisadoEn, instructor } = solicitud ?? {};

  return {
    ...solicitud,
    id,
    academyName: nombreAcademia || "Instructor independiente",
    instructorName: instructor?.nombre ?? "-",
    email: instructor?.correo ?? "-",
    city: instructor?.ciudad ?? "-",
    status: estado,
    reviewedAt: revisadoEn,
  };
};

/**
 * Extrae la lista de solicitudes de una respuesta (`{ requests: [...] }` o un
 * arreglo directo) y la normaliza. Siempre devuelve un arreglo.
 */
export const normalizarListaSolicitudes = (data) => {
  const lista = Array.isArray(data) ? data : data?.requests;

  return Array.isArray(lista) ? lista.map(normalizarSolicitud) : [];
};

/**
 * Extrae una solicitud de una respuesta (`{ request }` o el objeto directo) y
 * la normaliza. Devuelve null si no hay solicitud.
 */
export const normalizarRespuestaSolicitud = (data) => {
  const solicitud = data?.request ?? data;

  return solicitud && typeof solicitud === "object" ? normalizarSolicitud(solicitud) : null;
};

/**
 * Formatea una fecha ISO para mostrarla; devuelve "-" si no hay fecha valida.
 */
export const formatearFechaSolicitud = (fecha) => {
  if (!fecha) return "-";

  const date = new Date(fecha);

  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
};
