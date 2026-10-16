import api from "../api/api";

export const getPaymentsReport = ({
  desde,
  hasta,
  instructorId,
  academia,
} = {}) => {
  const params = new URLSearchParams();

  if (desde) params.append("desde", desde);
  if (hasta) params.append("hasta", hasta);
  if (instructorId) params.append("instructor_id", instructorId);
  if (academia) params.append("academia", academia);

  const query = params.toString();
  const url = query ? `/reports/payments?${query}` : "/reports/payments";

  return api.get(url);
};

export const getAttendanceReport = (dependentId) => {
  const params = new URLSearchParams();

  if (dependentId !== undefined && dependentId !== null && dependentId !== "") {
    params.append("dependent_id", dependentId);
  }

  const query = params.toString();
  const url = query ? `/reports/attendance?${query}` : "/reports/attendance";

  return api.get(url);
};

export default {
  getPaymentsReport,
  getAttendanceReport,
};
