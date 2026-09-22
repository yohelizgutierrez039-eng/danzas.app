const authService = require("../services/auth.service");

const register = async (req, res, next) => {
  try {
    const user = await authService.registrar(req.body);

    // No devolver la contraseña ni el hash
    const { passwordHash, ...userWithoutPassword } = user;

    return res.status(201).json({
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
};
