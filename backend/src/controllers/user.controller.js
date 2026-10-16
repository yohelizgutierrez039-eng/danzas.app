const userService = require("../services/user.service");

const suspendUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await userService.suspenderUsuario(id, req.user.id);

    return res.status(200).json({
      message: "Usuario suspendido correctamente",
      user,
    });
  } catch (error) {
    next(error);
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

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.obtenerUsuario(req.params.id);
    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.actualizarUsuario(
      req.params.id,
      req.body,
      req.user.id,
    );

    return res.status(200).json({
      message: "Usuario actualizado correctamente",
      user,
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await userService.eliminarUsuario(id, req.user.id);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  suspendUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
