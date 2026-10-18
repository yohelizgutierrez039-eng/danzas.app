import { createRequire } from "node:module";
import { describe, expect, it, vi } from "vitest";

// Los modulos de src son CommonJS: se cargan con el require nativo para compartir
// la misma instancia que usa el controller, y asi poder espiar sus funciones.
const require = createRequire(import.meta.url);
const classService = require("../src/services/class.service");
const classController = require("../src/controllers/class.controller");
const { AppError } = require("../src/middleware/errorHandler");

const crearRes = () => ({ status: vi.fn().mockReturnThis(), json: vi.fn() });

describe("searchClasses (RF-011: filtro por tipo de baile)", () => {
  it("lee tipoBaile de la query", async () => {
    const buscar = vi.spyOn(classService, "searchClasses").mockResolvedValue([]);

    await classController.searchClasses({ query: { tipoBaile: "Salsa", ciudad: "Barranquilla" } }, crearRes());

    expect(buscar).toHaveBeenCalledWith({ tipoBaile: "Salsa", ciudad: "Barranquilla" });
  });

  it("acepta tipo como alias de tipoBaile (lo que envia el frontend)", async () => {
    const buscar = vi.spyOn(classService, "searchClasses").mockResolvedValue([]);

    await classController.searchClasses({ query: { tipo: "Salsa" } }, crearRes());

    expect(buscar).toHaveBeenCalledWith({ tipoBaile: "Salsa", ciudad: undefined });
  });

  it("si llegan los dos, gana tipoBaile", async () => {
    const buscar = vi.spyOn(classService, "searchClasses").mockResolvedValue([]);

    await classController.searchClasses({ query: { tipoBaile: "Bachata", tipo: "Salsa" } }, crearRes());

    expect(buscar).toHaveBeenCalledWith({ tipoBaile: "Bachata", ciudad: undefined });
  });
});

describe("getClassById", () => {
  it("responde 200 con la clase", async () => {
    const clase = { id: "clase-1" };
    const obtener = vi.spyOn(classService, "obtenerClase").mockResolvedValue(clase);
    const res = crearRes();

    await classController.getClassById({ params: { id: "clase-1" } }, res, vi.fn());

    expect(obtener).toHaveBeenCalledWith("clase-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(clase);
  });

  it("los errores van a next", async () => {
    const error = new AppError("Clase no encontrada.", 404, "CLASS_NOT_FOUND");
    vi.spyOn(classService, "obtenerClase").mockRejectedValue(error);
    const next = vi.fn();

    await classController.getClassById({ params: { id: "x" } }, crearRes(), next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe("getMyClasses", () => {
  it("lista las clases del instructor autenticado (req.user.id)", async () => {
    const clases = [{ id: "c-1" }];
    const listar = vi.spyOn(classService, "listarClasesDelInstructor").mockResolvedValue(clases);
    const res = crearRes();

    await classController.getMyClasses({ user: { id: "instructor-1", rol: "instructor" } }, res, vi.fn());

    expect(listar).toHaveBeenCalledWith("instructor-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(clases);
  });

  it("los errores van a next", async () => {
    const error = new Error("falla");
    vi.spyOn(classService, "listarClasesDelInstructor").mockRejectedValue(error);
    const next = vi.fn();

    await classController.getMyClasses({ user: { id: "i" } }, crearRes(), next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
