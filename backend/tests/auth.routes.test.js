import { createRequire } from "node:module";
import { afterEach, describe, expect, it, vi } from "vitest";

// Los modulos de src son CommonJS: se cargan con el require nativo para compartir
// la misma instancia que usa el controller, y asi poder espiar sus funciones.
const require = createRequire(import.meta.url);
const authService = require("../src/services/auth.service");
const authController = require("../src/controllers/auth.controller");
const router = require("../src/routes/auth.routes");

// Rutas POST montadas en el router, con el handler final de cada una.
const rutasPost = () =>
  router.stack
    .filter((capa) => capa.route && capa.route.methods.post)
    .map((capa) => ({
      path: capa.route.path,
      handler: capa.route.stack[capa.route.stack.length - 1].handle,
    }));

describe("auth.routes (RF-003: recuperacion de contrasena)", () => {
  it.each([
    ["/register", "register"],
    ["/login", "login"],
    ["/forgot-password", "recoverPassword"],
    ["/reset-password", "resetPassword"],
  ])("POST %s esta montada y apunta a authController.%s", (path, nombreHandler) => {
    const ruta = rutasPost().find((r) => r.path === path);

    expect(ruta, `falta la ruta POST ${path}`).toBeDefined();
    expect(ruta.handler).toBe(authController[nombreHandler]);
  });

  // Contrato con el frontend (frontend/src/services/auth.service.js):
  // forgot-password envia { correo } y reset-password envia { token, password }.
  it("forgot-password lee req.body.correo y lo pasa a recuperarPassword", async () => {
    const recuperar = vi.spyOn(authService, "recuperarPassword").mockResolvedValue({ message: "ok" });
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await authController.recoverPassword({ body: { correo: "a@b.co" } }, res, vi.fn());

    expect(recuperar).toHaveBeenCalledWith("a@b.co");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("reset-password lee req.body.token y req.body.password", async () => {
    const restablecer = vi.spyOn(authService, "restablecerPassword").mockResolvedValue({ message: "ok" });
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await authController.resetPassword({ body: { token: "tkn", password: "Nueva1234" } }, res, vi.fn());

    expect(restablecer).toHaveBeenCalledWith("tkn", "Nueva1234");
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
