import { createRequire } from "node:module";
import { describe, expect, it, vi } from "vitest";

// Los modulos de src son CommonJS: se cargan con el require nativo para compartir
// la misma instancia que usa el service, y asi poder espiar sus funciones.
const require = createRequire(import.meta.url);
const academyRequestRepository = require("../src/repositories/academyRequest.repository");
const classRepository = require("../src/repositories/class.repository");
const scheduleService = require("../src/services/schedule.service");
const { crearClase } = require("../src/services/class.service");
const { AppError } = require("../src/middleware/errorHandler");

// ---------------------------------------------------------------------------
// Pruebas unitarias: los repositorios se sustituyen por stubs, sin base de datos.
// ---------------------------------------------------------------------------
describe("crearClase (RF-006 / RF-008: solo instructores con academia aprobada)", () => {
  const INSTRUCTOR_ID = "instructor-1";
  const datosClase = {
    tipoBaile: "salsa",
    ciudad: "Barranquilla",
    diaSemana: 1,
    horaInicio: new Date("1970-01-01T18:00:00.000Z"),
    horaFin: new Date("1970-01-01T19:00:00.000Z"),
  };
  const claseCreada = { id: "clase-1", instructorId: INSTRUCTOR_ID };

  const solicitud = (estado, nombreAcademia = "Academia Demo") => ({
    id: `sol-${estado}`,
    instructorId: INSTRUCTOR_ID,
    nombreAcademia,
    estado,
  });

  const stubs = (solicitudes) => {
    vi.spyOn(academyRequestRepository, "findByInstructor").mockResolvedValue(solicitudes);
    return {
      horario: vi.spyOn(scheduleService, "hayConflictoDeHorario").mockResolvedValue(undefined),
      crear: vi.spyOn(classRepository, "create").mockResolvedValue(claseCreada),
    };
  };

  describe("instructor habilitado", () => {
    it("con una solicitud aprobada crea la clase", async () => {
      const { horario, crear } = stubs([solicitud("aprobada")]);

      const resultado = await crearClase(INSTRUCTOR_ID, datosClase);

      expect(resultado).toBe(claseCreada);
      expect(horario).toHaveBeenCalledTimes(1);
      expect(crear).toHaveBeenCalledWith({ instructorId: INSTRUCTOR_ID, ...datosClase });
    });

    it("independiente aprobado (nombreAcademia null) tambien puede crear clases", async () => {
      const { crear } = stubs([solicitud("aprobada", null)]);

      await expect(crearClase(INSTRUCTOR_ID, datosClase)).resolves.toBe(claseCreada);
      expect(crear).toHaveBeenCalledTimes(1);
    });

    it("con varias academias basta una aprobada aunque otra este rechazada o pendiente", async () => {
      const { crear } = stubs([solicitud("rechazada"), solicitud("pendiente"), solicitud("aprobada")]);

      await expect(crearClase(INSTRUCTOR_ID, datosClase)).resolves.toBe(claseCreada);
      expect(crear).toHaveBeenCalledTimes(1);
    });
  });

  describe("instructor sin academia aprobada", () => {
    it.each([
      ["solicitud rechazada", [solicitud("rechazada")], /rechazada/],
      ["solicitud pendiente", [solicitud("pendiente")], /pendiente/],
      ["sin ninguna solicitud", [], /Aún no tienes/],
    ])("%s: 403 ACADEMY_NOT_APPROVED y no se crea la clase", async (_caso, solicitudes, mensaje) => {
      const { horario, crear } = stubs(solicitudes);

      const intento = crearClase(INSTRUCTOR_ID, datosClase);

      await expect(intento).rejects.toBeInstanceOf(AppError);
      await expect(intento).rejects.toMatchObject({
        statusCode: 403,
        code: "ACADEMY_NOT_APPROVED",
        message: expect.stringMatching(mensaje),
      });
      expect(crear).not.toHaveBeenCalled();
      // La regla de academia se evalua antes que el cruce de horarios.
      expect(horario).not.toHaveBeenCalled();
    });
  });
});
