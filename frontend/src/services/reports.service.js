import api from "../api/api";

// Reporte de pagos recibidos (admin e instructor).
// Los filtros vacíos no se envían. El instructor no manda instructorId:
// el backend ya limita el reporte al instructor autenticado.
export const getPaymentsReport = async ({
  desde,
  hasta,
  instructorId,
  academia,
} = {}) => {
  const params = new URLSearchParams();

  if (desde) params.set("desde", desde);
  if (hasta) params.set("hasta", hasta);
  if (instructorId) params.set("instructor_id", instructorId);
  if (academia) params.set("academia", academia);

  const query = params.toString();

  return await api(`/reports/payments${query ? `?${query}` : ""}`);
};

// Reporte de asistencia de un menor a cargo del padre autenticado
export const getAttendanceReport = async (dependentId) => {
  const params = new URLSearchParams({ dependent_id: dependentId });

  return await api(`/reports/attendance?${params}`);
};

export default {
  getPaymentsReport,
  getAttendanceReport,
};
