/**
 * Crea (o actualiza la contraseña de) la cuenta de administrador.
 *
 * El registro público solo permite estudiante/padre/instructor
 * (ROLES_REGISTRABLES en auth.service.js), así que no hay forma de obtener un
 * admin por la API. Este script lo hace directo en la base de datos usando el
 * mismo hash que el registro (bcrypt, costo 10).
 *
 * Variables de entorno:
 *   ADMIN_EMAIL     (obligatoria)  correo del admin
 *   ADMIN_PASSWORD  (obligatoria)  mínimo 10 caracteres; nunca se imprime
 *   ADMIN_NOMBRE    (opcional)     por defecto "Administrador"
 *   ADMIN_CIUDAD    (opcional)     por defecto "Sin definir"
 *   DATABASE_URL    (obligatoria)  base a la que se conecta (se lee de backend/.env si existe)
 *
 * Define ADMIN_EMAIL y ADMIN_PASSWORD como variables del shell solo para el
 * comando, no en un archivo .env (dotenv corta los valores sin comillas en "#").
 * Antes de escribir, el script imprime host:puerto y base de destino (sin
 * credenciales): verifícalos, porque si falta la variable del shell se usa backend/.env.
 *
 * Es idempotente: si el correo ya es de un admin, solo cambia su contraseña y
 * lo desbloquea. Si el correo pertenece a un usuario con OTRO rol, se niega
 * (no convierte cuentas existentes en admin).
 *
 * Uso (desde backend/), ver docs/despliegue.md para PowerShell y Git Bash:
 *   npm run create:admin -- --dry-run   # forma prevista (el "--" es obligatorio); solo informa, no escribe
 *   npm run create:admin                # crea o actualiza
 */

const { describirDestino, formatearDestino } = require("./lib/destino");

const PASSWORD_MIN_LENGTH = 10;
const NOMBRE_POR_DEFECTO = "Administrador";
const CIUDAD_POR_DEFECTO = "Sin definir";
// Mismo regex que el registro (auth.service.js).
const CORREO_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Mismo costo que el registro (auth.service.js).
const BCRYPT_COSTO = 10;

/**
 * Valida y normaliza los datos. Los mensajes de error nunca incluyen la contraseña.
 */
const validarDatosAdmin = ({ correo, password, nombre, ciudad } = {}) => {
  const correoLimpio = typeof correo === "string" ? correo.trim() : "";

  if (!CORREO_REGEX.test(correoLimpio)) {
    throw new Error("ADMIN_EMAIL falta o no tiene un formato de correo válido.");
  }

  if (typeof password !== "string" || password.trim() === "" || password.length < PASSWORD_MIN_LENGTH) {
    throw new Error(`ADMIN_PASSWORD falta o tiene menos de ${PASSWORD_MIN_LENGTH} caracteres.`);
  }

  const nombreLimpio = typeof nombre === "string" ? nombre.trim() : "";
  const ciudadLimpia = typeof ciudad === "string" ? ciudad.trim() : "";

  return {
    correo: correoLimpio,
    password,
    nombre: nombreLimpio || NOMBRE_POR_DEFECTO,
    ciudad: ciudadLimpia || CIUDAD_POR_DEFECTO,
  };
};

const hashPasswordDefault = (password) => require("bcrypt").hash(password, BCRYPT_COSTO);

/**
 * Crea o actualiza al admin. `prisma` y `hashPassword` se inyectan para poder
 * probar la lógica sin base de datos (ver tests/create-admin.test.js).
 */
const crearAdmin = async ({
  prisma,
  hashPassword = hashPasswordDefault,
  correo,
  password,
  nombre,
  ciudad,
  dryRun = false,
}) => {
  const existente = await prisma.usuario.findUnique({ where: { correo } });

  if (existente && existente.rol !== "admin") {
    throw new Error(
      `El correo ya pertenece a un usuario con rol "${existente.rol}". ` +
        "Usa otro correo: este script no convierte cuentas existentes en admin.",
    );
  }

  const accion = existente ? "actualizado" : "creado";

  if (dryRun) {
    return { accion, dryRun: true };
  }

  const passwordHash = await hashPassword(password);

  if (existente) {
    await prisma.usuario.update({
      where: { id: existente.id },
      data: { passwordHash, estado: "activo", intentosFallidos: 0, bloqueadoHasta: null },
    });
  } else {
    await prisma.usuario.create({
      data: { nombre, correo, passwordHash, rol: "admin", ciudad, estado: "activo" },
    });
  }

  return { accion, dryRun: false };
};

/**
 * `npm run create:admin -- --dry-run` es la forma prevista. Algunas versiones de
 * npm se "tragan" --dry-run y lo dejan en npm_config_dry_run: también se respeta.
 */
const esDryRun = (argv, env) => argv.includes("--dry-run") || env.npm_config_dry_run === "true";

const main = async () => {
  // dotenv y Prisma se cargan acá (y no arriba) para que importar este archivo
  // desde los tests no toque variables de entorno ni la base de datos.
  require("dotenv").config({ quiet: true });
  const prisma = require("../src/config/prisma");
  const dryRun = esDryRun(process.argv, process.env);

  try {
    const datos = validarDatosAdmin({
      correo: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      nombre: process.env.ADMIN_NOMBRE,
      ciudad: process.env.ADMIN_CIUDAD,
    });

    // Se muestra A QUÉ base se va a escribir (sin credenciales) antes de tocar nada:
    // si la variable del shell falta, dotenv cae a backend/.env (quizá la base local).
    const destino = describirDestino(process.env.DATABASE_URL);

    if (!destino) {
      throw new Error(
        "DATABASE_URL falta o no se pudo interpretar (esperado: mysql://usuario:contraseña@host:puerto/base).",
      );
    }

    console.log(`Base de destino: ${formatearDestino(destino)}`);

    const { accion } = await crearAdmin({ prisma, dryRun, ...datos });

    if (dryRun) {
      console.log(`[dry-run] Se habría ${accion === "creado" ? "creado" : "actualizado"} el admin ${datos.correo}. No se escribió nada.`);
    } else {
      console.log(`✅ Admin ${accion}: ${datos.correo}`);
    }
  } catch (error) {
    // Solo la última línea del mensaje: nunca el objeto completo (los errores de Prisma
    // traen un volcado de la consulta) para no arrastrar datos sensibles.
    const detalle = String(error.message).split("\n").map((linea) => linea.trim()).filter(Boolean).pop();
    console.error(`❌ ${error.code ? `${error.code} - ` : ""}${detalle}`);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
};

if (require.main === module) {
  main();
}

module.exports = { validarDatosAdmin, crearAdmin, esDryRun, PASSWORD_MIN_LENGTH };
