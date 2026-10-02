import api from "../api/api";

/**
 * Inscribe al usuario autenticado en una clase.
 *
 * POST /enrollments/:claseId
 *
 * Cuando un padre inscribe a un menor a su cargo se envia ademas
 * `{ menorId }` en el cuerpo; para un estudiante el cuerpo va vacio.
 */
export const createEnrollment = async ({ claseId, menorId }) => {
	const body = menorId ? { menorId } : {};

	return await api(`/enrollments/${claseId}`, {
		method: "POST",
		body: JSON.stringify(body),
	});
};

// Historial de inscripciones de un usuario (estudiante) o de un menor a cargo de un padre.
export const getEnrollmentHistory = async (userId) => {
	return await api(`/users/${userId}/enrollments`);
};

export default {
	createEnrollment,
	getEnrollmentHistory,
};
