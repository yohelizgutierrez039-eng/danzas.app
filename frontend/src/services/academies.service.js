import api from "../api/api";

/**
 * Obtener las solicitudes de academias.
 *
 * @returns {Promise<any>}
 */
export const getAcademyRequests = async () => {
	return await api("/admin/academy-requests");
};

/**
 * Obtener el detalle de una solicitud de academia.
 *
 * @param {string|number} id - ID de la solicitud.
 * @returns {Promise<any>}
 */
export const getAcademyRequestById = async (id) => {
	return await api(`/admin/academy-requests/${id}`);
};

/**
 * Aprobar una solicitud de academia.
 *
 * @param {string|number} id - ID de la solicitud.
 * @returns {Promise<any>}
 */
export const approveAcademyRequest = async (id) => {
	return await api(`/admin/academy-requests/${id}/approve`, {
		method: "POST",
	});
};

/**
 * Rechazar una solicitud de academia.
 *
 * @param {string|number} id - ID de la solicitud.
 * @returns {Promise<any>}
 */
export const rejectAcademyRequest = async (id) => {
	return await api(`/admin/academy-requests/${id}/reject`, {
		method: "POST",
	});
};

/**
 * Obtener el detalle de una academia ya aprobada.
 *
 * @param {string|number} id - ID de la academia.
 * @returns {Promise<any>}
 */
export const getAcademyById = async (id) => {
	return await api(`/admin/academies/${id}`);
};

export default {
	getAcademyRequests,
	getAcademyRequestById,
	approveAcademyRequest,
	rejectAcademyRequest,
	getAcademyById,
};
