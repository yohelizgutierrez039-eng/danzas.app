import { useCallback, useState } from "react";

import {
  searchClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getMyClasses,
} from "../services/classes.service";

function useClasses() {
  const [classes, setClasses] = useState([]);
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Buscar clases
  const search = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const data = await searchClasses(filters);

      const result = Array.isArray(data)
        ? data
        : data?.classes || data?.data || [];

      setClasses(result);

      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener una clase por ID
  const getById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const data = await getClassById(id);

      const result = data?.class || data?.data || data;

      setClassData(result);

      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener las clases del instructor
  const getMine = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getMyClasses();

      const result = Array.isArray(data)
        ? data
        : data?.classes || data?.data || [];

      setClasses(result);

      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear una clase
  const create = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);

      const result = await createClass(data);

      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar una clase
  const update = useCallback(async (id, data) => {
    try {
      setLoading(true);
      setError(null);

      const result = await updateClass(id, data);

      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar una clase
  const remove = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const result = await deleteClass(id);

      // También actualizamos la lista local
      setClasses((prev) => prev.filter((item) => item.id !== id));

      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    classes,
    classData,
    loading,
    error,

    search,
    getById,
    getMine,
    create,
    update,
    remove,

    clearError,
  };
}

export default useClasses;
