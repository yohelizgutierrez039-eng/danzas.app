const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.user.id;

    const updatedClass = await classService.updateClass(
      id,
      req.body,
      instructorId,
    );

    return res.status(200).json({
      message: "Clase actualizada correctamente",
      class: updatedClass,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      error: {
        message: error.message || "Error al actualizar la clase",
      },
    });
  }
};
