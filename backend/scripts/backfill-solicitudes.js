/**
 * RF-006: desde que el registro de un instructor crea su solicitud de academia
 * pendiente, los instructores registrados ANTES de ese cambio quedaron sin
 * solicitud y no pueden publicar clases. Este script la crea (pendiente, como
 * instructor independiente) para que el administrador la apruebe desde su panel.
 *
 * Es idempotente: solo toca a los instructores que no tienen ninguna solicitud,
 * así que correrlo dos veces seguidas no duplica nada.
 *
 * Uso (desde backend/):
 *   node scripts/backfill-solicitudes.js --dry-run   # solo informa, no escribe
 *   node scripts/backfill-solicitudes.js             # crea las solicitudes
 */
const prismaDefault = require("../src/config/prisma");

const backfillSolicitudes = async ({ prisma = prismaDefault, dryRun = false } = {}) => {
  const instructores = await prisma.usuario.findMany({
    where: { rol: "instructor", solicitudes: { none: {} } },
    select: { id: true },
  });

  if (dryRun) {
    return { encontrados: instructores.length, creadas: 0, dryRun: true };
  }

  let creadas = 0;

  for (const instructor of instructores) {
    await prisma.solicitudAcademia.create({
      data: { instructorId: instructor.id, nombreAcademia: null, estado: "pendiente" },
    });
    creadas += 1;
  }

  return { encontrados: instructores.length, creadas, dryRun: false };
};

const main = async () => {
  const dryRun = process.argv.includes("--dry-run");

  try {
    const { encontrados, creadas } = await backfillSolicitudes({ dryRun });

    if (dryRun) {
      console.log(`[dry-run] Se crearían ${encontrados} solicitudes pendientes. No se escribió nada.`);
    } else {
      console.log(`Instructores sin solicitud: ${encontrados}. Solicitudes creadas: ${creadas}.`);
    }
  } catch (error) {
    console.error("Error en el backfill de solicitudes:", error);
    process.exitCode = 1;
  } finally {
    await prismaDefault.$disconnect();
  }
};

if (require.main === module) {
  main();
}

module.exports = { backfillSolicitudes };
