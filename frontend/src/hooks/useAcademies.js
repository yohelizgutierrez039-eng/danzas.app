import { useCallback, useState } from "react";
import {
  getAcademyRequests,
  getAcademyRequestById,
  approveAcademyRequest,
  rejectAcademyRequest,
  getAcademyById,
} from "../services/academies.service";

const useAcademies = () => {
  const [academies, setAcademies] = useState([]);
  const [academy, setAcademy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Obtener solicitudes de academias.
   */
  const fetchAcademyRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAcademyRequests();

      setAcademies(data);
      return data;
    } catch (err) {
      setError(err.message || "No fue posible cargar las solicitudes.");

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener una solicitud específica.
   */
  const fetchAcademyRequest = useCallback(async (id) => {
    try {
      setLoading(true);
      setError("");

      const data = await getAcademyRequestById(id);

      setAcademy(data);
      return data;
    } catch (err) {
      setError(err.message || "No fue posible cargar la solicitud.");

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener una academia ya aprobada.
   */
  const fetchAcademy = useCallback(async (id) => {
    try {
      setLoading(true);
      setError("");

      const data = await getAcademyById(id);

      setAcademy(data);
      return data;
    } catch (err) {
      setError(err.message || "No fue posible cargar la academia.");

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Aprobar una solicitud.
   */
  const approve = useCallback(async (id) => {
    try {
      setLoading(true);
      setError("");

      const data = await approveAcademyRequest(id);

      // Actualizar el listado eliminando la solicitud aprobada.
      setAcademies((prev) => prev.filter((item) => item.id !== id));

      return data;
    } catch (err) {
      setError(err.message || "No fue posible aprobar la solicitud.");

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Rechazar una solicitud.
   */
  const reject = useCallback(async (id) => {
    try {
      setLoading(true);
      setError("");

      const data = await rejectAcademyRequest(id);

      // Actualizar el listado eliminando la solicitud rechazada.
      setAcademies((prev) => prev.filter((item) => item.id !== id));

      return data;
    } catch (err) {
      setError(err.message || "No fue posible rechazar la solicitud.");

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Limpiar errores.
   */
  const clearError = () => {
    setError("");
  };

  return {
    academies,
    academy,
    loading,
    error,

    fetchAcademyRequests,
    fetchAcademyRequest,
    fetchAcademy,

    approve,
    reject,

    clearError,
  };
};

export default useAcademies;
