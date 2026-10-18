import { createRequire } from "node:module";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Los modulos de src son CommonJS: se cargan con el require nativo para compartir
// la misma instancia que usan los services, y asi poder espiar sus funciones.
const require = createRequire(import.meta.url);
const { Prisma } = require("@prisma/client");
const paymentRepository = require("../src/repositories/payment.repository");
const attendanceRepository = require("../src/repositories/attendance.repository");
const dependentRepository = require("../src/repositories/dependent.repository");
const { reportePagos, reporteAsistencia } = require("../src/services/report.service");

const admin = { id: "admin-1", rol: "admin" };
const instructor = { id: "instructor-1", rol: "instructor" };
const padre = { id: "padre-1", rol: "padre" };

// Prisma entrega las columnas DECIMAL como Prisma.Decimal, no como number.
const crearPago = (monto, sobrescribir = {}) => ({
  id: `pago-${monto}`,
  monto: new Prisma.Decimal(monto),
  estado: "aprobado",
  reembolsado: false,
  motivoReembolso: null,
  procesadoEn: new Date("2026-10-05T15:00:00.000Z"),
  inscripcion: {
    clase: { id: "clase-1", tipoBaile: "Salsa", instructor: { id: "instructor-1", nombre: "Carlos" } },
    usuario: { id: "estudiante-1", nombre: "Ana", correo: "ana@example.com" },
    menor: null,
  },
  ...sobrescribir,
});

