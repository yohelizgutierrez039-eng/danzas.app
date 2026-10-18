import { createRequire } from "node:module";
import { describe, expect, it, vi } from "vitest";

// Los modulos de src son CommonJS: se cargan con el require nativo para compartir
// la misma instancia de prisma que usa el repositorio.
const require = createRequire(import.meta.url);
const prisma = require("../src/config/prisma");
const classRepository = require("../src/repositories/class.repository");

// ---------------------------------------------------------------------------
// Pruebas unitarias: prisma se sustituye por stubs, sin base de datos.
// ---------------------------------------------------------------------------
describe("searchClasses (RF-011: la busqueda devuelve horarios e instructor)", () => {
  it("incluye horarios e instructor {id, nombre} en cada clase", async () => {
    const buscar = vi.spyOn(prisma.clase, "findMany").mockResolvedValue([]);

    await classRepository.searchClasses({ tipoBaile: "Salsa", ciudad: "Barranquilla" });

    expect(buscar).toHaveBeenCalledWith({
      where: { tipoBaile: "Salsa", ciudad: "Barranquilla", estado: "activa" },
      include: {
        horarios: true,
        instructor: { select: { id: true, nombre: true } },
      },
    });
  });

  it("mantiene el filtro estado activa aunque no lleguen filtros", async () => {
    const buscar = vi.spyOn(prisma.clase, "findMany").mockResolvedValue([]);

    await classRepository.searchClasses({});

    expect(buscar.mock.calls[0][0].where).toEqual({
      tipoBaile: undefined,
      ciudad: undefined,
      estado: "activa",
    });
  });
});
