import api from "./api";

export const createEnrollment = async ({ claseId, menorId }) => {
  const body = {
    class_id: claseId,
  };

  // Solo se envía si el padre está inscribiendo a un menor
  if (menorId) {
    body.dependent_id = menorId;
  }

  return await api("/enrollments", {
    method: "POST",
    body: JSON.stringify(body),
  });
};
