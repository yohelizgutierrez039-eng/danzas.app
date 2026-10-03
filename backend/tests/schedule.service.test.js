import { createRequire } from "node:module";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Los modulos de src son CommonJS: se cargan con el require nativo para compartir
// la misma instancia que usa el service, y asi poder espiar sus funciones.
const require = createRequire(import.meta.url);
const prisma = require("../src/config/prisma");
const classRepository = require("../src/repositories/class.repository");
const { hayConflictoDeHorario } = require("../src/services/schedule.service");
const { AppError } = require("../src/middleware/errorHandler");

// Prisma entrega las columnas TIME como Date en UTC con fecha 1970-01-01.
const hora = (hhmm) => new Date(`1970-01-01T${hhmm}:00.000Z`);

const horario = (diaSemana, inicio, fin) => ({
  diaSemana,
  horaInicio: hora(inicio),
  horaFin: hora(fin),
});

const claseConHorarios = (id, ...horarios) => ({ id, horarios });

const INSTRUCTOR_A = "instructor-a";
const INSTRUCTOR_B = "instructor-b";
const LUNES = 1;
const MARTES = 2;

describe("hayConflictoDeHorario", () => {
  let tx;
  let clasesPorInstructor;

  beforeEach(() => {
    tx = { marca: "tx" };
    clasesPorInstructor = {};

    // La transaccion se resuelve en memoria: ejecuta el callback con un tx falso.
    vi.spyOn(prisma, "$transaction").mockImplementation(async (callback) => callback(tx));

    // El repositorio devuelve solo las clases del instructor consultado.
    vi.spyOn(classRepository, "findByInstructor").mockImplementation(
      async (instructorId) => clasesPorInstructor[instructorId] ?? [],
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const capturarError = async (promesa) => {
    try {
      await promesa;
    } catch (error) {
      return error;
    }
    return null;
  };

  describe("consulta al repositorio", () => {
    it("pide solo las clases activas del instructor dentro de la transaccion", async () => {
      await hayConflictoDeHorario(INSTRUCTOR_A, horario(LUNES, "08:00", "09:00"));

      expect(classRepository.findByInstructor).toHaveBeenCalledWith(
        INSTRUCTOR_A,
        { estado: "activa" },
        tx,
      );
    });
  });

  describe("superposicion de horarios", () => {
    it("lanza SCHEDULE_CONFLICT (409) cuando los rangos se superponen", async () => {
      clasesPorInstructor[INSTRUCTOR_A] = [
        claseConHorarios("clase-1", horario(LUNES, "08:00", "10:00")),
      ];

      const error = await capturarError(
        hayConflictoDeHorario(INSTRUCTOR_A, horario(LUNES, "09:00", "11:00")),
      );

      expect(error).toBeInstanceOf(AppError);
      expect(error.code).toBe("SCHEDULE_CONFLICT");
      expect(error.statusCode).toBe(409);
    });

    it("lanza SCHEDULE_CONFLICT cuando el nuevo horario esta contenido en uno existente", async () => {
      clasesPorInstructor[INSTRUCTOR_A] = [
        claseConHorarios("clase-1", horario(LUNES, "08:00", "12:00")),
      ];

      await expect(
        hayConflictoDeHorario(INSTRUCTOR_A, horario(LUNES, "09:00", "10:00")),
      ).rejects.toMatchObject({ code: "SCHEDULE_CONFLICT", statusCode: 409 });
    });

    it("lanza SCHEDULE_CONFLICT cuando el nuevo horario envuelve a uno existente", async () => {
      clasesPorInstructor[INSTRUCTOR_A] = [
        claseConHorarios("clase-1", horario(LUNES, "09:00", "10:00")),
      ];

      await expect(
        hayConflictoDeHorario(INSTRUCTOR_A, horario(LUNES, "08:00", "12:00")),
      ).rejects.toMatchObject({ code: "SCHEDULE_CONFLICT" });
    });

    it("lanza SCHEDULE_CONFLICT cuando los horarios son identicos", async () => {
      clasesPorInstructor[INSTRUCTOR_A] = [
        claseConHorarios("clase-1", horario(LUNES, "08:00", "09:00")),
      ];

      await expect(
        hayConflictoDeHorario(INSTRUCTOR_A, horario(LUNES, "08:00", "09:00")),
      ).rejects.toMatchObject({ code: "SCHEDULE_CONFLICT" });
    });
  });

  describe("margen minimo de 15 minutos entre clases", () => {
    beforeEach(() => {
      clasesPorInstructor[INSTRUCTOR_A] = [
        claseConHorarios("clase-1", horario(LUNES, "08:00", "09:00")),
      ];
    });

    it("lanza SCHEDULE_CONFLICT si la nueva clase empieza 14 minutos despues de que termina otra", async () => {
      await expect(
        hayConflictoDeHorario(INSTRUCTOR_A, horario(LUNES, "09:14", "10:00")),
      ).rejects.toMatchObject({ code: "SCHEDULE_CONFLICT", statusCode: 409 });
    });

    it("lanza SCHEDULE_CONFLICT si la nueva clase termina 14 minutos antes de que empiece otra", async () => {
      await expect(
        hayConflictoDeHorario(INSTRUCTOR_A, horario(LUNES, "06:30", "07:46")),
      ).rejects.toMatchObject({ code: "SCHEDULE_CONFLICT", statusCode: 409 });
    });

    it("lanza SCHEDULE_CONFLICT si una clase termina justo cuando empieza la otra (0 minutos)", async () => {
      await expect(
        hayConflictoDeHorario(INSTRUCTOR_A, horario(LUNES, "09:00", "10:00")),
      ).rejects.toMatchObject({ code: "SCHEDULE_CONFLICT" });
    });

    it("LIMITE: con exactamente 15 minutos despues NO lanza error", async () => {
      await expect(
        hayConflictoDeHorario(INSTRUCTOR_A, horario(LUNES, "09:15", "10:00")),
      ).resolves.toBeUndefined();
    });

    it("LIMITE: con exactamente 15 minutos antes NO lanza error", async () => {
      await expect(
        hayConflictoDeHorario(INSTRUCTOR_A, horario(LUNES, "06:30", "07:45")),
      ).resolves.toBeUndefined();
    });

    it("no lanza error cuando hay mas de 15 minutos de separacion", async () => {
      await expect(
        hayConflictoDeHorario(INSTRUCTOR_A, horario(LUNES, "10:00", "11:00")),
      ).resolves.toBeUndefined();
    });
  });

  describe("otros instructores y otros dias", () => {
    it("no lanza error si el mismo horario esta ocupado por OTRO instructor", async () => {
      clasesPorInstructor[INSTRUCTOR_B] = [
        claseConHorarios("clase-b", horario(LUNES, "08:00", "09:00")),
      ];

      await expect(
        hayConflictoDeHorario(INSTRUCTOR_A, horario(LUNES, "08:00", "09:00")),
      ).resolves.toBeUndefined();

      // Y el mismo horario si choca para el instructor dueno de la clase.
      await expect(
        hayConflictoDeHorario(INSTRUCTOR_B, horario(LUNES, "08:00", "09:00")),
      ).rejects.toMatchObject({ code: "SCHEDULE_CONFLICT" });
    });

    it("no lanza error si la misma franja horaria cae en otro dia de la semana", async () => {
      clasesPorInstructor[INSTRUCTOR_A] = [
        claseConHorarios("clase-1", horario(LUNES, "08:00", "09:00")),
      ];

      await expect(
        hayConflictoDeHorario(INSTRUCTOR_A, horario(MARTES, "08:00", "09:00")),
      ).resolves.toBeUndefined();
    });

    it("revisa todas las clases y todos los horarios del instructor", async () => {
      clasesPorInstructor[INSTRUCTOR_A] = [
        claseConHorarios("clase-1", horario(LUNES, "08:00", "09:00")),
        claseConHorarios(
          "clase-2",
          horario(MARTES, "08:00", "09:00"),
          horario(MARTES, "18:00", "19:00"),
        ),
      ];

      await expect(
        hayConflictoDeHorario(INSTRUCTOR_A, horario(MARTES, "18:30", "19:30")),
      ).rejects.toMatchObject({ code: "SCHEDULE_CONFLICT" });
    });

    it("no lanza error si el instructor no tiene clases activas", async () => {
      await expect(
        hayConflictoDeHorario(INSTRUCTOR_A, horario(LUNES, "08:00", "09:00")),
      ).resolves.toBeUndefined();
    });
  });

  describe("edicion de una clase (claseIdAExcluir)", () => {
    beforeEach(() => {
      clasesPorInstructor[INSTRUCTOR_A] = [
        claseConHorarios("clase-1", horario(LUNES, "08:00", "09:00")),
      ];
    });

    it("ignora la propia clase al editar su horario", async () => {
      await expect(
        hayConflictoDeHorario(INSTRUCTOR_A, horario(LUNES, "08:30", "09:30"), "clase-1"),
      ).resolves.toBeUndefined();
    });

    it("sigue detectando conflicto con las OTRAS clases al editar", async () => {
      clasesPorInstructor[INSTRUCTOR_A].push(
        claseConHorarios("clase-2", horario(LUNES, "10:00", "11:00")),
      );

      await expect(
        hayConflictoDeHorario(INSTRUCTOR_A, horario(LUNES, "08:30", "10:30"), "clase-1"),
      ).rejects.toMatchObject({ code: "SCHEDULE_CONFLICT" });
    });

    it("sin claseIdAExcluir la misma clase si cuenta como conflicto", async () => {
      await expect(
        hayConflictoDeHorario(INSTRUCTOR_A, horario(LUNES, "08:30", "09:30")),
      ).rejects.toMatchObject({ code: "SCHEDULE_CONFLICT" });
    });
  });

  describe("horas recibidas como texto ISO-8601 (formato real de la API)", () => {
    // Salsa los lunes de 18:00 a 19:00, como en el caso real del instructor aprobado.
    const iso = (hhmm) => `1970-01-01T${hhmm}:00.000Z`;
    const horarioIso = (diaSemana, inicio, fin) => ({
      diaSemana,
      horaInicio: iso(inicio),
      horaFin: iso(fin),
    });

    beforeEach(() => {
      clasesPorInstructor[INSTRUCTOR_A] = [
        claseConHorarios("clase-1", horario(LUNES, "18:00", "19:00")),
      ];
    });

    it("lanza SCHEDULE_CONFLICT cuando el rango ISO se superpone (18:30-19:30)", async () => {
      await expect(
        hayConflictoDeHorario(INSTRUCTOR_A, horarioIso(LUNES, "18:30", "19:30")),
      ).rejects.toMatchObject({ code: "SCHEDULE_CONFLICT", statusCode: 409 });
    });

    it("lanza SCHEDULE_CONFLICT con solo 5 minutos de separacion (19:05-20:00)", async () => {
      await expect(
        hayConflictoDeHorario(INSTRUCTOR_A, horarioIso(LUNES, "19:05", "20:00")),
      ).rejects.toMatchObject({ code: "SCHEDULE_CONFLICT", statusCode: 409 });
    });

    it("lanza SCHEDULE_CONFLICT con 14 minutos de separacion", async () => {
      await expect(
        hayConflictoDeHorario(INSTRUCTOR_A, horarioIso(LUNES, "19:14", "20:00")),
      ).rejects.toMatchObject({ code: "SCHEDULE_CONFLICT" });
    });

    it("LIMITE: con exactamente 15 minutos de separacion NO lanza error", async () => {
      await expect(
        hayConflictoDeHorario(INSTRUCTOR_A, horarioIso(LUNES, "19:15", "20:00")),
      ).resolves.toBeUndefined();
    });

    it("no lanza error si el mismo rango ISO cae en otro dia de la semana", async () => {
      await expect(
        hayConflictoDeHorario(INSTRUCTOR_A, horarioIso(MARTES, "18:30", "19:30")),
      ).resolves.toBeUndefined();
    });

    it("tambien funciona cuando el horario existente viene como texto ISO", async () => {
      clasesPorInstructor[INSTRUCTOR_A] = [
        claseConHorarios("clase-1", {
          diaSemana: LUNES,
          horaInicio: iso("18:00"),
          horaFin: iso("19:00"),
        }),
      ];

      await expect(
        hayConflictoDeHorario(INSTRUCTOR_A, horarioIso(LUNES, "18:30", "19:30")),
      ).rejects.toMatchObject({ code: "SCHEDULE_CONFLICT" });
    });

    it("ISO y Date son equivalentes: mismo resultado para el mismo horario", async () => {
      const casos = [
        ["18:30", "19:30"], // se superpone
        ["19:14", "20:00"], // 14 min
        ["19:15", "20:00"], // 15 min, limite
        ["10:00", "11:00"], // lejos
      ];

      for (const [inicio, fin] of casos) {
        const conDate = await capturarError(
          hayConflictoDeHorario(INSTRUCTOR_A, horario(LUNES, inicio, fin)),
        );
        const conIso = await capturarError(
          hayConflictoDeHorario(INSTRUCTOR_A, horarioIso(LUNES, inicio, fin)),
        );

        expect(conIso?.code).toBe(conDate?.code);
      }
    });

    it("usa la hora UTC aunque el ISO traiga un offset", async () => {
      // 13:30-14:30 en -05:00 equivale a 18:30-19:30 UTC.
      await expect(
        hayConflictoDeHorario(INSTRUCTOR_A, {
          diaSemana: LUNES,
          horaInicio: "1970-01-01T13:30:00.000-05:00",
          horaFin: "1970-01-01T14:30:00.000-05:00",
        }),
      ).rejects.toMatchObject({ code: "SCHEDULE_CONFLICT" });
    });
  });

  describe("horario invalido (falla en voz alta, no pasa en silencio)", () => {
    const H = "1970-01-01T18:00:00.000Z";

    it.each([
      ["hora de inicio no numerica", { horaInicio: "abc", horaFin: H }],
      ["hora de fin no numerica", { horaInicio: H, horaFin: "abc" }],
      ["hora de inicio undefined", { horaInicio: undefined, horaFin: H }],
      ["hora de fin undefined", { horaInicio: H, horaFin: undefined }],
      ["hora de inicio null", { horaInicio: null, horaFin: H }],
      ["hora de fin numerica", { horaInicio: H, horaFin: 1900 }],
      ["ISO con fecha invalida", { horaInicio: "1970-01-01Tzz:00:00.000Z", horaFin: H }],
      ["Date invalido", { horaInicio: new Date("nope"), horaFin: H }],
      ["hora fuera de rango (25:00)", { horaInicio: "25:00", horaFin: "26:00" }],
      ["minutos fuera de rango (10:75)", { horaInicio: "10:75", horaFin: "11:00" }],
      [
        "fin igual al inicio",
        { horaInicio: "1970-01-01T18:00:00.000Z", horaFin: "1970-01-01T18:00:00.000Z" },
      ],
      [
        "fin anterior al inicio",
        { horaInicio: "1970-01-01T19:00:00.000Z", horaFin: "1970-01-01T18:00:00.000Z" },
      ],
      ["fin anterior al inicio en HH:MM", { horaInicio: "19:00", horaFin: "18:00" }],
    ])("%s: 400 INVALID_SCHEDULE y no consulta la base de datos", async (_caso, horas) => {
      const intento = hayConflictoDeHorario(INSTRUCTOR_A, { diaSemana: LUNES, ...horas });

      await expect(intento).rejects.toBeInstanceOf(AppError);
      await expect(intento).rejects.toMatchObject({ statusCode: 400, code: "INVALID_SCHEDULE" });
      expect(classRepository.findByInstructor).not.toHaveBeenCalled();
    });

    it("un horario sin ningun dato tambien lanza INVALID_SCHEDULE", async () => {
      await expect(hayConflictoDeHorario(INSTRUCTOR_A, undefined)).rejects.toMatchObject({
        statusCode: 400,
        code: "INVALID_SCHEDULE",
      });
    });
  });

  describe("formato de la hora", () => {
    it("acepta horas de entrada en formato texto HH:MM", async () => {
      clasesPorInstructor[INSTRUCTOR_A] = [
        claseConHorarios("clase-1", horario(LUNES, "08:00", "09:00")),
      ];

      await expect(
        hayConflictoDeHorario(INSTRUCTOR_A, { diaSemana: LUNES, horaInicio: "09:15", horaFin: "10:00" }),
      ).resolves.toBeUndefined();

      await expect(
        hayConflictoDeHorario(INSTRUCTOR_A, { diaSemana: LUNES, horaInicio: "09:10", horaFin: "10:00" }),
      ).rejects.toMatchObject({ code: "SCHEDULE_CONFLICT" });
    });
  });
});
