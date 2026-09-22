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

module.exports = {
  searchClasses,
};