// ---------------------------------------------------------------------------
// RF-015: reportePagos
// ---------------------------------------------------------------------------
describe("reportePagos", () => {
  beforeEach(() => {
    vi.spyOn(paymentRepository, "buscarParaReporte").mockResolvedValue([]);
  });

  describe("validacion de fechas", () => {
    it.each([
      ["rango invertido", { desde: "2026-12-01", hasta: "2026-01-01" }],
      ["desde con formato invalido", { desde: "01/12/2026" }],
      ["hasta con formato invalido", { hasta: "2026-1-5" }],
      ["fecha inexistente", { desde: "2026-02-30" }],
      ["fecha que no es texto", { hasta: ["2026-01-01", "2026-02-01"] }],
    ])("%s lanza INVALID_DATE_RANGE (400)", async (_nombre, filtros) => {
      await expect(reportePagos(admin, filtros)).rejects.toMatchObject({
        statusCode: 400,
        code: "INVALID_DATE_RANGE",
      });

      expect(paymentRepository.buscarParaReporte).not.toHaveBeenCalled();
    });

    it("acepta un rango de un solo dia (desde = hasta)", async () => {
      await reportePagos(admin, { desde: "2026-10-05", hasta: "2026-10-05" });

      expect(paymentRepository.buscarParaReporte).toHaveBeenCalledWith({
        desde: "2026-10-05",
        hasta: "2026-10-05",
        instructorId: null,
        academia: null,
      });
    });

    it("trata las cadenas vacias del query como filtros ausentes", async () => {
      await reportePagos(admin, { desde: "", hasta: " ", instructorId: "", academia: "" });

      expect(paymentRepository.buscarParaReporte).toHaveBeenCalledWith({
        desde: null,
        hasta: null,
        instructorId: null,
        academia: null,
      });
    });
  });

  describe("visibilidad por rol", () => {
    it("el administrador usa los filtros libremente", async () => {
      const resultado = await reportePagos(admin, {
        desde: "2026-10-01",
        hasta: "2026-10-31",
        instructorId: "instructor-9",
        academia: "Academia Ritmo Caribe",
      });

      const filtros = {
        desde: "2026-10-01",
        hasta: "2026-10-31",
        instructorId: "instructor-9",
        academia: "Academia Ritmo Caribe",
      };
      expect(paymentRepository.buscarParaReporte).toHaveBeenCalledWith(filtros);
      expect(resultado.filtros).toEqual(filtros);
    });

    it("un instructor sin instructorId queda forzado a su propio id", async () => {
      const resultado = await reportePagos(instructor, {});

      expect(paymentRepository.buscarParaReporte).toHaveBeenCalledWith(
        expect.objectContaining({ instructorId: instructor.id }),
      );
      expect(resultado.filtros.instructorId).toBe(instructor.id);
    });

    it("un instructor puede indicar su propio id", async () => {
      await reportePagos(instructor, { instructorId: instructor.id });

      expect(paymentRepository.buscarParaReporte).toHaveBeenCalledWith(
        expect.objectContaining({ instructorId: instructor.id }),
      );
    });

    it("un instructor que pide el id de otro lanza FORBIDDEN (403)", async () => {
      await expect(reportePagos(instructor, { instructorId: "instructor-2" })).rejects.toMatchObject({
        statusCode: 403,
        code: "FORBIDDEN",
      });

      expect(paymentRepository.buscarParaReporte).not.toHaveBeenCalled();
    });
  });

  describe("resumen", () => {
    it("calcula cantidad, totalRecibido, totalReembolsado y neto con montos Decimal", async () => {
      paymentRepository.buscarParaReporte.mockResolvedValue([
        crearPago("50000.00"),
        crearPago("30000.50", { reembolsado: true, motivoReembolso: "cancelacion_instructor" }),
        crearPago("20000.00"),
      ]);

      const { resumen, pagos } = await reportePagos(admin, {});

      expect(resumen).toEqual({
        cantidad: 3,
        totalRecibido: 100000.5,
        totalReembolsado: 30000.5,
        neto: 70000,
      });
      expect(pagos).toHaveLength(3);
    });

    it("convierte el monto de cada pago de Decimal a number", async () => {
      paymentRepository.buscarParaReporte.mockResolvedValue([crearPago("50000.00")]);

      const { pagos } = await reportePagos(admin, {});

      expect(pagos[0].monto).toBe(50000);
      expect(typeof pagos[0].monto).toBe("number");
      expect(pagos[0]).toMatchObject({
        id: "pago-50000.00",
        estado: "aprobado",
        reembolsado: false,
        inscripcion: { clase: { tipoBaile: "Salsa" } },
      });
    });

    it("no acumula errores de punto flotante al sumar centavos", async () => {
      paymentRepository.buscarParaReporte.mockResolvedValue([crearPago("0.10"), crearPago("0.20")]);

      const { resumen } = await reportePagos(admin, {});

      expect(resumen.totalRecibido).toBe(0.3);
      expect(resumen.neto).toBe(0.3);
    });

    it("ignora en los totales los pagos que no estan aprobados", async () => {
      paymentRepository.buscarParaReporte.mockResolvedValue([
        crearPago("50000.00"),
        crearPago("20000.00", { estado: "rechazado" }),
        crearPago("10000.00", { estado: "rechazado", reembolsado: true }),
      ]);

      const { resumen } = await reportePagos(admin, {});

      expect(resumen).toMatchObject({ totalRecibido: 50000, totalReembolsado: 0, neto: 50000 });
    });

    it("sin pagos devuelve el resumen en cero", async () => {
      const { resumen, pagos } = await reportePagos(admin, {});

      expect(resumen).toEqual({ cantidad: 0, totalRecibido: 0, totalReembolsado: 0, neto: 0 });
      expect(pagos).toEqual([]);
    });
  });
});

// ---------------------------------------------------------------------------
// RF-016: reporteAsistencia
// ---------------------------------------------------------------------------
const clase = (id, tipoBaile, ciudad = "Cali") => ({
  id,
  tipoBaile,
  ciudad,
  instructor: { nombre: "Carlos" },
});

// Prisma devuelve la fecha de sesion (columna DATE) como Date a medianoche UTC.
const asistencia = (fecha, asistio, claseDeLaSesion) => ({
  id: `asistencia-${fecha}-${claseDeLaSesion.id}`,
  fechaSesion: new Date(`${fecha}T00:00:00.000Z`),
  asistio,
  inscripcion: { clase: claseDeLaSesion },
});

