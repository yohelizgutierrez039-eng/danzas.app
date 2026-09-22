const bcrypt = require("bcrypt");
const userRepository = require("../repositories/user.repository");
const { signToken } = require("../utils/jwt.util");

const login = async ({ correo, contraseña }) => {
  const user = await userRepository.findByEmail(correo);

  if (!user) {
    throw new Error("Correo o contraseña incorrectos");
  }

  const ahora = new Date();

  // Verificar si la cuenta está bloqueada
  if (user.bloqueadoHasta && new Date(user.bloqueadoHasta) > ahora) {
    const diferenciaMs =
      new Date(user.bloqueadoHasta).getTime() - ahora.getTime();

    const minutosRestantes = Math.ceil(diferenciaMs / 60000);

    const error = new Error(
      `Cuenta bloqueada. Intenta nuevamente en ${minutosRestantes} minuto${
        minutosRestantes !== 1 ? "s" : ""
      }.`,
    );

    error.status = 423;
    throw error;
  }

  // Comparar contraseña
  const passwordCorrecta = await bcrypt.compare(contraseña, user.contraseña);

  if (!passwordCorrecta) {
    const intentosFallidos = (user.intentosFallidos || 0) + 1;

    const datosActualizar = {
      intentosFallidos,
    };

    // Bloquear después de 5 intentos fallidos
    if (intentosFallidos >= 5) {
      const bloqueadoHasta = new Date(ahora.getTime() + 15 * 60 * 1000);

      datosActualizar.bloqueadoHasta = bloqueadoHasta;
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

  // Login exitoso: reiniciar intentos
  await userRepository.update(user.id, {
    intentosFallidos: 0,
    bloqueadoHasta: null,
  });

  // Generar JWT
  const token = signToken({
    id: user.id,
    rol: user.rol,
  });

  return {
    token,
    user,
  };
};
