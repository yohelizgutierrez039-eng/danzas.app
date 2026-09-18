import api from "./api";

export const searchClasses = async ({ tipo, ciudad } = {}) => {
  const params = new URLSearchParams();

  if (tipo) {
    params.append("tipo", tipo);
  }

  if (ciudad) {
    params.append("ciudad", ciudad);
  }

  const queryString = params.toString();

  return await api(`/classes/search${queryString ? `?${queryString}` : ""}`);
};

export default {
  searchClasses,
};
