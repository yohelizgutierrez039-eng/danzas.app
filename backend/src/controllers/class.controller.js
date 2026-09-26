const classService = require("../services/class.service");

const searchClasses = async (req, res) => {
  try {
    const { tipoBaile, ciudad } = req.query;

    const classes = await classService.searchClasses({
      tipoBaile,
      ciudad,
    });

    return res.status(200).json(classes);
  } catch (error) {
    console.error("Error al buscar clases:", error);

    return res.status(500).json({
      message: "Error al buscar las clases",
    });
  }
};

const createClass = async (req, res, next) => {
  try {
    const instructorId = req.user.id;

    const clase = await classService.crearClase(instructorId, req.body);

    return res.status(201).json(clase);
  } catch (error) {
    next(error);
  }
};

const updateClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const instructorId = req.user.id;

    const clase = await classService.editarClase(id, instructorId, req.body);

    return res.status(200).json(clase);
  } catch (error) {
    next(error);
  }
};

const cancelClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const instructorId = req.user.id;

    const clase = await classService.cancelarClase(id, instructorId);

    return res.status(200).json(clase);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchClasses,
  createClass,
  updateClass,
  cancelClass,
};
