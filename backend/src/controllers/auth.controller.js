const authService = require("../services/auth.service");

const register = async (req, res, next) => {
  try {
    const user = await authService.registrar(req.body);
    const { passwordHash, ...userWithoutPassword } = user;

    return res.status(201).json({ user: userWithoutPassword });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { token, user } = await authService.login(req.body);
    const { passwordHash, ...userWithoutPassword } = user;

    return res.status(200).json({ token, user: userWithoutPassword });
  } catch (error) {
    next(error);
  }
};

const recoverPassword = async (req, res, next) => {
  try {
    const result = await authService.recuperarPassword(req.body.correo);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.restablecerPassword(req.body.token, req.body.password);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  recoverPassword,
  resetPassword,
};
