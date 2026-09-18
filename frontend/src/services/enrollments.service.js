import api from "./api";

export const createEnrollment = async ({ claseId, menorId }) => {
  const body = {
    class_id: claseId,
  };

  if (menorId) {
    body.dependent_id = menorId;
  }

  return await api("/enrollments", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const getEnrollmentHistory = async (userId) => {
  return await api(`/users/${userId}/enrollments`);
};

export default {
  createEnrollment,
  getEnrollmentHistory,
};
