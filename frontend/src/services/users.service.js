import api from "../api/api";

// Obtener todos los usuarios
export const getUsers = async () => {
  return await api("/users");
};

// Obtener un usuario por su ID
export const getUserById = async (id) => {
  return await api(`/users/${id}`);
};

// Suspender un usuario
export const suspendUser = async (id) => {
  return await api(`/users/${id}/suspend`, {
    method: "PATCH",
  });
};

// Eliminar un usuario
export const deleteUser = async (id) => {
  return await api(`/users/${id}`, {
    method: "DELETE",
  });
};

// Registrar un menor a cargo del padre autenticado
// (el backend obtiene el padreId del token, no de la URL)
export const createDependent = async (datos) => {
  return await api("/users/dependents", {
    method: "POST",
    body: JSON.stringify(datos),
  });
};

// Obtener los menores a cargo del padre autenticado
export const getDependents = async () => {
  return await api("/users/dependents");
};

export default {
  getUsers,
  getUserById,
  suspendUser,
  deleteUser,
  createDependent,
  getDependents,
};
