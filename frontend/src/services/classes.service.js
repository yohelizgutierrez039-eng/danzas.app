import api from "./api";

// Buscar clases públicamente
export const searchClasses = async ({ tipo, ciudad } = {}) => {
  const params = new URLSearchParams();

  if (tipo) params.append("tipo", tipo);
  if (ciudad) params.append("ciudad", ciudad);

  const queryString = params.toString();

  return await api(`/classes/search${queryString ? `?${queryString}` : ""}`);
};

// Obtener una clase por su ID
export const getClassById = async (id) => {
  return await api(`/classes/${id}`);
};

// Crear una nueva clase como instructor
export const createClass = async (classData) => {
  return await api("/classes", {
    method: "POST",
    body: JSON.stringify(classData),
  });
};

// Actualizar una clase del instructor
export const updateClass = async (id, classData) => {
  return await api(`/classes/${id}`, {
    method: "PUT",
    body: JSON.stringify(classData),
  });
};

// Eliminar una clase
export const deleteClass = async (id) => {
  return await api(`/classes/${id}`, {
    method: "DELETE",
  });
};

// Obtener las clases creadas por el instructor
export const getMyClasses = async () => {
  return await api("/classes/my-classes");
};

export default {
  searchClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getMyClasses,
};
