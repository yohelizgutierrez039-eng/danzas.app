import { createRequire } from "node:module";
import { describe, expect, it, vi } from "vitest";

// Los modulos de src son CommonJS: se cargan con el require nativo para compartir
// la misma instancia que usa el service, y asi poder espiar sus funciones.
const require = createRequire(import.meta.url);
const prisma = require("../src/config/prisma");
const classRepository = require("../src/repositories/class.repository");
const enrollmentRepository = require("../src/repositories/enrollment.repository");
const scheduleService = require("../src/services/schedule.service");
const { editarClase } = require("../src/services/class.service");
const { AppError } = require("../src/middleware/errorHandler");

// ---------------------------------------------------------------------------
// Pruebas unitarias: repositorios y transaccion sustituidos por stubs.
// Inscritos = cupoMaximo - cupoDisponible.
// ---------------------------------------------------------------------------
describe("editarClase (RF-009: cambiar cupoMaximo mantiene cupoDisponible coherente)", () => {
  const INSTRUCTOR_ID = "instructor-1";
  const tx = { id: "tx-falsa" };

  // Clase con 10 de cupo y 4 inscritos (cupoDisponible 6).
  const claseConInscritos = (cupoMaximo = 10, cupoDisponible = 6) => ({
    id: "clase-1",
    instructorId: INSTRUCTOR_ID,
    cupoMaximo,
    cupoDisponible,
    horarios: [{ diaSemana: 1, horaInicio: new Date("1970-01-01T18:00:00.000Z"), horaFin: new Date("1970-01-01T19:00:00.000Z") }],
  });

  // `fuera` es lo que se lee antes de la transaccion; `dentro` lo que se lee con la
  // fila bloqueada (puede diferir si hubo una inscripcion concurrente).
  const stubs = ({ fuera = claseConInscritos(), dentro = fuera } = {}) => {
    vi.spyOn(classRepository, "findById").mockImplementation(async (id, client) => (client === tx ? dentro : fuera));
    vi.spyOn(scheduleService, "hayConflictoDeHorario").mockResolvedValue(undefined);
    vi.spyOn(prisma, "$transaction").mockImplementation(async (callback) => callback(tx));
    return {
      bloquear: vi.spyOn(enrollmentRepository, "bloquearClase").mockResolvedValue(undefined),
      actualizar: vi.spyOn(classRepository, "update").mockResolvedValue({ id: "clase-1" }),
    };
  };

  it("subir el cupo suma la diferencia a cupoDisponible (10 -> 15 con 4 inscritos: 11 libres)", async () => {
    const { actualizar, bloquear } = stubs();

    await editarClase("clase-1", INSTRUCTOR_ID, { cupoMaximo: 15 });

    expect(bloquear).toHaveBeenCalledWith("clase-1", tx);
    expect(actualizar).toHaveBeenCalledWith("clase-1", { cupoMaximo: 15, cupoDisponible: 11 }, tx);
  });

  it("bajar el cupo por encima de los inscritos resta la diferencia (10 -> 8: 4 libres)", async () => {
    const { actualizar } = stubs();

    await editarClase("clase-1", INSTRUCTOR_ID, { cupoMaximo: 8 });

    expect(actualizar).toHaveBeenCalledWith("clase-1", { cupoMaximo: 8, cupoDisponible: 4 }, tx);
  });

  it("bajar el cupo justo hasta los inscritos es valido y deja 0 libres", async () => {
    const { actualizar } = stubs();

    await editarClase("clase-1", INSTRUCTOR_ID, { cupoMaximo: 4 });

    expect(actualizar).toHaveBeenCalledWith("clase-1", { cupoMaximo: 4, cupoDisponible: 0 }, tx);
  });

  it("bajar el cupo por debajo de los inscritos: 400 INVALID_CAPACITY y no se actualiza", async () => {
    const { actualizar } = stubs();

    const intento = editarClase("clase-1", INSTRUCTOR_ID, { cupoMaximo: 3 });

    await expect(intento).rejects.toBeInstanceOf(AppError);
    await expect(intento).rejects.toMatchObject({
      statusCode: 400,
      code: "INVALID_CAPACITY",
      message: expect.stringMatching(/inscrit/i),
    });
    expect(actualizar).not.toHaveBeenCalled();
  });

  it("usa los datos leidos con la clase bloqueada: una inscripcion concurrente cuenta", async () => {
    // Antes de bloquear habia 4 inscritos; con el lock ya son 8 (cupoDisponible 2).
    const { actualizar } = stubs({ fuera: claseConInscritos(10, 6), dentro: claseConInscritos(10, 2) });

    await expect(editarClase("clase-1", INSTRUCTOR_ID, { cupoMaximo: 6 })).rejects.toMatchObject({
      statusCode: 400,
      code: "INVALID_CAPACITY",
    });
    expect(actualizar).not.toHaveBeenCalled();
  });

  it.each([
    ["negativo", -1],
    ["cero", 0],
    ["decimal", 2.5],
    ["texto", "abc"],
    ["texto numerico", "15"],
    ["nulo", null],
  ])("cupoMaximo %s: 400 INVALID_CAPACITY", async (_caso, cupoMaximo) => {
    const { actualizar } = stubs();

    await expect(editarClase("clase-1", INSTRUCTOR_ID, { cupoMaximo })).rejects.toMatchObject({
      statusCode: 400,
      code: "INVALID_CAPACITY",
    });
    expect(actualizar).not.toHaveBeenCalled();
  });

  describe("sin cupoMaximo el comportamiento no cambia", () => {
    it("actualiza solo lo recibido, sin transaccion ni bloqueo", async () => {
      const { actualizar, bloquear } = stubs();

      await editarClase("clase-1", INSTRUCTOR_ID, { ciudad: "Medellín" });

      expect(actualizar).toHaveBeenCalledWith("clase-1", { ciudad: "Medellín" });
      expect(bloquear).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it("un cupoDisponible enviado por el cliente se ignora siempre", async () => {
      const { actualizar } = stubs();

      await editarClase("clase-1", INSTRUCTOR_ID, { ciudad: "Medellín", cupoDisponible: 999 });
      expect(actualizar).toHaveBeenLastCalledWith("clase-1", { ciudad: "Medellín" });

      await editarClase("clase-1", INSTRUCTOR_ID, { cupoMaximo: 15, cupoDisponible: 999 });
      expect(actualizar).toHaveBeenLastCalledWith("clase-1", { cupoMaximo: 15, cupoDisponible: 11 }, tx);
    });
  });
});
