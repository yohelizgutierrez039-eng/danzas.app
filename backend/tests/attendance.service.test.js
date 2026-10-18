import { createRequire } from "node:module";
import { describe, expect, it, vi } from "vitest";

// Los modulos de src son CommonJS: se cargan con el require nativo para compartir
// la misma instancia que usa el service, y asi poder espiar sus funciones.
const require = createRequire(import.meta.url);
const classRepository = require("../src/repositories/class.repository");
const enrollmentRepository = require("../src/repositories/enrollment.repository");
const attendanceRepository = require("../src/repositories/attendance.repository");
const attendanceService = require("../src/services/attendance.service");
const attendanceController = require("../src/controllers/attendance.controller");
const { AppError } = require("../src/middleware/errorHandler");

// ---------------------------------------------------------------------------
// Pruebas unitarias: los repositorios se sustituyen por stubs, sin base de datos.
// ---------------------------------------------------------------------------
describe("obtenerAsistencia (RF-010: consulta de asistencia de una clase)", () => {
  const CLASE_ID = "clase-1";
  const INSTRUCTOR_ID = "instructor-1";
  const FECHA = "2026-10-13";

  const inscripcionAdulto = {
    id: "insc-andrea",
    usuario: { id: "u-andrea", nombre: "Andrea" },
    menor: null,
  };
  const inscripcionMenor = {
    id: "insc-mateo",
    usuario: { id: "u-padre", nombre: "Padre de Mateo" },
    menor: { id: "m-mateo", nombre: "Mateo" },
  };

  const stubs = ({ clase = { id: CLASE_ID, instructorId: INSTRUCTOR_ID }, alumnos = [], asistencias = [] } = {}) => ({
    buscarClase: vi.spyOn(classRepository, "findById").mockResolvedValue(clase),
    buscarAlumnos: vi.spyOn(enrollmentRepository, "findAlumnosConfirmados").mockResolvedValue(alumnos),
    buscarAsistencias: vi.spyOn(attendanceRepository, "findByClaseYFecha").mockResolvedValue(asistencias),
  });

  describe("validaciones", () => {
    it.each([
      ["sin fecha", undefined],
      ["fecha vacia", ""],
      ["formato incorrecto", "13/10/2026"],
      ["con hora", "2026-10-13T10:00:00Z"],
      ["mes inexistente", "2026-13-01"],
      ["dia inexistente", "2026-02-30"],
      ["no es string", ["2026-10-13"]],
    ])("fecha invalida (%s): 400 INVALID_DATE", async (_caso, fecha) => {
      const { buscarAlumnos } = stubs();

      const intento = attendanceService.obtenerAsistencia(CLASE_ID, INSTRUCTOR_ID, fecha);

      await expect(intento).rejects.toBeInstanceOf(AppError);
      await expect(intento).rejects.toMatchObject({ statusCode: 400, code: "INVALID_DATE" });
      expect(buscarAlumnos).not.toHaveBeenCalled();
    });

    it("acepta un 29 de febrero valido", async () => {
      stubs();

      await expect(attendanceService.obtenerAsistencia(CLASE_ID, INSTRUCTOR_ID, "2028-02-29")).resolves.toMatchObject({
        fecha: "2028-02-29",
      });
    });

    it("clase inexistente: 404 CLASS_NOT_FOUND", async () => {
      const { buscarAlumnos } = stubs({ clase: null });

      await expect(attendanceService.obtenerAsistencia("nada", INSTRUCTOR_ID, FECHA)).rejects.toMatchObject({
        statusCode: 404,
        code: "CLASS_NOT_FOUND",
      });
      expect(buscarAlumnos).not.toHaveBeenCalled();
    });

    it("clase de otro instructor: 403 FORBIDDEN y no se leen alumnos", async () => {
      const { buscarAlumnos, buscarAsistencias } = stubs({
        clase: { id: CLASE_ID, instructorId: "otro-instructor" },
      });

      await expect(attendanceService.obtenerAsistencia(CLASE_ID, INSTRUCTOR_ID, FECHA)).rejects.toMatchObject({
        statusCode: 403,
        code: "FORBIDDEN",
      });
      expect(buscarAlumnos).not.toHaveBeenCalled();
      expect(buscarAsistencias).not.toHaveBeenCalled();
    });
  });

  describe("combinacion de alumnos y asistencia registrada", () => {
    it("asistio es true/false si hay registro y null si todavia no se tomo", async () => {
      const { buscarAsistencias } = stubs({
        alumnos: [inscripcionAdulto, inscripcionMenor],
        asistencias: [{ inscripcionId: "insc-andrea", asistio: true }],
      });

      const resultado = await attendanceService.obtenerAsistencia(CLASE_ID, INSTRUCTOR_ID, FECHA);

      expect(buscarAsistencias).toHaveBeenCalledWith(CLASE_ID, FECHA);
      expect(resultado).toEqual({
        claseId: CLASE_ID,
        fecha: FECHA,
        alumnos: [
          { inscripcionId: "insc-andrea", nombre: "Andrea", esMenor: false, asistio: true },
          { inscripcionId: "insc-mateo", nombre: "Mateo", esMenor: true, asistio: null },
        ],
      });
    });

    it("una inasistencia registrada es false, no null", async () => {
      stubs({
        alumnos: [inscripcionAdulto],
        asistencias: [{ inscripcionId: "insc-andrea", asistio: false }],
      });

      const { alumnos } = await attendanceService.obtenerAsistencia(CLASE_ID, INSTRUCTOR_ID, FECHA);

      expect(alumnos[0].asistio).toBe(false);
    });

    it("usa el nombre del menor cuando lo hay (no el del padre)", async () => {
      stubs({ alumnos: [inscripcionMenor] });

      const { alumnos } = await attendanceService.obtenerAsistencia(CLASE_ID, INSTRUCTOR_ID, FECHA);

      expect(alumnos[0]).toMatchObject({ nombre: "Mateo", esMenor: true });
    });

    it("ignora asistencias de inscripciones que ya no estan confirmadas", async () => {
      stubs({
        alumnos: [inscripcionAdulto],
        asistencias: [{ inscripcionId: "insc-cancelada", asistio: true }],
      });

      const { alumnos } = await attendanceService.obtenerAsistencia(CLASE_ID, INSTRUCTOR_ID, FECHA);

      expect(alumnos).toEqual([{ inscripcionId: "insc-andrea", nombre: "Andrea", esMenor: false, asistio: null }]);
    });

    it("clase sin alumnos confirmados devuelve la lista vacia", async () => {
      stubs();

      const resultado = await attendanceService.obtenerAsistencia(CLASE_ID, INSTRUCTOR_ID, FECHA);

      expect(resultado.alumnos).toEqual([]);
    });
  });
});

