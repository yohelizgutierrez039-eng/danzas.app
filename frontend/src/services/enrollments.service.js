import api from "../api/api";

/**
 * Inscribe al usuario autenticado en una clase.
 *
 * POST /enrollments con `{ class_id }`.
 *
 * Cuando un padre inscribe a un menor a su cargo se envia ademas
 * `dependent_id` en el cuerpo.
 */
export const createEnrollment = async ({ claseId, menorId }) => {
	const body = { class_id: claseId };

	if (menorId) {
		body.dependent_id = menorId;
	}

	return await api("/enrollments", {
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
