import { createRequire } from "node:module";
import { describe, expect, it, vi } from "vitest";

// Los modulos de src son CommonJS: se cargan con el require nativo para compartir
// la misma instancia de prisma que usa el repositorio.
const require = createRequire(import.meta.url);
const prisma = require("../src/config/prisma");
const attendanceRepository = require("../src/repositories/attendance.repository");

const CLASE_ID = "clase-1";
const FECHA = "2026-10-13";

// ---------------------------------------------------------------------------
// Base de datos en memoria con solo lo que usa el repositorio. Reproduce la
// semantica de las consultas (filtros por inscripcion y fecha) para comprobar
// el resultado final y no solo las llamadas.
// ---------------------------------------------------------------------------
const crearDb = ({ inscripciones }) => {
  const asistencias = [];
  let secuencia = 0;
  const mismaFecha = (a, b) => new Date(a).getTime() === new Date(b).getTime();

  const db = {
    asistencias,
    $queryRaw: vi.fn().mockResolvedValue([]),
    inscripcion: {
      findMany: vi.fn(async ({ where }) =>
        inscripciones.filter((i) => where.id.in.includes(i.id) && i.claseId === where.claseId).map((i) => ({ id: i.id })),
      ),
    },
    asistencia: {
      deleteMany: vi.fn(async ({ where }) => {
        const antes = asistencias.length;
        for (let i = asistencias.length - 1; i >= 0; i -= 1) {
          if (where.inscripcionId.in.includes(asistencias[i].inscripcionId) && mismaFecha(asistencias[i].fechaSesion, where.fechaSesion)) {
            asistencias.splice(i, 1);
          }
        }
        return { count: antes - asistencias.length };
      }),
      createMany: vi.fn(async ({ data }) => {
        data.forEach((fila) => asistencias.push({ id: `a-${(secuencia += 1)}`, ...fila }));
        return { count: data.length };
      }),
      findMany: vi.fn(async ({ where }) =>
        asistencias.filter(
          (a) =>
            mismaFecha(a.fechaSesion, where.fechaSesion) &&
            inscripciones.find((i) => i.id === a.inscripcionId)?.claseId === where.inscripcion.claseId,
        ),
      ),
    },
  };

  vi.spyOn(prisma, "$transaction").mockImplementation(async (callback) => callback(db));
  vi.spyOn(prisma.asistencia, "findMany").mockImplementation(db.asistencia.findMany);

  return db;
};

const inscripciones = [
  { id: "insc-1", claseId: CLASE_ID },
  { id: "insc-2", claseId: CLASE_ID },
  { id: "insc-ajena", claseId: "otra-clase" },
];

describe("registrarVarias (RF-010: guardar asistencia es idempotente)", () => {
  it("guarda una fila por alumno y devuelve { count }", async () => {
    const db = crearDb({ inscripciones });

    const resultado = await attendanceRepository.registrarVarias(CLASE_ID, FECHA, [
      { inscripcionId: "insc-1", asistio: true },
      { inscripcionId: "insc-2", asistio: false },
    ]);

    expect(resultado).toEqual({ count: 2 });
    expect(db.asistencias).toHaveLength(2);
  });

  it("guardar dos veces la misma fecha deja una fila por alumno con los ultimos valores", async () => {
    const db = crearDb({ inscripciones });

    await attendanceRepository.registrarVarias(CLASE_ID, FECHA, [
      { inscripcionId: "insc-1", asistio: true },
      { inscripcionId: "insc-2", asistio: true },
    ]);
    const segundo = await attendanceRepository.registrarVarias(CLASE_ID, FECHA, [
      { inscripcionId: "insc-1", asistio: false },
      { inscripcionId: "insc-2", asistio: true },
    ]);

    expect(segundo).toEqual({ count: 2 });
    expect(db.asistencias).toHaveLength(2);

    // La lectura (GET /classes/:id/attendance) refleja la actualizacion.
    const leidas = await attendanceRepository.findByClaseYFecha(CLASE_ID, FECHA);
    const porInscripcion = Object.fromEntries(leidas.map((a) => [a.inscripcionId, a.asistio]));
    expect(porInscripcion).toEqual({ "insc-1": false, "insc-2": true });
  });

  it("solo reemplaza esa fecha: las asistencias de otras fechas se conservan", async () => {
    const db = crearDb({ inscripciones });

    await attendanceRepository.registrarVarias(CLASE_ID, "2026-10-06", [{ inscripcionId: "insc-1", asistio: true }]);
    await attendanceRepository.registrarVarias(CLASE_ID, FECHA, [{ inscripcionId: "insc-1", asistio: false }]);
    await attendanceRepository.registrarVarias(CLASE_ID, FECHA, [{ inscripcionId: "insc-1", asistio: true }]);

    expect(db.asistencias).toHaveLength(2);
    const anterior = db.asistencias.find((a) => new Date(a.fechaSesion).getTime() === new Date("2026-10-06").getTime());
    expect(anterior.asistio).toBe(true);
  });

  it("guardar solo a algunos alumnos no borra la asistencia de los demas ese dia", async () => {
    const db = crearDb({ inscripciones });

    await attendanceRepository.registrarVarias(CLASE_ID, FECHA, [
      { inscripcionId: "insc-1", asistio: true },
      { inscripcionId: "insc-2", asistio: true },
    ]);
    await attendanceRepository.registrarVarias(CLASE_ID, FECHA, [{ inscripcionId: "insc-1", asistio: false }]);

    expect(db.asistencias).toHaveLength(2);
    expect(db.asistencias.find((a) => a.inscripcionId === "insc-2").asistio).toBe(true);
    expect(db.asistencias.find((a) => a.inscripcionId === "insc-1").asistio).toBe(false);
  });

  it("descarta inscripciones que no son de la clase", async () => {
    const db = crearDb({ inscripciones });

    const resultado = await attendanceRepository.registrarVarias(CLASE_ID, FECHA, [
      { inscripcionId: "insc-1", asistio: true },
      { inscripcionId: "insc-ajena", asistio: true },
    ]);

    expect(resultado).toEqual({ count: 1 });
    expect(db.asistencias.map((a) => a.inscripcionId)).toEqual(["insc-1"]);
  });

  it("si el mismo alumno viene repetido en la peticion, gana el ultimo valor y queda una fila", async () => {
    const db = crearDb({ inscripciones });

    await attendanceRepository.registrarVarias(CLASE_ID, FECHA, [
      { inscripcionId: "insc-1", asistio: true },
      { inscripcionId: "insc-1", asistio: false },
    ]);

    expect(db.asistencias).toHaveLength(1);
    expect(db.asistencias[0].asistio).toBe(false);
  });

  it("bloquea la fila de la clase dentro de la transaccion para serializar guardados concurrentes", async () => {
    const db = crearDb({ inscripciones });

    await attendanceRepository.registrarVarias(CLASE_ID, FECHA, [{ inscripcionId: "insc-1", asistio: true }]);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(db.$queryRaw).toHaveBeenCalledTimes(1);
  });
});
