const userService = require("../services/user.service");

const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userService.suspenderUsuario(id);

    return res.status(200).json({
      message: "Usuario suspendido correctamente",
      user,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      error: {
        message: error.message || "Error al suspender el usuario",
      },
    });
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await userService.listarUsuarios();
    return res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await userService.eliminarUsuario(id);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  // controladores existentes...
  suspendUser,
  getUsers,
  deleteUser,
};
