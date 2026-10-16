
const prisma = require("../src/config/prisma");

const main = async () => {
  const dryRun = process.argv.includes("--dry-run");

  try {
    // Buscar instructores que todavía no tengan ninguna solicitud.
    const instructores = await prisma.usuario.findMany({
      where: {
        rol: "instructor",
        solicitudesAcademia: {
          none: {},
        },
      },
      select: {
        id: true,
      },
    });

    const cantidad = instructores.length;

    if (dryRun) {
      console.log(
        `[DRY-RUN] Se crearían ${cantidad} solicitudes para instructores independientes.`
      );
      console.log("No se realizaron cambios en la base de datos.");
      return;
    }

    let creadas = 0;

    for (const instructor of instructores) {
      // createMany + skipDuplicates no es necesario aquí:
      // se comprueba nuevamente que el instructor siga sin solicitudes.
      const resultado = await prisma.solicitudAcademia.createMany({
        data: [
          {
            instructorId: instructor.id,
            estado: "pendiente",
            nombreAcademia: null,
          },
        ],
        skipDuplicates: true,
      });

      creadas += resultado.count;
    }

    console.log(`Solicitudes creadas: ${creadas}`);
  } catch (error) {
    console.error("Error ejecutando el backfill de solicitudes:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
};

main();
