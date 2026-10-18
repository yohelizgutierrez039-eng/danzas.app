/**
 * Prueba la conexión a la base de datos con el MISMO cliente (Prisma) y la
 * MISMA variable (DATABASE_URL) que usa la API. Sirve para validar la URL de
 * Aiven (TLS, connection_limit, etc.) desde tu computadora antes de desplegar.
 *
 * Qué hace:
 *   1. Muestra host, puerto y base (NUNCA usuario, contraseña ni la URL completa).
 *   2. Ejecuta SELECT 1.
 *   3. Consulta SHOW STATUS LIKE 'Ssl_cipher' para saber si la conexión va cifrada.
 *   4. Sale con código 0 si todo salió bien y 1 si algo falló (con pistas).
 *
 * Uso (desde backend/), ver docs/despliegue.md para PowerShell y Git Bash:
 *   npm run db:check
 */

const TIMEOUT_MS = 30000;

/**
 * Extrae host/puerto/base de DATABASE_URL sin exponer credenciales.
 * Devuelve null si no se puede interpretar (y no incluye la URL en ningún error).
 */
const describirDestino = (databaseUrl) => {
  try {
    const url = new URL(databaseUrl);

    return {
      host: url.hostname,
      puerto: url.port || "3306",
      base: decodeURIComponent(url.pathname.replace(/^\//, "")),
    };
  } catch {
    return null;
  }
};

/**
 * Interpreta la respuesta de SHOW STATUS LIKE 'Ssl_cipher'.
 * Un cifrado no vacío significa que la conexión actual usa TLS.
 */
const interpretarSsl = (filas) => {
  const cifrado = String((filas && filas[0] && filas[0].Value) || "");

  return { cifrada: cifrado !== "", cifrado };
};

/**
 * Pistas para los fallos más comunes. `error` es lo que lanza Prisma
 * (códigos P10xx documentados en la referencia de errores de Prisma).
 */
const pistasParaError = (error) => {
  const codigo = (error && error.code) || "";
  const mensaje = String((error && error.message) || "");
  const pistas = [];

  if (codigo === "P1001" || /can't reach database server|ECONNREFUSED|ENOTFOUND/i.test(mensaje)) {
    pistas.push(
      "No se llegó al servidor: revisa host y puerto de la URL y que el servicio de Aiven esté ENCENDIDO " +
        "(si estuvo inactivo puede haberse apagado: enciéndelo desde la consola de Aiven).",
    );
  }

  if (codigo === "P1002" || /timed out|timeout|ETIMEDOUT/i.test(mensaje)) {
    pistas.push(
      "Timeout: prueba de nuevo (un servicio recién encendido tarda); si persiste, agrega &connect_timeout=30 a la URL " +
        "y revisa que tu red no bloquee el puerto de salida.",
    );
  }

  if (codigo === "P1000" || /access denied|authentication/i.test(mensaje)) {
    pistas.push(
      "Credenciales rechazadas: revisa usuario y contraseña copiados de la consola de Aiven. " +
        "Si la contraseña tiene caracteres especiales (@, :, /, #, ?) hay que codificarlos en la URL (por ejemplo @ = %40).",
    );
  }

  if (codigo === "P1003") {
    pistas.push("La base de datos del final de la URL no existe: en Aiven suele ser defaultdb.");
  }

  if (codigo === "P1011" || /tls|ssl|certificate|self.signed|handshake/i.test(mensaje)) {
    pistas.push(
      "Problema de TLS. Prueba en este orden: (1) la Service URI tal cual se copió; " +
        "(2) si Prisma rechaza un parámetro ssl-mode desconocido, quítalo y agrega ?sslaccept=accept_invalid_certs; " +
        "(3) para validar el certificado: ?sslaccept=strict&sslcert=<ruta-al-CA>. Detalle en docs/despliegue.md.",
    );
  }

  if (pistas.length === 0) {
    pistas.push(
      "Revisa que DATABASE_URL esté definida y bien escrita (mysql://usuario:contraseña@host:puerto/base) " +
        "y consulta la sección de problemas frecuentes de docs/despliegue.md.",
    );
  }

  return pistas;
};

/**
 * Corre las dos consultas. `prisma` se inyecta para poder probarlo sin base de datos.
 * Lanza el error original si algo falla (el CLI lo traduce a pistas).
 */
const verificarConexion = async (prisma) => {
  // SELECT 1 devuelve BigInt en Prisma/MySQL; acá solo importa que no falle.
  await prisma.$queryRaw`SELECT 1 AS resultado`;
  const filas = await prisma.$queryRaw`SHOW STATUS LIKE 'Ssl_cipher'`;

  return { ok: true, ssl: interpretarSsl(filas) };
};

const conTimeout = (promesa) =>
  Promise.race([
    promesa,
    new Promise((_, rechazar) => {
      setTimeout(() => rechazar(new Error(`Timeout: no hubo respuesta en ${TIMEOUT_MS / 1000} s.`)), TIMEOUT_MS).unref();
    }),
  ]);

const main = async () => {
  // dotenv y Prisma se cargan acá (y no arriba) para que importar este archivo
  // desde los tests no toque variables de entorno ni la base de datos.
  require("dotenv").config({ quiet: true });

  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL no está definida (ni en el entorno ni en backend/.env).");
    process.exitCode = 1;
    return;
  }

  const destino = describirDestino(process.env.DATABASE_URL);

  if (!destino) {
    console.error("❌ DATABASE_URL no tiene un formato válido (esperado: mysql://usuario:contraseña@host:puerto/base).");
    console.error("   Si la contraseña tiene caracteres especiales (@, :, /, #, ?), codifícalos (por ejemplo @ = %40).");
    process.exitCode = 1;
    return;
  }

  console.log(`Probando conexión a ${destino.host}:${destino.puerto} (base: ${destino.base || "sin nombre"})...`);

  const prisma = require("../src/config/prisma");

  try {
    const { ssl } = await conTimeout(verificarConexion(prisma));

    console.log("✅ Conexión correcta: SELECT 1 respondió.");

    if (ssl.cifrada) {
      console.log(`✅ La conexión va cifrada (TLS): ${ssl.cifrado}`);
    } else {
      console.log("⚠️  La conexión NO va cifrada. Para Aiven esto no es lo esperado: revisa la sección de TLS de docs/despliegue.md.");
    }
  } catch (error) {
    console.error("❌ No se pudo conectar.");
    // Solo código y mensaje de Prisma: nunca la URL ni variables de entorno.
    console.error(`   Detalle: ${error.code ? `${error.code} - ` : ""}${String(error.message).split("\n").filter(Boolean).pop()}`);
    console.error("   Posibles causas:");
    pistasParaError(error).forEach((pista) => console.error(`   - ${pista}`));
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
};

if (require.main === module) {
  main();
}

module.exports = { describirDestino, interpretarSsl, pistasParaError, verificarConexion };