describe("getAttendance (controlador)", () => {
  const crearRes = () => ({ status: vi.fn().mockReturnThis(), json: vi.fn() });

  it("lee el id de la ruta, el instructor autenticado y ?fecha", async () => {
    const respuesta = { claseId: "clase-1", fecha: "2026-10-13", alumnos: [] };
    const obtener = vi.spyOn(attendanceService, "obtenerAsistencia").mockResolvedValue(respuesta);
    const res = crearRes();

    await attendanceController.getAttendance(
      { params: { id: "clase-1" }, user: { id: "instructor-1" }, query: { fecha: "2026-10-13" } },
      res,
      vi.fn(),
    );

    expect(obtener).toHaveBeenCalledWith("clase-1", "instructor-1", "2026-10-13");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(respuesta);
  });

  it("los errores van a next", async () => {
    const error = new AppError("Fecha inválida.", 400, "INVALID_DATE");
    vi.spyOn(attendanceService, "obtenerAsistencia").mockRejectedValue(error);
    const next = vi.fn();

    await attendanceController.getAttendance(
      { params: { id: "c" }, user: { id: "i" }, query: {} },
      crearRes(),
      next,
    );

    expect(next).toHaveBeenCalledWith(error);
  });

  it("registerAttendance sigue funcionando (POST existente)", async () => {
    const registrar = vi.spyOn(attendanceService, "registrarAsistencia").mockResolvedValue({ count: 1 });
    const res = crearRes();

    await attendanceController.registerAttendance(
      {
        params: { id: "clase-1" },
        user: { id: "instructor-1" },
        body: { fechaSesion: "2026-10-13", registros: [{ inscripcionId: "i", asistio: true }] },
      },
      res,
      vi.fn(),
    );

    expect(registrar).toHaveBeenCalledWith("clase-1", "instructor-1", "2026-10-13", [
      { inscripcionId: "i", asistio: true },
    ]);
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