describe("reporteAsistencia", () => {
  const mateo = { id: "menor-1", padreId: padre.id, nombre: "Mateo" };

  beforeEach(() => {
    vi.spyOn(dependentRepository, "findById").mockResolvedValue(mateo);
    vi.spyOn(attendanceRepository, "findByMenor").mockResolvedValue([]);
  });

  describe("validaciones", () => {
    it.each([undefined, null, "", ["a", "b"]])("sin dependentId (%j) lanza MISSING_DEPENDENT (400)", async (valor) => {
      await expect(reporteAsistencia(padre, valor)).rejects.toMatchObject({
        statusCode: 400,
        code: "MISSING_DEPENDENT",
      });

      expect(dependentRepository.findById).not.toHaveBeenCalled();
    });

    it("un menor inexistente lanza DEPENDENT_NOT_FOUND (404)", async () => {
      dependentRepository.findById.mockResolvedValue(null);

      await expect(reporteAsistencia(padre, "menor-x")).rejects.toMatchObject({
        statusCode: 404,
        code: "DEPENDENT_NOT_FOUND",
      });

      expect(attendanceRepository.findByMenor).not.toHaveBeenCalled();
    });

    it("un menor de otro padre lanza FORBIDDEN (403) sin consultar su asistencia", async () => {
      dependentRepository.findById.mockResolvedValue({ ...mateo, padreId: "padre-2" });

      await expect(reporteAsistencia(padre, mateo.id)).rejects.toMatchObject({
        statusCode: 403,
        code: "FORBIDDEN",
      });

      expect(attendanceRepository.findByMenor).not.toHaveBeenCalled();
    });
  });

  describe("reporte", () => {
    it("calcula los porcentajes del resumen y de cada clase", async () => {
      const salsa = clase("clase-1", "Salsa");
      const bachata = clase("clase-2", "Bachata", "Bogota");
      // Mas reciente primero, como las entrega el repositorio.
      attendanceRepository.findByMenor.mockResolvedValue([
        asistencia("2026-10-14", true, salsa),
        asistencia("2026-10-12", false, bachata),
        asistencia("2026-10-07", true, salsa),
        asistencia("2026-09-30", false, salsa),
      ]);

      const reporte = await reporteAsistencia(padre, mateo.id);

      expect(dependentRepository.findById).toHaveBeenCalledWith(mateo.id);
      expect(attendanceRepository.findByMenor).toHaveBeenCalledWith(mateo.id);
      expect(reporte).toEqual({
        menor: { id: "menor-1", nombre: "Mateo" },
        resumen: { sesiones: 4, presentes: 2, ausentes: 2, porcentaje: 50 },
        clases: [
          {
            claseId: "clase-1",
            tipoBaile: "Salsa",
            ciudad: "Cali",
            instructor: { nombre: "Carlos" },
            sesiones: 3,
            presentes: 2,
            ausentes: 1,
            porcentaje: 66.7,
            detalle: [
              { fecha: "2026-10-14", asistio: true },
              { fecha: "2026-10-07", asistio: true },
              { fecha: "2026-09-30", asistio: false },
            ],
          },
          {
            claseId: "clase-2",
            tipoBaile: "Bachata",
            ciudad: "Bogota",
            instructor: { nombre: "Carlos" },
            sesiones: 1,
            presentes: 0,
            ausentes: 1,
            porcentaje: 0,
            detalle: [{ fecha: "2026-10-12", asistio: false }],
          },
        ],
      });
    });

    it("un menor sin sesiones devuelve porcentaje 0 sin dividir por cero", async () => {
      const reporte = await reporteAsistencia(padre, mateo.id);

      expect(reporte.resumen).toEqual({ sesiones: 0, presentes: 0, ausentes: 0, porcentaje: 0 });
      expect(reporte.clases).toEqual([]);
      expect(reporte.menor).toEqual({ id: "menor-1", nombre: "Mateo" });
    });

    it("asistencia completa da 100", async () => {
      const salsa = clase("clase-1", "Salsa");
      attendanceRepository.findByMenor.mockResolvedValue([
        asistencia("2026-10-14", true, salsa),
        asistencia("2026-10-07", true, salsa),
      ]);

      const reporte = await reporteAsistencia(padre, mateo.id);

      expect(reporte.resumen.porcentaje).toBe(100);
      expect(reporte.clases[0].porcentaje).toBe(100);
    });
  });
});
