/**
 * Seed de datos de prueba para lo que ya funciona en Danzas.app.
 *
 * Cubre: usuarios de los 4 roles, menores, solicitudes de academia
 * (pendiente/aprobada), clases con horario, y algunas inscripciones/pagos/
 * asistencia sembrados directo en la base (el endpoint de inscripción,
 * RF-012, todavía no está implementado — ver tarjetas de Sprint 3 en
 * Notion). Esto permite probar de una las pantallas de historial y
 * asistencia que ya están construidas en el frontend, sin depender de
 * ese endpoint.
 *
 * Uso: npx prisma db seed
 * (o: node prisma/seed.js)
 *
 * El script es idempotente: borra los datos de prueba anteriores antes
 * de crear los nuevos, respetando el orden de las llaves foráneas.
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

const PASSWORD_PRUEBA = "Prueba1234";

const hashPassword = async (password) => bcrypt.hash(password, 10);

async function limpiarDatosDePrueba() {
  // Orden inverso a las dependencias de llave foránea.
  await prisma.asistencia.deleteMany();
  await prisma.pago.deleteMany();
  await prisma.inscripcion.deleteMany();
  await prisma.horario.deleteMany();
  await prisma.clase.deleteMany();
  await prisma.solicitudAcademia.deleteMany();
  await prisma.menor.deleteMany();
  await prisma.usuario.deleteMany();
}

async function crearUsuarios() {
  const passwordHash = await hashPassword(PASSWORD_PRUEBA);

  const admin = await prisma.usuario.create({
    data: {
      nombre: "Admin Danzas",
      correo: "admin@danzas.app",
      passwordHash,
      rol: "admin",
      ciudad: "Bogotá",
      estado: "activo",
    },
  });

  const instructorAprobado = await prisma.usuario.create({
    data: {
      nombre: "Camila Rodríguez",
      correo: "instructor.aprobado@danzas.app",
      passwordHash,
      rol: "instructor",
      ciudad: "Barranquilla",
      estado: "activo",
    },
  });

  const instructorIndependiente = await prisma.usuario.create({
    data: {
      nombre: "Julián Torres",
      correo: "instructor.independiente@danzas.app",
      passwordHash,
      rol: "instructor",
      ciudad: "Medellín",
      estado: "activo",
    },
  });

  const instructorPendiente = await prisma.usuario.create({
    data: {
      nombre: "Valentina Gómez",
      correo: "instructor.pendiente@danzas.app",
      passwordHash,
      rol: "instructor",
      ciudad: "Cali",
      estado: "pendiente",
    },
  });

  const estudiante1 = await prisma.usuario.create({
    data: {
      nombre: "Andrea Pérez",
      correo: "estudiante1@danzas.app",
      passwordHash,
      rol: "estudiante",
      ciudad: "Bogotá",
      estado: "activo",
    },
  });

  const estudiante2 = await prisma.usuario.create({
    data: {
      nombre: "Santiago Mejía",
      correo: "estudiante2@danzas.app",
      passwordHash,
      rol: "estudiante",
      ciudad: "Cartagena",
      estado: "activo",
    },
  });

  const padre = await prisma.usuario.create({
    data: {
      nombre: "Laura Sánchez",
      correo: "padre@danzas.app",
      passwordHash,
      rol: "padre",
      ciudad: "Bogotá",
      estado: "activo",
    },
  });

  return {
    admin,
    instructorAprobado,
    instructorIndependiente,
    instructorPendiente,
    estudiante1,
    estudiante2,
    padre,
  };
}

async function crearMenores(padre) {
  const menor1 = await prisma.menor.create({
    data: {
      padreId: padre.id,
      nombre: "Mateo Sánchez",
      fechaNacimiento: new Date("2015-03-10"),
    },
  });

  const menor2 = await prisma.menor.create({
    data: {
      padreId: padre.id,
      nombre: "Isabella Sánchez",
      fechaNacimiento: new Date("2017-07-22"),
    },
  });

  return { menor1, menor2 };
}

async function crearSolicitudesAcademia({
  admin,
  instructorAprobado,
  instructorIndependiente,
  instructorPendiente,
}) {
  await prisma.solicitudAcademia.create({
    data: {
      instructorId: instructorAprobado.id,
      nombreAcademia: "Academia Ritmo Caribe",
      estado: "aprobada",
      revisadoPor: admin.id,
      revisadoEn: new Date(),
    },
  });

  await prisma.solicitudAcademia.create({
    data: {
      instructorId: instructorIndependiente.id,
      nombreAcademia: null,
      estado: "aprobada",
      revisadoPor: admin.id,
      revisadoEn: new Date(),
    },
  });

  await prisma.solicitudAcademia.create({
    data: {
      instructorId: instructorPendiente.id,
      nombreAcademia: "Academia Nuevos Pasos",
      estado: "pendiente",
    },
  });
}

// Prisma guarda los campos @db.Time(0) como DateTime; la fecha se ignora,
// solo importa la hora. Se usa una fecha fija arbitraria para todos.
const hora = (hh, mm) => new Date(Date.UTC(1970, 0, 1, hh, mm, 0));

async function crearClases({ instructorAprobado, instructorIndependiente }) {
  const claseSalsa = await prisma.clase.create({
    data: {
      instructorId: instructorAprobado.id,
      tipoBaile: "Salsa",
      ciudad: "Barranquilla",
      modalidad: "presencial",
      cupoMaximo: 15,
      cupoDisponible: 13,
      precio: 50000,
      estado: "activa",
      horarios: {
        create: [{ diaSemana: 1, horaInicio: hora(18, 0), horaFin: hora(19, 0) }],
      },
    },
  });

  const claseBachata = await prisma.clase.create({
    data: {
      instructorId: instructorAprobado.id,
      tipoBaile: "Bachata",
      ciudad: "Barranquilla",
      modalidad: "presencial",
      cupoMaximo: 12,
      cupoDisponible: 12,
      precio: 45000,
      estado: "activa",
      horarios: {
        // Empieza a las 19:15, 15 minutos después de que termina la clase
        // de salsa (18:00-19:00) — respeta el espacio mínimo de RF-008.
        create: [{ diaSemana: 3, horaInicio: hora(19, 15), horaFin: hora(20, 15) }],
      },
    },
  });

  const claseUrbana = await prisma.clase.create({
    data: {
      instructorId: instructorIndependiente.id,
      tipoBaile: "Danza urbana",
      ciudad: "Medellín",
      modalidad: "presencial",
      cupoMaximo: 20,
      cupoDisponible: 19,
      precio: 40000,
      estado: "activa",
      horarios: {
        create: [{ diaSemana: 2, horaInicio: hora(17, 0), horaFin: hora(18, 0) }],
      },
    },
  });

  return { claseSalsa, claseBachata, claseUrbana };
}

async function crearInscripcionesPagosYAsistencia({
  estudiante1,
  estudiante2,
  padre,
  menor1,
  claseSalsa,
  claseUrbana,
}) {
  // Estudiante 1: inscripción confirmada y pagada en Salsa, con asistencia registrada.
  const inscripcionConfirmada = await prisma.inscripcion.create({
    data: {
      claseId: claseSalsa.id,
      usuarioId: estudiante1.id,
      estado: "confirmada",
    },
  });

  await prisma.pago.create({
    data: {
      inscripcionId: inscripcionConfirmada.id,
      monto: claseSalsa.precio,
      estado: "aprobado",
      esSimulado: true,
      procesadoEn: new Date(),
    },
  });

  await prisma.asistencia.create({
    data: {
      inscripcionId: inscripcionConfirmada.id,
      fechaSesion: new Date(),
      asistio: true,
    },
  });

  // Estudiante 2: inscripción todavía pendiente de pago en Danza urbana.
  await prisma.inscripcion.create({
    data: {
      claseId: claseUrbana.id,
      usuarioId: estudiante2.id,
      estado: "pendiente_pago",
    },
  });

  // Padre inscribe a uno de sus menores, confirmada y pagada, en Salsa.
  const inscripcionMenor = await prisma.inscripcion.create({
    data: {
      claseId: claseSalsa.id,
      usuarioId: padre.id,
      menorId: menor1.id,
      estado: "confirmada",
    },
  });

  await prisma.pago.create({
    data: {
      inscripcionId: inscripcionMenor.id,
      monto: claseSalsa.precio,
      estado: "aprobado",
      esSimulado: true,
      procesadoEn: new Date(),
    },
  });
}

async function main() {
  console.log("Borrando datos de prueba anteriores...");
  await limpiarDatosDePrueba();

  console.log("Creando usuarios...");
  const usuarios = await crearUsuarios();

  console.log("Creando menores...");
  const menores = await crearMenores(usuarios.padre);

  console.log("Creando solicitudes de academia...");
  await crearSolicitudesAcademia(usuarios);

  console.log("Creando clases y horarios...");
  const clases = await crearClases(usuarios);

  console.log("Creando inscripciones, pagos y asistencia de ejemplo...");
  await crearInscripcionesPagosYAsistencia({
    ...usuarios,
    ...menores,
    ...clases,
  });

  console.log("\nListo. Usuarios de prueba (todos con la misma contraseña):");
  console.log(`  Contraseña para todos: ${PASSWORD_PRUEBA}\n`);
  console.log("  admin@danzas.app                  (admin)");
  console.log("  instructor.aprobado@danzas.app     (instructor, academia aprobada, 2 clases)");
  console.log("  instructor.independiente@danzas.app(instructor, independiente aprobado, 1 clase)");
  console.log("  instructor.pendiente@danzas.app    (instructor, solicitud pendiente)");
  console.log("  estudiante1@danzas.app             (estudiante, inscripción confirmada + asistencia)");
  console.log("  estudiante2@danzas.app             (estudiante, inscripción pendiente de pago)");
  console.log("  padre@danzas.app                   (padre, 2 menores, 1 inscripción confirmada)");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
