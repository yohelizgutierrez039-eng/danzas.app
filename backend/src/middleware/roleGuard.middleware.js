const { AppError } = require("./errorHandler");

const requireRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.user.rol)) {
      return next(new AppError("No tenés permiso para acceder a este recurso.", 403, "FORBIDDEN"));
    }

    next();
  };
};

module.exports = requireRole;
