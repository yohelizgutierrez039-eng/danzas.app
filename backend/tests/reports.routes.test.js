import { createRequire } from "node:module";
import { describe, expect, it, vi } from "vitest";

const require = createRequire(import.meta.url);
const reportService = require("../src/services/report.service");
const reportController = require("../src/controllers/report.controller");
const router = require("../src/routes/reports.routes");
const { AppError } = require("../src/middleware/errorHandler");

// Rutas GET montadas en el router, con sus middlewares y el handler final.
const rutasGet = () =>
  router.stack
    .filter((capa) => capa.route && capa.route.methods.get)
    .map((capa) => ({
      path: capa.route.path,
      middlewares: capa.route.stack.slice(0, -1).map((c) => c.handle),
      handler: capa.route.stack[capa.route.stack.length - 1].handle,
    }));

// Ejecuta el guard de rol de la ruta (el ultimo middleware) con un usuario dado.
const permite = (ruta, rol) => {
  const next = vi.fn();
  ruta.middlewares[ruta.middlewares.length - 1]({ user: { id: "u-1", rol } }, {}, next);

  return next.mock.calls[0][0] === undefined;
};

const crearRes = () => ({ status: vi.fn().mockReturnThis(), json: vi.fn() });

describe("reports.routes", () => {
  it.each([
    ["/payments", "getPaymentsReport", ["admin", "instructor"], ["estudiante", "padre"]],
    ["/attendance", "getAttendanceReport", ["padre"], ["admin", "instructor", "estudiante"]],
  ])("GET %s apunta a reportController.%s y limita los roles", (path, nombreHandler, permitidos, denegados) => {
    const ruta = rutasGet().find((r) => r.path === path);

    expect(ruta, `falta la ruta GET ${path}`).toBeDefined();
    expect(ruta.handler).toBe(reportController[nombreHandler]);
    // authMiddleware primero, luego el guard de rol.
    expect(ruta.middlewares).toHaveLength(2);

    permitidos.forEach((rol) => expect(permite(ruta, rol), rol).toBe(true));
    denegados.forEach((rol) => expect(permite(ruta, rol), rol).toBe(false));
  });
});

describe("report.controller", () => {
  const user = { id: "u-1", rol: "admin" };

  it("getPaymentsReport traduce el query snake_case al servicio y responde 200", async () => {
    const reporte = { filtros: {}, resumen: {}, pagos: [] };
    const reportePagos = vi.spyOn(reportService, "reportePagos").mockResolvedValue(reporte);
    const res = crearRes();

    await reportController.getPaymentsReport(
      { user, query: { desde: "2026-10-01", hasta: "2026-10-31", instructor_id: "i-1", academia: "Ritmo" } },
      res,
      vi.fn(),
    );

    expect(reportePagos).toHaveBeenCalledWith(user, {
      desde: "2026-10-01",
      hasta: "2026-10-31",
      instructorId: "i-1",
      academia: "Ritmo",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(reporte);
  });

  it("getAttendanceReport pasa dependent_id al servicio y responde 200", async () => {
    const reporte = { menor: {}, resumen: {}, clases: [] };
    const reporteAsistencia = vi.spyOn(reportService, "reporteAsistencia").mockResolvedValue(reporte);
    const res = crearRes();

    await reportController.getAttendanceReport({ user, query: { dependent_id: "m-1" } }, res, vi.fn());

    expect(reporteAsistencia).toHaveBeenCalledWith(user, "m-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(reporte);
  });

  it.each([
    ["getPaymentsReport", "reportePagos"],
    ["getAttendanceReport", "reporteAsistencia"],
  ])("%s manda los errores a next sin responder", async (nombreHandler, nombreServicio) => {
    const error = new AppError("x", 403, "FORBIDDEN");
    vi.spyOn(reportService, nombreServicio).mockRejectedValue(error);
    const res = crearRes();
    const next = vi.fn();

    await reportController[nombreHandler]({ user, query: {} }, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.json).not.toHaveBeenCalled();
  });
});
