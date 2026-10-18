import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

// Los modulos de src son CommonJS: se cargan con el require nativo.
const require = createRequire(import.meta.url);
const classController = require("../src/controllers/class.controller");
const attendanceController = require("../src/controllers/attendance.controller");
const authMiddleware = require("../src/middleware/auth.middleware");
const router = require("../src/routes/classes.routes");

// Rutas GET montadas, en el orden en que Express las evalua.
const rutasGet = () =>
  router.stack
    .filter((capa) => capa.route && capa.route.methods.get)
    .map((capa) => ({
      path: capa.route.path,
      handlers: capa.route.stack.map((c) => c.handle),
    }));

const indiceDe = (path) => rutasGet().findIndex((r) => r.path === path);

describe("classes.routes (RF-011 / RF-008: lecturas de clases)", () => {
  it("/search y /my-classes se declaran ANTES de /:id", () => {
    expect(indiceDe("/search")).toBeGreaterThanOrEqual(0);
    expect(indiceDe("/my-classes")).toBeGreaterThanOrEqual(0);
    expect(indiceDe("/:id")).toBeGreaterThanOrEqual(0);
    expect(indiceDe("/search")).toBeLessThan(indiceDe("/:id"));
    expect(indiceDe("/my-classes")).toBeLessThan(indiceDe("/:id"));
  });

  it("GET /:id es publico: solo tiene el controlador, sin auth", () => {
    const ruta = rutasGet().find((r) => r.path === "/:id");

    expect(ruta.handlers).toEqual([classController.getClassById]);
  });

  it("GET /my-classes pasa por auth + rol y apunta a getMyClasses", () => {
    const ruta = rutasGet().find((r) => r.path === "/my-classes");

    expect(ruta.handlers).toHaveLength(3);
    expect(ruta.handlers[0]).toBe(authMiddleware);
    expect(ruta.handlers[2]).toBe(classController.getMyClasses);
  });

  it("GET /:id/attendance pasa por auth + rol y apunta a getAttendance", () => {
    const ruta = rutasGet().find((r) => r.path === "/:id/attendance");

    expect(ruta, "falta GET /:id/attendance").toBeDefined();
    expect(ruta.handlers).toHaveLength(3);
    expect(ruta.handlers[0]).toBe(authMiddleware);
    expect(ruta.handlers[2]).toBe(attendanceController.getAttendance);
  });

  it("POST /:id/attendance sigue montada", () => {
    const post = router.stack.find(
      (capa) => capa.route && capa.route.path === "/:id/attendance" && capa.route.methods.post,
    );

    expect(post).toBeDefined();
    expect(post.route.stack[post.route.stack.length - 1].handle).toBe(attendanceController.registerAttendance);
  });
});
