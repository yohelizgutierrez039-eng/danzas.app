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

module.exports = {
  // controladores existentes...
  suspendUser,
};
