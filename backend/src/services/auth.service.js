import api from "./api";

export const register = async (datos) => {
  return await api("/auth/register", {
    method: "POST",
    body: JSON.stringify(datos),
  });
};
