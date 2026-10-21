import { createRequire } from "node:module";
import { describe, expect, it, vi } from "vitest";

// seed-demo.js es CommonJS y solo corre como CLI cuando es el modulo principal:
// importarlo aqui no toca la base de datos (Prisma y dotenv se cargan lazy).
const require = createRequire(import.meta.url);
const {
  buildDemoData,
  contarPlan,
  run,
  iniciar,
  leerOpciones,
  describirError,
  seSuperponen,
  PASSWORD_DEMO,
  DOMINIO_DEMO,
  HORARIOS_BASE,
  MOTIVO_ESTUDIANTE,
  MOTIVO_INSTRUCTOR,
  ENTIDADES,
} = require("../prisma/seed-demo");

const MS_DIA = 24 * 60 * 60 * 1000;

// Un instante por cada dia de la semana (hora de Colombia: 10:00 = 15:00 UTC).
const AHORAS = [
  "2026-10-18T15:00:00Z", // domingo
  "2026-10-19T15:00:00Z", // lunes
  "2026-10-20T15:00:00Z", // martes
  "2026-10-21T15:00:00Z", // miercoles (hoy del repo)
  "2026-10-22T15:00:00Z", // jueves (dia de la presentacion)
  "2026-10-23T15:00:00Z", // viernes
  "2026-10-24T15:00:00Z", // sabado
].map((texto) => new Date(texto));

const AHORA = new Date("2026-10-22T15:00:00Z");

// ---------------------------------------------------------------------------
// Prisma falso en memoria: solo implementa las formas de consulta que usa el script.
// ---------------------------------------------------------------------------
const crearPrismaFalso = ({ semilla = {} } = {}) => {
  const tablas = {
    usuario: [],
    menor: [],
    solicitudAcademia: [],
    clase: [],
    horario: [],
    inscripcion: [],
    pago: [],
    asistencia: [],
  };
  const escrituras = [];
  let secuencia = 0;

  const nuevoId = (prefijo) => `${prefijo}-${(secuencia += 1)}`;

  const coincide = (fila, where = {}) =>
    Object.entries(where).every(([campo, valor]) => (valor === null ? fila[campo] == null : fila[campo] === valor));

  const conHorarios = (fila) => ({
    ...fila,
    horarios: tablas.horario.filter((horario) => horario.claseId === fila.id).map((horario) => ({ ...horario })),
  });

  const modelo = (nombre, prefijo, { alCrear } = {}) => ({
    findUnique: async ({ where }) => {
      const fila = tablas[nombre].find((candidata) => coincide(candidata, where));
      return fila ? { ...fila } : null;
    },
    findFirst: async ({ where }) => {
      const fila = tablas[nombre].find((candidata) => coincide(candidata, where));
      return fila ? { ...fila } : null;
    },
    findMany: async ({ where, include } = {}) =>
      tablas[nombre]
        .filter((candidata) => coincide(candidata, where))
        .map((fila) => (include?.horarios ? conHorarios(fila) : { ...fila })),
    create: async ({ data }) => {
      escrituras.push(`${nombre}.create`);
      const { horarios, ...resto } = data;
      const fila = { id: nuevoId(prefijo), ...resto };

      if (nombre === "pago" && tablas.pago.some((pago) => pago.inscripcionId === fila.inscripcionId)) {
        throw Object.assign(new Error("Unique constraint failed on inscripcionId"), { code: "P2002" });
      }

      tablas[nombre].push(fila);
      alCrear?.(fila, { horarios });

      return { ...fila };
    },
    createMany: async ({ data }) => {
      escrituras.push(`${nombre}.createMany`);
      data.forEach((fila) => tablas[nombre].push({ id: nuevoId(prefijo), ...fila }));

      return { count: data.length };
    },
    update: async ({ where, data }) => {
      escrituras.push(`${nombre}.update`);
      const fila = tablas[nombre].find((candidata) => coincide(candidata, where));

      for (const [campo, valor] of Object.entries(data)) {
        fila[campo] = valor && typeof valor === "object" && "decrement" in valor ? fila[campo] - valor.decrement : valor;
      }

      return { ...fila };
    },
  });

  const prisma = {
    usuario: modelo("usuario", "u"),
    menor: modelo("menor", "m"),
    solicitudAcademia: modelo("solicitudAcademia", "s"),
    clase: modelo("clase", "c", {
      alCrear: (fila, { horarios }) =>
        (horarios?.create ?? []).forEach((horario) => tablas.horario.push({ id: nuevoId("h"), claseId: fila.id, ...horario })),
    }),
    inscripcion: modelo("inscripcion", "i"),
    pago: modelo("pago", "p"),
    asistencia: modelo("asistencia", "a"),
    $transaction: async (accion) => accion(prisma),
    $disconnect: vi.fn(async () => undefined),
  };

  // Semilla opcional (usuarios que ya existian en la base, por ejemplo).
  Object.entries(semilla).forEach(([nombre, filas]) => filas.forEach((fila) => tablas[nombre].push({ ...fila })));

  return { prisma, tablas, escrituras };
};

const hashFalso = async () => "hash-falso";

const crearCapturaDeSalida = () => {
  const lineas = [];

  return { lineas, log: (texto) => lineas.push(String(texto)), logError: (texto) => lineas.push(String(texto)) };
};

const totalCreado = (contadores) =>
  ENTIDADES.reduce((total, entidad) => total + contadores[entidad].creados, 0);

