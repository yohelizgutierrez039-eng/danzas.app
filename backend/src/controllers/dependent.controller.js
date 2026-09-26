const dependentService = require("../services/dependent.service");

const createDependent = async (req, res, next) => {
  try {
    const padreId = req.user.id;
    const rolSolicitante = req.user.rol;

    const { nombre, fechaNacimiento } = req.body;

    const menor = await dependentService.registrarMenor(
      padreId,
      rolSolicitante,
      {
        nombre,
        fechaNacimiento,
      },
    );

    return res.status(201).json({
      dependent: menor,
    });
  } catch (error) {
    next(error);
  }
};

const getDependents = async (req, res, next) => {
  try {
    const padreId = req.user.id;

    const menores = await dependentService.listarMenores(padreId);

    return res.status(200).json({
      dependents: menores,
    });
  } catch (error) {
    next(error);
  }
};

const getDependentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const menor = await dependentService.obtenerMenorPorId(id);

    return res.status(200).json({
      dependent: menor,
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  createDependent,
  getDependents,
  getDependentById,
};
