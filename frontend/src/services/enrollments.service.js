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

// Simula el pago de una inscripcion pendiente de pago.
export const simulatePayment = async (enrollmentId) => {
	return await api(`/enrollments/${enrollmentId}/simulate-payment`, {
		method: "POST",
	});
};

// Cancela una inscripcion (el backend decide si aplica reembolso).
export const cancelEnrollment = async (enrollmentId) => {
	return await api(`/enrollments/${enrollmentId}`, {
		method: "DELETE",
	});
};

export default {
	createEnrollment,
	getEnrollmentHistory,
	simulatePayment,
	cancelEnrollment,
};
