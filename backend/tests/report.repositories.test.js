import { createRequire } from "node:module";
import { beforeEach, describe, expect, it, vi } from "vitest";

const require = createRequire(import.meta.url);
const prisma = require("../src/config/prisma");
const paymentRepository = require("../src/repositories/payment.repository");
const attendanceRepository = require("../src/repositories/attendance.repository");

describe("paymentRepository.buscarParaReporte", () => {
  beforeEach(() => {
    vi.spyOn(prisma.pago, "findMany").mockResolvedValue([]);
  });

  const whereUsado = () => prisma.pago.findMany.mock.calls[0][0].where;

  it("sin filtros solo pide los pagos aprobados, el mas reciente primero", async () => {
    await paymentRepository.buscarParaReporte({});

    expect(prisma.pago.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { estado: "aprobado" }, orderBy: { procesadoEn: "desc" } }),
    );
  });

  it("incluye los datos de la clase, el instructor, el estudiante y el menor", async () => {
    await paymentRepository.buscarParaReporte({});

    const { include } = prisma.pago.findMany.mock.calls[0][0];
    const { clase, usuario, menor } = include.inscripcion.include;
    expect(clase.select).toMatchObject({ id: true, tipoBaile: true, instructor: { select: { id: true, nombre: true } } });
    expect(usuario.select).toEqual({ id: true, nombre: true, correo: true });
    expect(menor.select).toEqual({ id: true, nombre: true });
  });

  it("toma desde y hasta como dias completos de Colombia (UTC-5), ambos inclusive", async () => {
    await paymentRepository.buscarParaReporte({ desde: "2026-10-01", hasta: "2026-10-31" });

    const { gte, lte } = whereUsado().procesadoEn;
    expect(gte.toISOString()).toBe("2026-10-01T05:00:00.000Z");
    expect(lte.toISOString()).toBe("2026-11-01T04:59:59.999Z");
  });

  it("con solo desde o solo hasta arma un rango abierto", async () => {
    await paymentRepository.buscarParaReporte({ desde: "2026-10-01" });
    expect(Object.keys(whereUsado().procesadoEn)).toEqual(["gte"]);

    await paymentRepository.buscarParaReporte({ hasta: "2026-10-31" });
    expect(Object.keys(prisma.pago.findMany.mock.calls[1][0].where.procesadoEn)).toEqual(["lte"]);
  });

  it("filtra por instructor y por academia aprobada en la misma relacion de clase", async () => {
    await paymentRepository.buscarParaReporte({ instructorId: "instructor-1", academia: "Ritmo Caribe" });

    expect(whereUsado().inscripcion).toEqual({
      clase: {
        instructorId: "instructor-1",
        instructor: {
          solicitudes: { some: { estado: "aprobada", nombreAcademia: "Ritmo Caribe" } },
        },
      },
    });
  });
});

describe("attendanceRepository.findByMenor", () => {
  it("consulta las asistencias de las inscripciones del menor, la mas reciente primero", async () => {
    vi.spyOn(prisma.asistencia, "findMany").mockResolvedValue([]);

    await attendanceRepository.findByMenor("menor-1");

    expect(prisma.asistencia.findMany).toHaveBeenCalledWith({
      where: { inscripcion: { menorId: "menor-1" } },
      include: {
        inscripcion: {
          select: {
            clase: {
              select: { id: true, tipoBaile: true, ciudad: true, instructor: { select: { nombre: true } } },
            },
          },
        },
      },
      orderBy: { fechaSesion: "desc" },
    });
  });
});
