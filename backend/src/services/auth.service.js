const bcrypt = require("bcrypt");
const userRepository = require("../repositories/user.repository");
const jwtUtil = require("../utils/jwt.util");
const emailService = require("./email.service");

const registrar = async ({ rol, nombre, correo, contraseña, ciudad }) => {
  const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!correoRegex.test(correo)) {
    const error = new Error("El formato del correo no es válido.");
    error.status = 400;
    throw error;
  }

  const usuarioExistente = await userRepository.findByEmail(correo);

  if (usuarioExistente) {
    const error = new Error("El correo ya está registrado.");
    error.status = 409;
    throw error;
  }

  const contraseñaValida =
    typeof contraseña === "string" &&
    contraseña.length >= 8 &&
    /[A-Za-z]/.test(contraseña) &&
    /\d/.test(contraseña);

  if (!contraseñaValida) {
    const error = new Error(
      "La contraseña debe tener mínimo 8 caracteres y combinar letras y números.",
    );
    error.status = 400;
    throw error;
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
    throw new Error("Correo o contraseña incorrectos");
  }

  const ahora = new Date();

  if (user.bloqueadoHasta && new Date(user.bloqueadoHasta) > ahora) {
    const diferenciaMs = new Date(user.bloqueadoHasta).getTime() - ahora.getTime();
    const minutosRestantes = Math.ceil(diferenciaMs / 60000);
    const error = new Error(
      `Cuenta bloqueada. Intenta nuevamente en ${minutosRestantes} minuto${minutosRestantes !== 1 ? "s" : ""}.`,
    );
    error.status = 423;
    throw error;
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
      const error = new Error(
        "Cuenta bloqueada durante 15 minutos por demasiados intentos fallidos.",
      );
      error.status = 423;
      throw error;
    }

    throw new Error("Correo o contraseña incorrectos");
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
    const err = new Error("El enlace de recuperación no es válido o ha expirado.");
    err.status = 400;
    throw err;
  }

  if (payload.tipo !== "recuperacion_password") {
    const error = new Error("Token de recuperación inválido.");
    error.status = 400;
    throw error;
  }

  if (!nuevaPassword || nuevaPassword.length < 8) {
    const error = new Error("La contraseña debe tener al menos 8 caracteres.");
    error.status = 400;
    throw error;
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
