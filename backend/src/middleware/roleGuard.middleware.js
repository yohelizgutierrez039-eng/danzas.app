const AppError = require("../utils/AppError");

const requireRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.user.rol)) {
      return next(new AppError(403, "FORBIDDEN"));
    }

    next();
  };
};

module.exports = requireRole;
