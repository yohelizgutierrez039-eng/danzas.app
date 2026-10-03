import { createRequire } from "node:module";
import { describe, expect, it, vi } from "vitest";

// Los modulos de src son CommonJS: se cargan con el require nativo para compartir
// la misma instancia que usa el service, y asi poder espiar sus funciones.
const require = createRequire(import.meta.url);
const userRepository = require("../src/repositories/user.repository");
const { registrar } = require("../src/services/auth.service");
const { AppError } = require("../src/middleware/errorHandler");

// ---------------------------------------------------------------------------
// Pruebas unitarias: el repositorio se sustituye por stubs, sin base de datos.
// ---------------------------------------------------------------------------
describe("registrar (RF-001: solo roles de auto-registro)", () => {
  const datosValidos = {
    nombre: "Ana Pérez",
    correo: "ana@danzas.app",
    contraseña: "Clave1234",
    ciudad: "Barranquilla",
  };

  const stubRepositorio = () => {
    vi.spyOn(userRepository, "findByEmail").mockResolvedValue(null);
    return vi
      .spyOn(userRepository, "create")
      .mockImplementation(async (datos) => ({ id: "usuario-1", ...datos }));
  };

  it.each(["estudiante", "padre", "instructor"])("acepta el rol %s", async (rol) => {
    const crear = stubRepositorio();

    const usuario = await registrar({ ...datosValidos, rol });

    expect(crear).toHaveBeenCalledTimes(1);
    expect(crear.mock.calls[0][0].rol).toBe(rol);
    expect(usuario.rol).toBe(rol);
  });

  it.each([
    ["admin"],
    ["Admin"],
    ["student"],
    ["parent"],
    [""],
    [undefined],
    [null],
    [["admin"]],
    [{ toString: () => "admin" }],
  ])("rechaza el rol %j con 400 INVALID_ROLE y no crea el usuario", async (rol) => {
    const crear = stubRepositorio();

    const intento = registrar({ ...datosValidos, rol });

    await expect(intento).rejects.toBeInstanceOf(AppError);
    await expect(intento).rejects.toMatchObject({ statusCode: 400, code: "INVALID_ROLE" });
    expect(crear).not.toHaveBeenCalled();
  });
});