// ---------------------------------------------------------------------------
// buildDemoData (pura)
// ---------------------------------------------------------------------------
describe("buildDemoData: forma de la historia", () => {
  const datos = buildDemoData(AHORA);

  it("los correos nuevos son del dominio demo y no chocan con los del seed base", () => {
    const base = datos.usuarios.filter((usuario) => usuario.base);
    const nuevos = datos.usuarios.filter((usuario) => !usuario.base);

    expect(base.map((usuario) => usuario.correo).sort()).toEqual([
      "admin@danzas.app",
      "estudiante1@danzas.app",
      "instructor.aprobado@danzas.app",
      "instructor.independiente@danzas.app",
      "padre@danzas.app",
    ]);
    expect(nuevos.every((usuario) => usuario.correo.endsWith(`@${DOMINIO_DEMO}`))).toBe(true);
    expect(new Set(datos.usuarios.map((usuario) => usuario.correo)).size).toBe(datos.usuarios.length);
  });

  it("cubre los roles y estados de la presentacion", () => {
    const nuevos = datos.usuarios.filter((usuario) => !usuario.base);
    const aprobadas = datos.solicitudes.filter((solicitud) => solicitud.estado === "aprobada" && !solicitud.base);

    expect(aprobadas).toHaveLength(4); // 4 instructores nuevos aprobados
    expect(aprobadas.filter((solicitud) => solicitud.nombreAcademia).length).toBe(2); // 2 con academia
    expect(aprobadas.filter((solicitud) => !solicitud.nombreAcademia).length).toBe(2); // 2 independientes
    expect(datos.solicitudes.filter((solicitud) => solicitud.estado === "pendiente")).toHaveLength(2);
    expect(datos.solicitudes.filter((solicitud) => solicitud.estado === "rechazada")).toHaveLength(1);
    expect(nuevos.filter((usuario) => usuario.estado === "suspendido")).toHaveLength(1);
    expect(nuevos.filter((usuario) => usuario.rol === "estudiante" && usuario.estado === "activo").length).toBeGreaterThanOrEqual(6);
    expect(nuevos.filter((usuario) => usuario.rol === "padre")).toHaveLength(2);
  });

  it("las solicitudes aprobadas y rechazadas traen fecha de revision y las pendientes no", () => {
    for (const solicitud of datos.solicitudes) {
      expect(Boolean(solicitud.revisadoEn)).toBe(solicitud.estado !== "pendiente");
      expect(solicitud.revisada).toBe(solicitud.estado !== "pendiente");
    }
  });

  it("solo los instructores con solicitud aprobada tienen clases activas", () => {
    const aprobados = new Set(datos.solicitudes.filter((s) => s.estado === "aprobada").map((s) => s.instructor));

    for (const clase of datos.clases.filter((c) => c.estado === "activa")) {
      expect(aprobados.has(clase.instructor)).toBe(true);
    }
  });

  it("las clases son presenciales, con tipos y ciudades del explorador y precios entre 30.000 y 65.000", () => {
    const tipos = ["Salsa", "Bachata", "Danza urbana", "Contemporánea", "Folclor"];
    const ciudades = ["Barranquilla", "Bogotá", "Cali", "Cartagena", "Medellín", "Santa Marta"];

    for (const clase of datos.clases) {
      expect(clase.modalidad).toBe("presencial");
      expect(tipos).toContain(clase.tipoBaile);
      expect(ciudades).toContain(clase.ciudad);
      expect(clase.precio).toBeGreaterThanOrEqual(30000);
      expect(clase.precio).toBeLessThanOrEqual(65000);
      expect(clase.horario.horaInicio.toISOString()).toMatch(/^1970-01-01T\d{2}:\d{2}:00\.000Z$/);
      expect(clase.horario.diaSemana).toBeGreaterThanOrEqual(0);
      expect(clase.horario.diaSemana).toBeLessThanOrEqual(6);
    }
  });

  it("tiene una clase llena, una con un solo cupo, una cancelada y varias con cupos libres sin inscritos", () => {
    const activas = datos.clases.filter((clase) => clase.estado === "activa");

    expect(activas.filter((clase) => clase.cupoDisponible === 0)).toHaveLength(1);
    expect(activas.filter((clase) => clase.cupoDisponible === 1)).toHaveLength(1);
    expect(datos.clases.filter((clase) => clase.estado === "cancelada")).toHaveLength(1);

    const sinInscripciones = activas.filter(
      (clase) => !datos.inscripciones.some((inscripcion) => inscripcion.clase === clase.key),
    );

    expect(sinInscripciones.length).toBeGreaterThanOrEqual(2);
    expect(activas.length).toBeGreaterThanOrEqual(10);
  });

  it("tiene volumen suficiente de inscripciones y 3 o 4 pendientes de pago", () => {
    expect(datos.inscripciones.length).toBeGreaterThanOrEqual(25);
    expect(datos.inscripciones.length).toBeLessThanOrEqual(35);
    expect(datos.inscripciones.filter((inscripcion) => inscripcion.estado === "pendiente_pago")).toHaveLength(3);
  });

  it("las fechas de nacimiento de los menores son validas: no futuras y de hasta 21 anios", () => {
    for (const menor of datos.menores) {
      expect(menor.fechaNacimiento).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(menor.fechaNacimiento <= datos.hoy).toBe(true);
      expect(Number(datos.hoy.slice(0, 4)) - Number(menor.fechaNacimiento.slice(0, 4))).toBeLessThanOrEqual(21);
    }
  });

  it("los padres tienen entre 1 y 3 hijos y las inscripciones de menores usan al padre como usuario", () => {
    const padres = datos.usuarios.filter((usuario) => usuario.rol === "padre" && !usuario.base);

    for (const padre of padres) {
      const hijos = datos.menores.filter((menor) => menor.padre === padre.key);
      expect(hijos.length).toBeGreaterThanOrEqual(1);
      expect(hijos.length).toBeLessThanOrEqual(3);
    }

    for (const inscripcion of datos.inscripciones.filter((i) => i.menor)) {
      const menor = datos.menores.find((m) => m.key === inscripcion.menor);
      expect(menor.padre).toBe(inscripcion.usuario);
    }

    for (const inscripcion of datos.inscripciones.filter((i) => !i.menor)) {
      const usuario = datos.usuarios.find((u) => u.key === inscripcion.usuario);
      expect(usuario.rol).toBe("estudiante");
      expect(usuario.estado).toBe("activo");
    }
  });
});

