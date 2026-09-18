import api from "./api";

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

export default {
  getUsers,
  getUserById,
  suspendUser,
  deleteUser,
};
