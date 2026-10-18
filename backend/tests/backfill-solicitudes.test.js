import { createRequire } from "node:module";
import { describe, expect, it, vi } from "vitest";

// Los modulos de src/scripts son CommonJS: se cargan con el require nativo.
// El script solo se ejecuta como CLI cuando es el modulo principal, asi que
// importarlo aqui no toca la base de datos.
const require = createRequire(import.meta.url);
const { backfillSolicitudes } = require("../scripts/backfill-solicitudes");

// Cliente Prisma falso con solo lo que usa el script.
const crearPrisma = (instructoresSinSolicitud) => ({
  usuario: { findMany: vi.fn().mockResolvedValue(instructoresSinSolicitud) },
  solicitudAcademia: { create: vi.fn().mockResolvedValue({}) },
});

describe("backfillSolicitudes (RF-006: solicitud pendiente para instructores existentes)", () => {
  it("busca instructores sin ninguna solicitud", async () => {
    const prisma = crearPrisma([]);

    await backfillSolicitudes({ prisma, dryRun: false });

    expect(prisma.usuario.findMany).toHaveBeenCalledWith({
      where: { rol: "instructor", solicitudes: { none: {} } },
      select: { id: true },
    });
  });

  it("crea una solicitud pendiente de instructor independiente por cada uno", async () => {
    const prisma = crearPrisma([{ id: "i-1" }, { id: "i-2" }]);

    const resultado = await backfillSolicitudes({ prisma, dryRun: false });

    expect(prisma.solicitudAcademia.create).toHaveBeenCalledTimes(2);
    expect(prisma.solicitudAcademia.create).toHaveBeenCalledWith({
      data: { instructorId: "i-1", nombreAcademia: null, estado: "pendiente" },
    });
    expect(prisma.solicitudAcademia.create).toHaveBeenCalledWith({
      data: { instructorId: "i-2", nombreAcademia: null, estado: "pendiente" },
    });
    expect(resultado).toEqual({ encontrados: 2, creadas: 2, dryRun: false });
  });

  it("--dry-run informa cuantos tocaria pero no escribe nada", async () => {
    const prisma = crearPrisma([{ id: "i-1" }]);

    const resultado = await backfillSolicitudes({ prisma, dryRun: true });

    expect(prisma.solicitudAcademia.create).not.toHaveBeenCalled();
    expect(resultado).toEqual({ encontrados: 1, creadas: 0, dryRun: true });
  });

  it("es idempotente: sin instructores pendientes no crea nada (segunda ejecucion)", async () => {
    const prisma = crearPrisma([]);

    const resultado = await backfillSolicitudes({ prisma, dryRun: false });

    expect(prisma.solicitudAcademia.create).not.toHaveBeenCalled();
    expect(resultado).toEqual({ encontrados: 0, creadas: 0, dryRun: false });
  });
});
