import { createRequire } from "node:module";
import { describe, expect, it, vi } from "vitest";

// Los modulos de src son CommonJS: se cargan con el require nativo para compartir
// la misma instancia que usa el service, y asi poder espiar sus funciones.
const require = createRequire(import.meta.url);
const classRepository = require("../src/repositories/class.repository");
const classService = require("../src/services/class.service");
const { AppError } = require("../src/middleware/errorHandler");

// ---------------------------------------------------------------------------
// Pruebas unitarias: el repositorio se sustituye por stubs, sin base de datos.
// ---------------------------------------------------------------------------
describe("obtenerClase (RF-011: detalle publico de una clase)", () => {
  const detalle = {
    id: "clase-1",
    tipoBaile: "Salsa",
    horarios: [{ id: "h-1", diaSemana: 1 }],
    instructor: { id: "instructor-1", nombre: "Camila Rodríguez" },
  };

  it("devuelve la clase con horarios e instructor", async () => {
    const buscar = vi.spyOn(classRepository, "findDetalleById").mockResolvedValue(detalle);

    const resultado = await classService.obtenerClase("clase-1");

    expect(resultado).toBe(detalle);
    expect(buscar).toHaveBeenCalledWith("clase-1");
  });

  it("si la clase no existe: 404 CLASS_NOT_FOUND", async () => {
    vi.spyOn(classRepository, "findDetalleById").mockResolvedValue(null);

    const intento = classService.obtenerClase("no-existe");

    await expect(intento).rejects.toBeInstanceOf(AppError);
    await expect(intento).rejects.toMatchObject({ statusCode: 404, code: "CLASS_NOT_FOUND" });
  });
});

describe("listarClasesDelInstructor (RF-008: mis clases)", () => {
  it("devuelve las clases del instructor autenticado", async () => {
    const clases = [{ id: "c-1", horarios: [] }, { id: "c-2", horarios: [] }];
    const buscar = vi.spyOn(classRepository, "findByInstructor").mockResolvedValue(clases);

    const resultado = await classService.listarClasesDelInstructor("instructor-1");

    expect(resultado).toEqual(clases);
    expect(buscar).toHaveBeenCalledTimes(1);
    expect(buscar.mock.calls[0][0]).toBe("instructor-1");
  });

  it("sin clases devuelve un arreglo vacio", async () => {
    vi.spyOn(classRepository, "findByInstructor").mockResolvedValue([]);

    await expect(classService.listarClasesDelInstructor("instructor-1")).resolves.toEqual([]);
  });
});
