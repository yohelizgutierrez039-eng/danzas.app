const userRepository = require("../repositories/user.repository");
const { AppError } = require("../middleware/errorHandler");

const CORREO_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ESTADOS_VALIDOS = ["pendiente", "activo", "suspendido"];

// Campos que el admin puede enviar al editar un usuario.
// `rol` se acepta solo si coincide con el actual (ver actualizarUsuario).
const CAMPOS_EDITABLES = ["nombre", "correo", "ciudad", "estado", "rol"];

const usuarioNoEncontrado = () =>
  new AppError("Usuario no encontrado.", 404, "USER_NOT_FOUND");

const listarUsuarios = async () => {
  return await userRepository.findAll();
};

const obtenerUsuario = async (id) => {
  const usuario = await userRepository.findPublicById(id);

  if (!usuario) {
    throw usuarioNoEncontrado();
  }

  return usuario;
};

const validarDatosEdicion = (datos) => {
  if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
    throw new AppError("El cuerpo de la petición no es válido.", 400, "INVALID_BODY");
  }

  const camposDesconocidos = Object.keys(datos).filter(
    (campo) => !CAMPOS_EDITABLES.includes(campo),
  );

  if (camposDesconocidos.length > 0) {
    throw new AppError(
      `Campos no permitidos: ${camposDesconocidos.join(", ")}.`,
      400,
      "INVALID_FIELDS",
    );
  }

  if (Object.keys(datos).length === 0) {
    throw new AppError("No se enviaron campos para actualizar.", 400, "EMPTY_BODY");
  }

  const limpios = {};

  if (datos.nombre !== undefined) {
    const nombre = typeof datos.nombre === "string" ? datos.nombre.trim() : "";

    if (!nombre || nombre.length > 150) {
      throw new AppError(
        "El nombre es obligatorio y debe tener máximo 150 caracteres.",
        400,
        "INVALID_NAME",
      );
    }

    limpios.nombre = nombre;
  }

  if (datos.correo !== undefined) {
    const correo = typeof datos.correo === "string" ? datos.correo.trim() : "";

    if (!CORREO_REGEX.test(correo) || correo.length > 150) {
      throw new AppError("El formato del correo no es válido.", 400, "INVALID_EMAIL_FORMAT");
    }

    limpios.correo = correo;
  }

  if (datos.ciudad !== undefined) {
    if (typeof datos.ciudad !== "string" || datos.ciudad.trim().length > 100) {
      throw new AppError(
        "La ciudad debe ser texto de máximo 100 caracteres.",
        400,
        "INVALID_CITY",
      );
    }

    limpios.ciudad = datos.ciudad.trim();
  }

  if (datos.estado !== undefined) {
    if (!ESTADOS_VALIDOS.includes(datos.estado)) {
      throw new AppError(
        `El estado debe ser uno de: ${ESTADOS_VALIDOS.join(", ")}.`,
        400,
        "INVALID_STATE",
      );
    }

    limpios.estado = datos.estado;
  }

  return limpios;
};

/**
 * Edición de un usuario por parte del administrador.
 *
 * Reglas:
 * - Solo se editan nombre, correo, ciudad y estado.
 * - El rol NO se puede cambiar: determina datos asociados (clases,
 *   inscripciones, menores, solicitudes de academia). Se acepta en el body
 *   únicamente si coincide con el rol actual, para no romper el formulario.
 * - Un admin no puede suspenderse ni dejarse en estado no activo a sí mismo.
 * - El passwordHash nunca se puede modificar por esta vía.
 */
const actualizarUsuario = async (id, datos, adminId) => {
  const cambios = validarDatosEdicion(datos);

  const usuario = await userRepository.findPublicById(id);

  if (!usuario) {
    throw usuarioNoEncontrado();
  }

  if (datos.rol !== undefined && datos.rol !== usuario.rol) {
    throw new AppError(
      "No se permite cambiar el rol de un usuario.",
      400,
      "ROLE_CHANGE_NOT_ALLOWED",
    );
  }

  if (id === adminId && cambios.estado && cambios.estado !== "activo") {
    throw new AppError(
      "No puedes cambiar el estado de tu propia cuenta.",
      409,
      "CANNOT_MODIFY_SELF",
    );
  }

  if (cambios.correo && cambios.correo !== usuario.correo) {
    const existente = await userRepository.findByEmail(cambios.correo);

    if (existente && existente.id !== id) {
      throw new AppError("El correo ya está registrado.", 409, "EMAIL_ALREADY_REGISTERED");
    }
  }

  try {
    return await userRepository.updatePublic(id, cambios);
  } catch (error) {
    // Carrera entre la verificación y el update: índice único de correo.
    if (error.code === "P2002") {
      throw new AppError("El correo ya está registrado.", 409, "EMAIL_ALREADY_REGISTERED");
    }

    if (error.code === "P2025") {
      throw usuarioNoEncontrado();
    }

    throw error;
  }
};

const suspenderUsuario = async (id, adminId) => {
  if (id === adminId) {
    throw new AppError(
      "No puedes suspender tu propia cuenta.",
      409,
      "CANNOT_MODIFY_SELF",
    );
  }

  try {
    return await userRepository.updateEstado(id, "suspendido");
  } catch (error) {
    if (error.code === "P2025") {
      throw usuarioNoEncontrado();
    }

    throw error;
  }
};

const eliminarUsuario = async (id, adminId) => {
  if (id === adminId) {
    throw new AppError(
      "No puedes eliminar tu propia cuenta.",
      409,
      "CANNOT_MODIFY_SELF",
    );
  }

  try {
    return await userRepository.deleteById(id);
  } catch (error) {
    if (error.code === "P2025") {
      throw usuarioNoEncontrado();
    }

    // Tiene clases, inscripciones, menores o solicitudes asociadas.
    if (error.code === "P2003") {
      throw new AppError(
        "No se puede eliminar el usuario porque tiene información asociada. Suspéndelo en su lugar.",
        409,
        "USER_HAS_RELATED_DATA",
      );
    }

    throw error;
  }
};

module.exports = {
  listarUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  suspenderUsuario,
  eliminarUsuario,
};
