const { AppError } = require("./errorHandler");
const jwtUtil = require("../utils/jwt.util");
const userRepository = require("../repositories/user.repository");

/**
 * RF-007: además de verificar la firma del JWT, consulta al usuario para que la
 * suspensión (o un cambio de rol) surta efecto de inmediato y no cuando el token
 * expire. Una consulta por request es aceptable para v1.0.
 */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Token no provisto o con formato inválido.", 401, "UNAUTHORIZED"));
  }

  const token = authHeader.slice("Bearer ".length);

  let payload;

  try {
    payload = jwtUtil.verifyToken(token);
  } catch (error) {
    return next(new AppError("Token inválido o expirado.", 401, "UNAUTHORIZED"));
  }

  // Solo valen los tokens de sesión { id, rol } que emite el login. Otros tokens firmados
  // con el mismo secreto (p. ej. el de recuperación de contraseña, que trae `tipo`) no
  // deben autenticar: como el rol se lee de la BD, quedarían como el usuario real.
  if (payload.tipo || !payload.rol) {
    return next(new AppError("Token inválido o expirado.", 401, "UNAUTHORIZED"));
  }

  let usuario;

  try {
    usuario = await userRepository.findById(payload.id);
  } catch (error) {
    return next(error);
  }

  if (!usuario) {
    return next(new AppError("Token inválido o expirado.", 401, "UNAUTHORIZED"));
  }

  if (usuario.estado === "suspendido") {
    return next(new AppError("Tu cuenta está suspendida.", 403, "ACCOUNT_SUSPENDED"));
  }

  // El rol sale de la base de datos y no del token.
  req.user = { id: usuario.id, rol: usuario.rol };
  next();
};

module.exports = authMiddleware;
