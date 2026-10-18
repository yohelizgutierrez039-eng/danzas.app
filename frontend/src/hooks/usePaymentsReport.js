import { useEffect, useState } from "react";

import { getPaymentsReport } from "../services/reports.service";

// Mensajes por código de error del backend (GET /reports/payments).
const ERROR_MESSAGES = {
  INVALID_DATE_RANGE:
    "El rango de fechas no es válido. La fecha inicial no puede ser posterior a la final.",
  FORBIDDEN: "No tienes permiso para consultar estos pagos.",
};

// Carga el reporte de pagos cada vez que cambia el objeto `filtros`.
// Para volver a consultar con los mismos valores basta pasar un objeto nuevo.
function usePaymentsReport(filtros) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadReport = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getPaymentsReport(filtros);

        if (!cancelled) {
          setReport(data);
        }
      } catch (err) {
        if (!cancelled) {
          setReport(null);
          setError(
            ERROR_MESSAGES[err.data?.error?.code] ||
              err.message ||
              "No se pudo generar el reporte de pagos.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadReport();

    return () => {
      cancelled = true;
    };
  }, [filtros]);

  return { report, loading, error };
}

export default usePaymentsReport;