describe.each(AHORAS.map((ahora) => [ahora.toISOString(), ahora]))("buildDemoData: invariantes con now = %s", (_texto, ahora) => {
  const datos = buildDemoData(ahora);
  const clasePorKey = new Map(datos.clases.map((clase) => [clase.key, clase]));

  it("cupoDisponible es consistente con las inscripciones de cada clase", () => {
    for (const clase of datos.clases) {
      const delaClase = datos.inscripciones.filter((inscripcion) => inscripcion.clase === clase.key);
      // Cancela el estudiante: libera el cupo. Cancela el instructor: el codigo no lo libera.
      const ocupados = delaClase.filter((i) => !(i.estado === "cancelada" && i.canceladoPor === "estudiante")).length;

      expect(clase.cupoDisponible).toBe(clase.cupoMaximo - ocupados);
      expect(clase.cupoDisponible).toBeGreaterThanOrEqual(0);

      if (clase.estado === "activa") {
        const sostienenCupo = delaClase.filter((i) => i.estado === "confirmada" || i.estado === "pendiente_pago").length;
        expect(clase.cupoDisponible).toBe(clase.cupoMaximo - sostienenCupo);
      }
    }
  });

  it("no hay cruces ni menos de 15 minutos entre las clases activas de un instructor (incluidas las del seed base)", () => {
    const horarios = [
      ...HORARIOS_BASE.map((base) => ({
        instructor: base.instructor,
        diaSemana: base.diaSemana,
        horaInicio: new Date(Date.UTC(1970, 0, 1, base.inicio[0], base.inicio[1])),
        horaFin: new Date(Date.UTC(1970, 0, 1, base.fin[0], base.fin[1])),
      })),
      ...datos.clases
        .filter((clase) => clase.estado === "activa")
        .map((clase) => ({ instructor: clase.instructor, ...clase.horario })),
    ];

    horarios.forEach((a, i) => {
      expect(a.horaFin.getTime()).toBeGreaterThan(a.horaInicio.getTime());

      horarios.slice(i + 1).forEach((b) => {
        if (a.instructor === b.instructor) {
          expect(seSuperponen(a, b)).toBe(false);
        }
      });
    });
  });

  it("hay un pago por inscripcion, simulado, aprobado y con referencia SIM-XXXXXXXXXX unica", () => {
    const referencias = [];

    for (const inscripcion of datos.inscripciones) {
      if (inscripcion.estado === "pendiente_pago") {
        expect(inscripcion.pago).toBeNull();
        continue;
      }

      expect(inscripcion.pago).not.toBeNull();
      expect(inscripcion.pago.estado).toBe("aprobado");
      expect(inscripcion.pago.esSimulado).toBe(true);
      expect(inscripcion.pago.monto).toBe(clasePorKey.get(inscripcion.clase).precio);
      expect(inscripcion.pago.referenciaPasarela).toMatch(/^SIM-[0-9A-F]{10}$/);
      expect(inscripcion.pago.procesadoEn).toBeInstanceOf(Date);
      referencias.push(inscripcion.pago.referenciaPasarela);
    }

    expect(new Set(referencias).size).toBe(referencias.length);
  });

  it("los reembolsos estan marcados con su motivo y solo en inscripciones canceladas", () => {
    const reembolsados = datos.inscripciones.filter((inscripcion) => inscripcion.pago?.reembolsado);
    const motivos = new Set(reembolsados.map((inscripcion) => inscripcion.pago.motivoReembolso));

    expect(motivos).toEqual(new Set([MOTIVO_ESTUDIANTE, MOTIVO_INSTRUCTOR]));

    for (const inscripcion of reembolsados) {
      expect(inscripcion.estado).toBe("cancelada");
      expect(inscripcion.pago.estado).toBe("aprobado");
      // Quien cancela determina el motivo.
      expect(inscripcion.pago.motivoReembolso).toBe(
        inscripcion.canceladoPor === "instructor" ? MOTIVO_INSTRUCTOR : MOTIVO_ESTUDIANTE,
      );
    }

    for (const inscripcion of datos.inscripciones.filter((i) => i.pago && !i.pago.reembolsado)) {
      expect(inscripcion.pago.motivoReembolso).toBeNull();
    }

    // Una cancelacion tardia (sin reembolso) deja el pago aprobado y sin reembolsar.
    const tardia = datos.inscripciones.filter(
      (i) => i.estado === "cancelada" && i.canceladoPor === "estudiante" && !i.pago.reembolsado,
    );
    expect(tardia.length).toBeGreaterThanOrEqual(1);
  });

  it("la clase cancelada por su instructor tiene todas sus inscripciones canceladas y reembolsadas", () => {
    const cancelada = datos.clases.find((clase) => clase.estado === "cancelada");
    const inscripciones = datos.inscripciones.filter((inscripcion) => inscripcion.clase === cancelada.key);

    expect(inscripciones.length).toBeGreaterThanOrEqual(2);

    for (const inscripcion of inscripciones) {
      expect(inscripcion.estado).toBe("cancelada");
      expect(inscripcion.canceladoPor).toBe("instructor");
      expect(inscripcion.pago.reembolsado).toBe(true);
      expect(inscripcion.pago.motivoReembolso).toBe(MOTIVO_INSTRUCTOR);
    }

    // Y ninguna clase activa tiene inscripciones canceladas por el instructor.
    for (const inscripcion of datos.inscripciones.filter((i) => i.canceladoPor === "instructor")) {
      expect(clasePorKey.get(inscripcion.clase).estado).toBe("cancelada");
    }
  });

  it("los pagos se reparten en las ultimas semanas, ninguno en el futuro y los reembolsos caen en su fecha de reembolso", () => {
    const pagos = datos.inscripciones.filter((inscripcion) => inscripcion.pago);
    const semanas = new Set();

    for (const inscripcion of pagos) {
      const instante = inscripcion.pago.procesadoEn.getTime();
      const dias = (ahora.getTime() - instante) / MS_DIA;

      expect(instante).toBeLessThanOrEqual(ahora.getTime());
      expect(dias).toBeLessThanOrEqual(37);
      expect(inscripcion.creadoEn.getTime()).toBeLessThanOrEqual(ahora.getTime());

      // Un pago nunca es anterior a su inscripcion.
      expect(instante).toBeGreaterThanOrEqual(inscripcion.creadoEn.getTime());
      semanas.add(Math.floor(dias / 7));
    }

    expect(semanas.size).toBeGreaterThanOrEqual(5);
  });

  it("la asistencia cae en el dia de la semana de la clase, antes de hoy y solo en inscripciones confirmadas", () => {
    let total = 0;

    for (const inscripcion of datos.inscripciones) {
      if (inscripcion.asistencias.length === 0) {
        continue;
      }

      const clase = clasePorKey.get(inscripcion.clase);
      const dia = new Date(inscripcion.creadoEn.getTime() - 5 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const fechas = new Set();

      expect(inscripcion.estado).toBe("confirmada");

      for (const asistencia of inscripcion.asistencias) {
        total += 1;
        expect(asistencia.fechaSesion.getUTCDay()).toBe(clase.horario.diaSemana);
        // @db.Date: medianoche UTC.
        expect(asistencia.fechaSesion.getUTCHours()).toBe(0);
        expect(asistencia.fechaSesion.toISOString().slice(0, 10) < datos.hoy).toBe(true);
        expect(asistencia.fechaSesion.toISOString().slice(0, 10) > dia).toBe(true);
        expect(typeof asistencia.asistio).toBe("boolean");
        fechas.add(asistencia.fechaSesion.toISOString());
      }

      // Nunca dos filas para la misma sesion.
      expect(fechas.size).toBe(inscripcion.asistencias.length);
    }

    expect(total).toBeGreaterThan(40);
  });

  it("la sesion de hoy queda sin asistencia y hay al menos dos clases con historial para tomarla en vivo", () => {
    const conHistorial = new Set();

    for (const inscripcion of datos.inscripciones) {
      for (const asistencia of inscripcion.asistencias) {
        expect(asistencia.fechaSesion.toISOString().slice(0, 10)).not.toBe(datos.hoy);
        conHistorial.add(inscripcion.clase);
      }
    }

    // Camila (Folclor) y Daniela (Bachata) dan clase los jueves, dia de la presentacion.
    expect(conHistorial.has("c3")).toBe(true);
    expect(conHistorial.has("d2")).toBe(true);
    expect(clasePorKey.get("c3").horario.diaSemana).toBe(4);
    expect(clasePorKey.get("d2").horario.diaSemana).toBe(4);
  });

  it("hay hijos con asistencia entre 66% y 90% y uno con tasa baja", () => {
    const porcentajePorHijo = new Map(); // "menor:clase" -> %

    for (const inscripcion of datos.inscripciones.filter((i) => i.menor && i.asistencias.length > 0)) {
      const presentes = inscripcion.asistencias.filter((a) => a.asistio).length;
      porcentajePorHijo.set(`${inscripcion.menor}:${inscripcion.clase}`, (presentes / inscripcion.asistencias.length) * 100);
    }

    const valores = [...porcentajePorHijo.values()];

    expect(valores.some((porcentaje) => porcentaje >= 66 && porcentaje <= 90)).toBe(true);
    expect(valores.some((porcentaje) => porcentaje < 50)).toBe(true);
  });

  it("no hay dos inscripciones con la misma clave natural (usuario, menor, clase)", () => {
    const claves = datos.inscripciones.map((i) => `${i.usuario}|${i.menor}|${i.clase}`);

    expect(new Set(claves).size).toBe(claves.length);
  });
});

describe("buildDemoData: fechas relativas", () => {
  it("mueve las fechas con 'now' y usa el dia de calendario de Colombia (UTC-5)", () => {
    // 02:00 UTC del 23 todavia es el 22 en Colombia.
    expect(buildDemoData(new Date("2026-10-23T02:00:00Z")).hoy).toBe("2026-10-22");
    expect(buildDemoData(new Date("2026-10-23T05:00:00Z")).hoy).toBe("2026-10-23");

    const antes = buildDemoData(AHORA);
    const despues = buildDemoData(new Date(AHORA.getTime() + 7 * MS_DIA));

    expect(despues.inscripciones[0].creadoEn.getTime() - antes.inscripciones[0].creadoEn.getTime()).toBe(7 * MS_DIA);
  });

  it("contarPlan coincide con el contenido", () => {
    const datos = buildDemoData(AHORA);
    const plan = contarPlan(datos);

    expect(plan.usuarios).toBe(datos.usuarios.length);
    expect(plan.clases).toBe(plan.horarios);
    expect(plan.pagos).toBe(datos.inscripciones.filter((i) => i.estado !== "pendiente_pago").length);
    expect(plan.asistencias).toBeGreaterThan(40);
  });
});

// ---------------------------------------------------------------------------
// run (con Prisma falso)
// ---------------------------------------------------------------------------
describe("run: aditivo e idempotente", () => {
  it("la primera corrida crea todo el plan", async () => {
    const { prisma } = crearPrismaFalso();
    const plan = contarPlan(buildDemoData(AHORA));

    const resultado = await run({ prisma, now: AHORA, hashPassword: hashFalso });

    for (const entidad of ENTIDADES) {
      expect(resultado.contadores[entidad]).toEqual({ creados: plan[entidad], existentes: 0, omitidos: 0 });
    }

    expect(resultado.credenciales).toHaveLength(plan.usuarios);
  });

  it("la segunda corrida no crea nada ni escribe en la base", async () => {
    const { prisma, escrituras } = crearPrismaFalso();

    await run({ prisma, now: AHORA, hashPassword: hashFalso });

    const escriturasPrimera = escrituras.length;
    const segunda = await run({ prisma, now: AHORA, hashPassword: hashFalso });

    expect(totalCreado(segunda.contadores)).toBe(0);
    expect(escrituras.length).toBe(escriturasPrimera);

    const plan = contarPlan(buildDemoData(AHORA));

    for (const entidad of ENTIDADES) {
      expect(segunda.contadores[entidad].existentes).toBe(plan[entidad]);
    }
  });

  it("deja la base consistente: cupos, un pago por inscripcion, asistencia en el dia de la clase", async () => {
    const { prisma, tablas } = crearPrismaFalso();

    await run({ prisma, now: AHORA, hashPassword: hashFalso });

    for (const clase of tablas.clase) {
      const inscripciones = tablas.inscripcion.filter((i) => i.claseId === clase.id);
      const ocupados = inscripciones.filter((i) => !(i.estado === "cancelada" && i.canceladoPor === "estudiante")).length;

      expect(clase.cupoDisponible).toBe(clase.cupoMaximo - ocupados);
    }

    const idsConPago = tablas.pago.map((pago) => pago.inscripcionId);

    expect(new Set(idsConPago).size).toBe(idsConPago.length);

    for (const asistencia of tablas.asistencia) {
      const inscripcion = tablas.inscripcion.find((i) => i.id === asistencia.inscripcionId);
      const horario = tablas.horario.find((h) => h.claseId === inscripcion.claseId);

      expect(asistencia.fechaSesion.getUTCDay()).toBe(horario.diaSemana);
    }

    // Una inscripcion de menor tiene como usuario al padre.
    for (const inscripcion of tablas.inscripcion.filter((i) => i.menorId)) {
      const menor = tablas.menor.find((m) => m.id === inscripcion.menorId);

      expect(menor.padreId).toBe(inscripcion.usuarioId);
    }
  });

  it("todos los usuarios nuevos quedan con la misma contrasena de la demo (hash inyectado) y sin duplicar correos", async () => {
    const hash = vi.fn(async () => "hash-de-prueba");
    const { prisma, tablas } = crearPrismaFalso();

    await run({ prisma, now: AHORA, hashPassword: hash });

    expect(hash).toHaveBeenCalledTimes(1);
    expect(hash).toHaveBeenCalledWith(PASSWORD_DEMO);
    expect(tablas.usuario.every((usuario) => usuario.passwordHash === "hash-de-prueba")).toBe(true);
    expect(new Set(tablas.usuario.map((usuario) => usuario.correo)).size).toBe(tablas.usuario.length);
  });

  it("las solicitudes revisadas apuntan al admin del seed base", async () => {
    const { prisma, tablas } = crearPrismaFalso();

    await run({ prisma, now: AHORA, hashPassword: hashFalso });

    const admin = tablas.usuario.find((usuario) => usuario.correo === "admin@danzas.app");
    const revisadas = tablas.solicitudAcademia.filter((solicitud) => solicitud.estado !== "pendiente");

    expect(revisadas.length).toBeGreaterThan(0);
    expect(revisadas.every((solicitud) => solicitud.revisadoPor === admin.id && solicitud.revisadoEn)).toBe(true);
    expect(tablas.solicitudAcademia.filter((s) => s.estado === "pendiente").every((s) => !s.revisadoPor)).toBe(true);
  });

  it("sobre una base con las cuentas del seed y usuarios hechos a mano: reutiliza ids, no los modifica ni duplica", async () => {
    const semilla = {
      usuario: [
        { id: "admin-base", nombre: "Admin Danzas", correo: "admin@danzas.app", passwordHash: "viejo", rol: "admin", ciudad: "Bogotá", estado: "activo" },
        { id: "camila-base", nombre: "Camila Rodríguez", correo: "instructor.aprobado@danzas.app", passwordHash: "viejo", rol: "instructor", ciudad: "Barranquilla", estado: "activo" },
        { id: "andrea-base", nombre: "Andrea Pérez", correo: "estudiante1@danzas.app", passwordHash: "viejo", rol: "estudiante", ciudad: "Bogotá", estado: "activo" },
        { id: "laura-base", nombre: "Laura Sánchez", correo: "padre@danzas.app", passwordHash: "viejo", rol: "padre", ciudad: "Bogotá", estado: "activo" },
        { id: "mano-1", nombre: "Usuario Manual", correo: "manual@gmail.com", passwordHash: "x", rol: "estudiante", ciudad: "Cali", estado: "activo" },
      ],
      menor: [{ id: "mateo-base", padreId: "laura-base", nombre: "Mateo Sánchez" }],
      solicitudAcademia: [
        { id: "sol-base", instructorId: "camila-base", nombreAcademia: "Academia Ritmo Caribe", estado: "aprobada" },
      ],
    };
    const { prisma, tablas } = crearPrismaFalso({ semilla });

    const resultado = await run({ prisma, now: AHORA, hashPassword: hashFalso });

    expect(tablas.usuario.filter((usuario) => usuario.correo === "instructor.aprobado@danzas.app")).toHaveLength(1);
    expect(tablas.usuario.find((usuario) => usuario.id === "camila-base").passwordHash).toBe("viejo");
    expect(tablas.usuario.find((usuario) => usuario.id === "mano-1")).toBeDefined();
    expect(resultado.contadores.usuarios.existentes).toBe(4);
    expect(resultado.contadores.menores.existentes).toBe(1);
    expect(resultado.contadores.solicitudes.existentes).toBe(1);

    // La clase nueva de Camila y la inscripcion de Mateo usan los ids ya existentes.
    const folclor = tablas.clase.find((clase) => clase.instructorId === "camila-base");

    expect(folclor.tipoBaile).toBe("Folclor");
    expect(tablas.inscripcion.some((i) => i.usuarioId === "laura-base" && i.menorId === "mateo-base")).toBe(true);
    expect(tablas.solicitudAcademia.filter((s) => s.instructorId === "camila-base")).toHaveLength(1);
  });

  it("no pisa la decision del admin: una solicitud aprobada en vivo sigue contando como existente", async () => {
    const { prisma, tablas } = crearPrismaFalso();

    await run({ prisma, now: AHORA, hashPassword: hashFalso });

    // El admin aprueba en vivo a Sebastian y rechaza a Natalia.
    tablas.solicitudAcademia.filter((s) => s.estado === "pendiente").forEach((s, i) => {
      s.estado = i === 0 ? "aprobada" : "rechazada";
    });

    const segunda = await run({ prisma, now: AHORA, hashPassword: hashFalso });

    expect(segunda.contadores.solicitudes.creados).toBe(0);
    expect(tablas.solicitudAcademia.filter((s) => s.estado === "pendiente")).toHaveLength(0);
  });

  it("una semana despues solo agrega la asistencia de la nueva sesion", async () => {
    const { prisma } = crearPrismaFalso();

    await run({ prisma, now: AHORA, hashPassword: hashFalso });

    const unaSemanaDespues = await run({ prisma, now: new Date(AHORA.getTime() + 7 * MS_DIA), hashPassword: hashFalso });

    for (const entidad of ENTIDADES.filter((entidad) => entidad !== "asistencias")) {
      expect(unaSemanaDespues.contadores[entidad].creados).toBe(0);
    }

    expect(unaSemanaDespues.contadores.asistencias.creados).toBeGreaterThan(0);

    // Y vuelve a ser idempotente.
    const otraVez = await run({ prisma, now: new Date(AHORA.getTime() + 7 * MS_DIA), hashPassword: hashFalso });

    expect(totalCreado(otraVez.contadores)).toBe(0);
  });

  it("si el instructor ya tiene una clase que se cruza, omite esa clase y sus inscripciones con un aviso", async () => {
    const { prisma, tablas } = crearPrismaFalso();

    // Primero crea los usuarios de la demo para conocer el id de Daniela.
    await run({ prisma, now: AHORA, hashPassword: hashFalso });

    const daniela = tablas.usuario.find((usuario) => usuario.correo === "daniela.ospina@demo.danzas.app");

    // Se borra la clase D1 (Salsa, martes 19:00) y se pone una a mano que la pisa (martes 19:30-20:30).
    const d1 = tablas.clase.find((clase) => clase.instructorId === daniela.id && clase.tipoBaile === "Salsa");

    tablas.inscripcion.splice(0, tablas.inscripcion.length, ...tablas.inscripcion.filter((i) => i.claseId !== d1.id));
    tablas.horario.splice(0, tablas.horario.length, ...tablas.horario.filter((h) => h.claseId !== d1.id));
    tablas.clase.splice(tablas.clase.indexOf(d1), 1);
    tablas.clase.push({ id: "mano-clase", instructorId: daniela.id, tipoBaile: "Tango", ciudad: "Medellín", estado: "activa", cupoMaximo: 5, cupoDisponible: 5 });
    tablas.horario.push({
      id: "mano-horario",
      claseId: "mano-clase",
      diaSemana: 2,
      horaInicio: new Date(Date.UTC(1970, 0, 1, 19, 30)),
      horaFin: new Date(Date.UTC(1970, 0, 1, 20, 30)),
    });

    const resultado = await run({ prisma, now: AHORA, hashPassword: hashFalso });

    expect(resultado.contadores.clases.omitidos).toBe(1);
    expect(resultado.contadores.clases.creados).toBe(0);
    expect(resultado.contadores.inscripciones.omitidos).toBe(2);
    expect(resultado.advertencias.join(" ")).toMatch(/se cruza/);
    expect(tablas.clase.filter((clase) => clase.tipoBaile === "Salsa" && clase.instructorId === daniela.id)).toHaveLength(0);
  });
});

describe("run --dry-run", () => {
  it("cuenta lo que crearia sin escribir nada en una base vacia", async () => {
    const { prisma, escrituras, tablas } = crearPrismaFalso();
    const plan = contarPlan(buildDemoData(AHORA));
    const hash = vi.fn(async () => "hash-falso");

    const resultado = await run({ prisma, dryRun: true, now: AHORA, hashPassword: hash });

    expect(escrituras).toEqual([]);
    expect(Object.values(tablas).every((filas) => filas.length === 0)).toBe(true);
    expect(resultado.dryRun).toBe(true);

    for (const entidad of ENTIDADES) {
      expect(resultado.contadores[entidad].creados).toBe(plan[entidad]);
    }

    // En dry-run no se calcula ningun hash (bcrypt es lento y no hace falta).
    expect(hash).not.toHaveBeenCalled();
  });

  it("sobre una base ya sembrada informa 0 por crear y tampoco escribe", async () => {
    const { prisma, escrituras } = crearPrismaFalso();

    await run({ prisma, now: AHORA, hashPassword: hashFalso });

    const antes = escrituras.length;
    const resultado = await run({ prisma, dryRun: true, now: AHORA, hashPassword: hashFalso });

    expect(escrituras.length).toBe(antes);
    expect(totalCreado(resultado.contadores)).toBe(0);
  });
});

describe("errores accionables", () => {
  it("indica la entidad, el codigo de Prisma y que hacer, sin exponer credenciales", async () => {
    const { prisma } = crearPrismaFalso();
    const error = Object.assign(
      new Error("Invalid `prisma.usuario.create()` invocation:\n\nDatabase `danzas` at `localhost:3306` unavailable"),
      { code: "P1001" },
    );

    prisma.usuario.create = vi.fn().mockRejectedValue(error);

    const falla = await run({ prisma, now: AHORA, hashPassword: hashFalso }).catch((e) => e);
    const texto = describirError(falla);

    expect(falla.entidad).toBe("el usuario");
    expect(texto).toContain("el usuario");
    expect(texto).toContain("P1001");
    expect(texto).toContain("Qué hacer");
    expect(texto).not.toContain("Invalid `prisma.usuario.create()`");
    expect(texto).toContain("idempotente");
  });
});

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
describe("iniciar (CLI)", () => {
  const ENTORNO_LOCAL = { DATABASE_URL: "mysql://usuario:Secreta123@localhost:3306/danzas" };

  const crearEscenario = (extra = {}) => {
    const salida = crearCapturaDeSalida();
    const { prisma, tablas, escrituras } = crearPrismaFalso();
    const dependencias = {
      env: ENTORNO_LOCAL,
      cargarEntorno: vi.fn(),
      crearPrisma: vi.fn(() => prisma),
      ejecutarSeedBase: vi.fn(() => ({ status: 0 })),
      hashPassword: hashFalso,
      log: salida.log,
      logError: salida.logError,
      now: AHORA,
      ...extra,
    };

    return { dependencias, salida, prisma, tablas, escrituras };
  };

  it("--reset sin --yes aborta sin tocar nada (ni seed base ni conexion)", async () => {
    const { dependencias, salida, tablas } = crearEscenario();

    const codigo = await iniciar({ ...dependencias, argv: ["--reset"] });

    expect(codigo).toBe(1);
    expect(dependencias.ejecutarSeedBase).not.toHaveBeenCalled();
    expect(dependencias.crearPrisma).not.toHaveBeenCalled();
    expect(dependencias.cargarEntorno).not.toHaveBeenCalled();
    expect(Object.values(tablas).every((filas) => filas.length === 0)).toBe(true);
    expect(salida.lineas.join("\n")).toMatch(/--yes/);
  });

  it("--reset --yes corre primero el seed base y despues carga la demo", async () => {
    const { dependencias, tablas } = crearEscenario();
    const orden = [];

    dependencias.ejecutarSeedBase = vi.fn(() => {
      orden.push("seed-base");
      return { status: 0 };
    });
    const crearPrismaOriginal = dependencias.crearPrisma;

    dependencias.crearPrisma = vi.fn(() => {
      orden.push("prisma");
      return crearPrismaOriginal();
    });

    const codigo = await iniciar({ ...dependencias, argv: ["--reset", "--yes"] });

    expect(codigo).toBe(0);
    expect(orden).toEqual(["seed-base", "prisma"]);
    expect(tablas.usuario.length).toBe(buildDemoData(AHORA).usuarios.length);
  });

  it("si el seed base falla, no carga la demo y devuelve error", async () => {
    const { dependencias, salida } = crearEscenario({ ejecutarSeedBase: vi.fn(() => ({ status: 1 })) });

    const codigo = await iniciar({ ...dependencias, argv: ["--reset", "--yes"] });

    expect(codigo).toBe(1);
    expect(dependencias.crearPrisma).not.toHaveBeenCalled();
    expect(salida.lineas.join("\n")).toMatch(/seed base/);
  });

  it("--dry-run lee la base pero no escribe, y no ejecuta el seed base", async () => {
    const { dependencias, escrituras, salida, prisma } = crearEscenario();

    const codigo = await iniciar({ ...dependencias, argv: ["--dry-run"] });

    expect(codigo).toBe(0);
    expect(escrituras).toEqual([]);
    expect(dependencias.ejecutarSeedBase).not.toHaveBeenCalled();
    expect(prisma.$disconnect).toHaveBeenCalled();
    expect(salida.lineas.join("\n")).toMatch(/dry-run/);
  });

  it("--reset --dry-run solo muestra el plan: no lee la base, no ejecuta el seed base y no pide --yes", async () => {
    const { dependencias, salida } = crearEscenario();

    const codigo = await iniciar({ ...dependencias, argv: ["--reset", "--dry-run"] });

    expect(codigo).toBe(0);
    expect(dependencias.ejecutarSeedBase).not.toHaveBeenCalled();
    expect(dependencias.crearPrisma).not.toHaveBeenCalled();
    expect(salida.lineas.join("\n")).toMatch(/usuarios/);
  });

  it("rechaza opciones desconocidas (un typo como --dryrun no debe escribir en la base)", async () => {
    const { dependencias, salida } = crearEscenario();

    const codigo = await iniciar({ ...dependencias, argv: ["--dryrun"] });

    expect(codigo).toBe(1);
    expect(dependencias.crearPrisma).not.toHaveBeenCalled();
    expect(salida.lineas.join("\n")).toMatch(/--dryrun/);
  });

  it("una base que no es localhost exige --allow-remote", async () => {
    const entorno = { DATABASE_URL: "mysql://usuario:Secreta123@servidor.aivencloud.com:12345/danzas" };
    const { dependencias, salida } = crearEscenario({ env: entorno });

    const sinPermiso = await iniciar({ ...dependencias, argv: [] });

    expect(sinPermiso).toBe(1);
    expect(dependencias.crearPrisma).not.toHaveBeenCalled();
    expect(salida.lineas.join("\n")).toMatch(/--allow-remote/);

    const conPermiso = await iniciar({ ...dependencias, argv: ["--allow-remote"] });

    expect(conPermiso).toBe(0);
  });

  it("sin DATABASE_URL interpretable tambien exige --allow-remote", async () => {
    const { dependencias } = crearEscenario({ env: {} });

    expect(await iniciar({ ...dependencias, argv: [] })).toBe(1);
    expect(dependencias.crearPrisma).not.toHaveBeenCalled();
  });

  it("nunca imprime la contrasena ni la URL de conexion", async () => {
    const { dependencias, salida } = crearEscenario();

    await iniciar({ ...dependencias, argv: [] });

    const texto = salida.lineas.join("\n");

    expect(texto).not.toContain("Secreta123");
    expect(texto).not.toContain("mysql://");
    expect(texto).toContain("localhost:3306");
    // La contrasena de la demo si se muestra: es publica y de prueba.
    expect(texto).toContain(PASSWORD_DEMO);
  });

  it("imprime el resumen y la tabla de credenciales y desconecta al terminar", async () => {
    const { dependencias, salida, prisma } = crearEscenario();

    const codigo = await iniciar({ ...dependencias, argv: [] });
    const texto = salida.lineas.join("\n");

    expect(codigo).toBe(0);
    expect(texto).toMatch(/Resumen \(creados/);
    expect(texto).toContain("daniela.ospina@demo.danzas.app");
    expect(texto).toContain("admin@danzas.app");
    expect(prisma.$disconnect).toHaveBeenCalledTimes(1);
  });

  it("ante un error de Prisma devuelve 1 e imprime el codigo y la entidad", async () => {
    const { dependencias, salida, prisma } = crearEscenario();

    prisma.usuario.findUnique = vi.fn().mockRejectedValue(Object.assign(new Error("Can't reach database server"), { code: "P1001" }));

    const codigo = await iniciar({ ...dependencias, argv: [] });

    expect(codigo).toBe(1);
    expect(salida.lineas.join("\n")).toMatch(/P1001/);
    expect(salida.lineas.join("\n")).toMatch(/usuario/);
    expect(prisma.$disconnect).toHaveBeenCalled();
  });
});

describe("leerOpciones", () => {
  it("lee los flags y tambien los que npm deja en npm_config_*", () => {
    expect(leerOpciones(["--reset", "--yes"], {})).toMatchObject({ reset: true, confirmado: true, dryRun: false });
    expect(leerOpciones([], { npm_config_dry_run: "true" }).dryRun).toBe(true);
    expect(leerOpciones(["--nada"], {}).desconocidas).toEqual(["--nada"]);
  });
});
