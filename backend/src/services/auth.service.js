const bcrypt = require("bcrypt");
const userRepository = require("../repositories/user.repository");
const jwtUtil = require("../utils/jwt.util");
const emailService = require("./email.service");
const { AppError } = require("../middleware/errorHandler");

const registrar = async ({ rol, nombre, correo, contraseña, ciudad }) => {
  const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!correoRegex.test(correo)) {
    throw new AppError("El formato del correo no es válido.", 400, "INVALID_EMAIL_FORMAT");
  }

  const usuarioExistente = await userRepository.findByEmail(correo);

  if (usuarioExistente) {
    throw new AppError("El correo ya está registrado.", 409, "EMAIL_ALREADY_REGISTERED");
  }

  const contraseñaValida =
    typeof contraseña === "string" &&
    contraseña.length >= 8 &&
    /[A-Za-z]/.test(contraseña) &&
    /\d/.test(contraseña);

  if (!contraseñaValida) {
    throw new AppError(
      "La contraseña debe tener mínimo 8 caracteres y combinar letras y números.",
      400,
      "WEAK_PASSWORD",
    );
  }

  const passwordHash = await bcrypt.hash(contraseña, 10);

  const usuario = await userRepository.create({
    rol,
    nombre,
    correo,
    passwordHash,
    ciudad,
  });

  return usuario;
};

const login = async ({ correo, contraseña }) => {
  const user = await userRepository.findByEmail(correo);

  if (!user) {
    throw new AppError("Correo o contraseña incorrectos", 401, "INVALID_CREDENTIALS");
  }

  const ahora = new Date();

  if (user.bloqueadoHasta && new Date(user.bloqueadoHasta) > ahora) {
    const diferenciaMs = new Date(user.bloqueadoHasta).getTime() - ahora.getTime();
    const minutosRestantes = Math.ceil(diferenciaMs / 60000);
    throw new AppError(
      `Cuenta bloqueada. Intenta nuevamente en ${minutosRestantes} minuto${minutosRestantes !== 1 ? "s" : ""}.`,
      423,
      "ACCOUNT_LOCKED",
    );
  }

  const passwordCorrecta = await bcrypt.compare(contraseña, user.passwordHash);

  if (!passwordCorrecta) {
    const intentosFallidos = (user.intentosFallidos || 0) + 1;
    const datosActualizar = { intentosFallidos };

    if (intentosFallidos >= 5) {
      datosActualizar.bloqueadoHasta = new Date(ahora.getTime() + 15 * 60 * 1000);
    }

    await userRepository.update(user.id, datosActualizar);

    if (intentosFallidos >= 5) {
      throw new AppError(
        "Cuenta bloqueada durante 15 minutos por demasiados intentos fallidos.",
        423,
        "ACCOUNT_LOCKED",
      );
    }

    throw new AppError("Correo o contraseña incorrectos", 401, "INVALID_CREDENTIALS");
  }

  await userRepository.update(user.id, {
    intentosFallidos: 0,
    bloqueadoHasta: null,
  });

  const token = jwtUtil.signToken({ id: user.id, rol: user.rol });

  return { token, user };
};

const recuperarPassword = async (correo) => {
  const user = await userRepository.findByEmail(correo);

  if (!user) {
    return {
      message: "Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña.",
    };
  }

  const token = jwtUtil.signToken({ id: user.id, tipo: "recuperacion_password" }, "30m");
  const link = `http://localhost:5173/restablecer-password?token=${token}`;

  await emailService.enviarCorreoVerificacion(correo, link);

  return {
    message: "Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña.",
  };
};

const restablecerPassword = async (token, nuevaPassword) => {
  let payload;

  try {
    payload = jwtUtil.verifyToken(token);
  } catch (error) {
    throw new AppError(
      "El enlace de recuperación no es válido o ha expirado.",
      400,
      "INVALID_TOKEN",
    );
  }

  if (payload.tipo !== "recuperacion_password") {
    throw new AppError("Token de recuperación inválido.", 400, "INVALID_TOKEN");
  }

  if (!nuevaPassword || nuevaPassword.length < 8) {
    throw new AppError(
      "La contraseña debe tener al menos 8 caracteres.",
      400,
      "WEAK_PASSWORD",
    );
  }

  const passwordHash = await bcrypt.hash(nuevaPassword, 10);

  await userRepository.update(payload.id, { passwordHash });

  return { message: "Contraseña restablecida correctamente." };
};

module.exports = {
  registrar,
  login,
  recuperarPassword,
  restablecerPassword,
};
