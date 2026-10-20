import { createRequire } from "node:module";
import { describe, expect, it, vi } from "vitest";

const require = createRequire(import.meta.url);
const dependentRepository = require("../src/repositories/dependent.repository");
const dependentService = require("../src/services/dependent.service");
const dependentController = require("../src/controllers/dependent.controller");
const authMiddleware = require("../src/middleware/auth.middleware");
const router = require("../src/routes/users.routes");
const { AppError } = require("../src/middleware/errorHandler");

const menor = { id: "m-1", padreId: "padre-1", nombre: "Mateo", fechaNacimiento: new Date("2018-05-10") };

describe("obtenerMenorPorId (RF-004, RNF-007: un menor solo lo ve su padre o un admin)", () => {
  const buscar = (encontrado = menor) => vi.spyOn(dependentRepository, "findById").mockResolvedValue(encontrado);

  it("el padre dueño obtiene al menor", async () => {
    buscar();

    await expect(dependentService.obtenerMenorPorId("m-1", { id: "padre-1", rol: "padre" })).resolves.toBe(menor);
  });

  it("el admin obtiene a cualquier menor", async () => {
    buscar();

    await expect(dependentService.obtenerMenorPorId("m-1", { id: "admin-1", rol: "admin" })).resolves.toBe(menor);
  });

  it("otro padre recibe 403 FORBIDDEN", async () => {
    buscar();

    await expect(dependentService.obtenerMenorPorId("m-1", { id: "padre-2", rol: "padre" })).rejects.toMatchObject({
      statusCode: 403,
      code: "FORBIDDEN",
      message: "No tenés permiso para ver este menor.",
    });
  });

  it.each(["estudiante", "instructor"])("un %s recibe 403 aunque su id coincida con el padreId", async (rol) => {
    buscar();

    await expect(dependentService.obtenerMenorPorId("m-1", { id: "padre-1", rol })).rejects.toMatchObject({
      statusCode: 403,
      code: "FORBIDDEN",
    });
  });

  it("un menor inexistente da 404 DEPENDENT_NOT_FOUND", async () => {
    buscar(null);

    await expect(dependentService.obtenerMenorPorId("nada", { id: "padre-1", rol: "padre" })).rejects.toMatchObject({
      statusCode: 404,
      code: "DEPENDENT_NOT_FOUND",
    });
  });
});

describe("dependent.controller#getDependentById", () => {
  const crearRes = () => ({ status: vi.fn().mockReturnThis(), json: vi.fn() });

  it("pasa al solicitante autenticado al servicio y responde 200", async () => {
    const obtener = vi.spyOn(dependentService, "obtenerMenorPorId").mockResolvedValue(menor);
    const user = { id: "padre-1", rol: "padre" };
    const res = crearRes();

    await dependentController.getDependentById({ user, params: { id: "m-1" } }, res, vi.fn());

    expect(obtener).toHaveBeenCalledWith("m-1", user);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ dependent: menor });
  });

  it("manda el error del servicio a next sin responder", async () => {
    const error = new AppError("x", 403, "FORBIDDEN");
    vi.spyOn(dependentService, "obtenerMenorPorId").mockRejectedValue(error);
    const res = crearRes();
    const next = vi.fn();

    await dependentController.getDependentById({ user: { id: "p", rol: "padre" }, params: { id: "m-1" } }, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.json).not.toHaveBeenCalled();
  });
});

describe("users.routes GET /dependents/:id", () => {
  const ruta = router.stack.find((capa) => capa.route && capa.route.path === "/dependents/:id" && capa.route.methods.get).route;
  const middlewares = ruta.stack.slice(0, -1).map((c) => c.handle);

  const permite = (rol) => {
    const next = vi.fn();
    middlewares[middlewares.length - 1]({ user: { id: "u-1", rol } }, {}, next);

    return next.mock.calls[0][0] === undefined;
  };

  it("exige autenticacion y luego un guard de rol", () => {
    expect(middlewares).toHaveLength(2);
    expect(middlewares[0]).toBe(authMiddleware);
  });

  it("apunta a dependentController.getDependentById", () => {
    expect(ruta.stack[ruta.stack.length - 1].handle).toBe(dependentController.getDependentById);
  });

  it.each([
    ["padre", true],
    ["admin", true],
    ["estudiante", false],
    ["instructor", false],
  ])("rol %s, acceso permitido: %s", (rol, permitido) => {
    expect(permite(rol)).toBe(permitido);
  });
});
