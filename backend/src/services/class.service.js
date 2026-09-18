const updateClass = async (id, data, instructorId) => {
  // Buscar la clase
  const classData = await Class.findByPk(id);

  if (!classData) {
    throw new Error("Clase no encontrada");
  }

  // Verificar que el instructor sea el propietario
  if (classData.instructor_id !== instructorId) {
    const error = new Error("No tienes permiso para modificar esta clase");
    error.status = 403;
    throw error;
  }

  await classData.update(data);

  return classData;
};

const deleteClass = async (id, instructorId) => {
  // Buscar la clase
  const classData = await Class.findByPk(id);

  if (!classData) {
    throw new Error("Clase no encontrada");
  }

  // Verificar propietario
  if (classData.instructor_id !== instructorId) {
    const error = new Error("No tienes permiso para eliminar esta clase");
    error.status = 403;
    throw error;
  }

  await classData.destroy();

  return {
    message: "Clase eliminada correctamente",
  };
};
