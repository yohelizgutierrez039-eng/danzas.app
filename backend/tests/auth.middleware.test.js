import { createRequire } from "node:module";
import { describe, expect, it, vi } from "vitest";

// Los modulos de src son CommonJS: se cargan con el require nativo para compartir
// la misma instancia que usa el middleware, y asi poder espiar sus funciones.
const require = createRequire(import.meta.url);
const jwtUtil = require("../src/utils/jwt.util");
const userRepository = require("../src/repositories/user.repository");
const authMiddleware = require("../src/middleware/auth.middleware");
const { AppError } = require("../src/middleware/errorHandler");

// ---------------------------------------------------------------------------
// RF-007: la suspension corta el acceso aunque el JWT siga vigente.
// ---------------------------------------------------------------------------
describe("authMiddleware (RF-007: rechazar el token de usuarios suspendidos)", () => {
  const reqConToken = (token = "token-valido") => ({ headers: { authorization: `Bearer ${token}` } });
  const payload = { id: "user-1", rol: "estudiante" };

  it("se exporta directamente como funcion (las rutas lo importan asi)", () => {
    expect(typeof authMiddleware).toBe("function");
  });

  it("token valido y usuario activo: continua y toma id y rol de la base de datos", async () => {
    vi.spyOn(jwtUtil, "verifyToken").mockReturnValue(payload);
    const buscar = vi
      .spyOn(userRepository, "findById")
      .mockResolvedValue({ id: "user-1", rol: "instructor", estado: "activo" });
    const req = reqConToken();
    const next = vi.fn();

    await authMiddleware(req, {}, next);

    expect(buscar).toHaveBeenCalledWith("user-1");
    // El rol sale de la base de datos, no del token: un cambio de rol es inmediato.
    expect(req.user).toEqual({ id: "user-1", rol: "instructor" });
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it("usuario pendiente (aun sin aprobar) tampoco se bloquea: solo suspendido", async () => {
    vi.spyOn(jwtUtil, "verifyToken").mockReturnValue(payload);
    vi.spyOn(userRepository, "findById").mockResolvedValue({ id: "user-1", rol: "estudiante", estado: "pendiente" });
    const next = vi.fn();

    await authMiddleware(reqConToken(), {}, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("usuario suspendido con token vigente: 403 ACCOUNT_SUSPENDED", async () => {
    vi.spyOn(jwtUtil, "verifyToken").mockReturnValue(payload);
    vi.spyOn(userRepository, "findById").mockResolvedValue({ id: "user-1", rol: "estudiante", estado: "suspendido" });
    const req = reqConToken();
    const next = vi.fn();

    await authMiddleware(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({ statusCode: 403, code: "ACCOUNT_SUSPENDED" });
    expect(req.user).toBeUndefined();
  });

  it("usuario que ya no existe: 401 UNAUTHORIZED", async () => {
    vi.spyOn(jwtUtil, "verifyToken").mockReturnValue(payload);
    vi.spyOn(userRepository, "findById").mockResolvedValue(null);
    const next = vi.fn();

    await authMiddleware(reqConToken(), {}, next);

    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({ statusCode: 401, code: "UNAUTHORIZED" });
  });

  it("token invalido o expirado: 401 UNAUTHORIZED y no consulta la base de datos", async () => {
    vi.spyOn(jwtUtil, "verifyToken").mockImplementation(() => {
      throw new Error("jwt malformed");
    });
    const buscar = vi.spyOn(userRepository, "findById");
    const next = vi.fn();

    await authMiddleware(reqConToken("basura"), {}, next);

    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 401, code: "UNAUTHORIZED" });
    expect(buscar).not.toHaveBeenCalled();
  });

  // Solo se aceptan tokens de sesion { id, rol }. El token de recuperacion de contrasena
  // ({ id, tipo }) esta firmado con el mismo secreto y no debe autenticar nada.
  it("token de recuperacion de contrasena: 401 UNAUTHORIZED y no consulta la base de datos", async () => {
    vi.spyOn(jwtUtil, "verifyToken").mockReturnValue({ id: "user-1", tipo: "recuperacion_password" });
    const buscar = vi.spyOn(userRepository, "findById").mockResolvedValue({ id: "user-1", rol: "admin", estado: "activo" });
    const req = reqConToken();
    const next = vi.fn();

    await authMiddleware(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 401, code: "UNAUTHORIZED" });
    expect(buscar).not.toHaveBeenCalled();
    expect(req.user).toBeUndefined();
  });

  it("cualquier token con tipo es rechazado, aunque traiga rol", async () => {
    vi.spyOn(jwtUtil, "verifyToken").mockReturnValue({ id: "user-1", rol: "admin", tipo: "otro" });
    const buscar = vi.spyOn(userRepository, "findById");
    const next = vi.fn();

    await authMiddleware(reqConToken(), {}, next);

    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 401, code: "UNAUTHORIZED" });
    expect(buscar).not.toHaveBeenCalled();
  });

  it("token sin rol: 401 UNAUTHORIZED y no consulta la base de datos", async () => {
    vi.spyOn(jwtUtil, "verifyToken").mockReturnValue({ id: "user-1" });
    const buscar = vi.spyOn(userRepository, "findById");
    const next = vi.fn();

    await authMiddleware(reqConToken(), {}, next);

    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 401, code: "UNAUTHORIZED" });
    expect(buscar).not.toHaveBeenCalled();
  });

  // Con firma real (sin espiar verifyToken): los tokens que emite auth.service.
  it("firma real: el token de login { id, rol } pasa y el de recuperacion { id, tipo } no", async () => {
    vi.stubEnv("JWT_SECRET", "secreto-de-prueba");
    vi.stubEnv("JWT_EXPIRES_IN", "1h");

    try {
      vi.spyOn(userRepository, "findById").mockResolvedValue({ id: "user-1", rol: "padre", estado: "activo" });

      const sesion = reqConToken(jwtUtil.signToken({ id: "user-1", rol: "padre" }));
      const recuperacion = reqConToken(jwtUtil.signToken({ id: "user-1", tipo: "recuperacion_password" }, "30m"));
      const nextSesion = vi.fn();
      const nextRecuperacion = vi.fn();

      await authMiddleware(sesion, {}, nextSesion);
      await authMiddleware(recuperacion, {}, nextRecuperacion);

      expect(nextSesion).toHaveBeenCalledWith();
      expect(sesion.user).toEqual({ id: "user-1", rol: "padre" });
      expect(nextRecuperacion.mock.calls[0][0]).toMatchObject({ statusCode: 401, code: "UNAUTHORIZED" });
      expect(recuperacion.user).toBeUndefined();
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it.each([
    ["sin cabecera Authorization", {}],
    ["esquema distinto de Bearer", { authorization: "Basic abc" }],
  ])("%s: 401 UNAUTHORIZED", async (_caso, headers) => {
    const next = vi.fn();

    await authMiddleware({ headers }, {}, next);

    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 401, code: "UNAUTHORIZED" });
  });

  it("si falla la consulta a la base de datos, el error va a next (no queda colgado)", async () => {
    vi.spyOn(jwtUtil, "verifyToken").mockReturnValue(payload);
    const fallo = new Error("db caida");
    vi.spyOn(userRepository, "findById").mockRejectedValue(fallo);
    const next = vi.fn();

    await authMiddleware(reqConToken(), {}, next);

    expect(next).toHaveBeenCalledWith(fallo);
  });
});
