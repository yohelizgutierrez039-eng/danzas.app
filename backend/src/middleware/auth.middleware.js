const { AppError } = require("./errorHandler");
const jwtUtil = require("../utils/jwt.util");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Token no provisto o con formato inválido.", 401, "UNAUTHORIZED"));
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const payload = jwtUtil.verifyToken(token);
    req.user = { id: payload.id, rol: payload.rol };
    next();
  } catch (error) {
    next(new AppError("Token inválido o expirado.", 401, "UNAUTHORIZED"));
  }
};

module.exports = authMiddleware;
