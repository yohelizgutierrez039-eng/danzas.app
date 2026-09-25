import api from "../api/api";

export const createEnrollment = async ({ claseId, menorId }) => {
	const body = {
		class_id: claseId,
	};

	// Se envía solo cuando el padre está inscribiendo a un menor.
	if (menorId) {
		body.dependent_id = menorId;
	}

	return await api("/enrollments", {
		method: "POST",
		body: JSON.stringify(body),
	});
};

// Historial de inscripciones de un usuario (uso administrativo).
export const getEnrollmentHistory = async (userId) => {
	return await api(`/users/${userId}/enrollments`);
};

export default {
	createEnrollment,
	getEnrollmentHistory,
};
