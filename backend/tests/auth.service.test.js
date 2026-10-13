import { createRequire } from "node:module";
import bcrypt from "bcrypt";
import { afterEach, describe, expect, it, vi } from "vitest";

// Los modulos de src son CommonJS: se cargan con el require nativo para compartir
// la misma instancia que usa el service, y asi poder espiar sus funciones.
const require = createRequire(import.meta.url);
const userRepository = require("../src/repositories/user.repository");
const jwtUtil = require("../src/utils/jwt.util");
const { registrar, login } = require("../src/services/auth.service");
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

describe("registrar (RF-006: solicitud de academia pendiente para instructores)", () => {
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

  it("un instructor con nombreAcademia crea el usuario junto con una solicitud pendiente", async () => {
    const crear = stubRepositorio();

    await registrar({ ...datosValidos, rol: "instructor", nombreAcademia: "Academia Ritmo" });

    expect(crear).toHaveBeenCalledTimes(1);
    expect(crear.mock.calls[0][0].solicitudAcademia).toEqual({ nombreAcademia: "Academia Ritmo" });
  });

  it("recorta los espacios del nombreAcademia", async () => {
    const crear = stubRepositorio();

    await registrar({ ...datosValidos, rol: "instructor", nombreAcademia: "  Academia Ritmo  " });

    expect(crear.mock.calls[0][0].solicitudAcademia).toEqual({ nombreAcademia: "Academia Ritmo" });
  });

  it.each([
    ["sin el campo", undefined],
    ["null", null],
    ["vacio", ""],
    ["solo espacios", "   "],
  ])("un instructor con nombreAcademia %s es independiente (nombreAcademia null)", async (_caso, nombreAcademia) => {
    const crear = stubRepositorio();

    await registrar({ ...datosValidos, rol: "instructor", nombreAcademia });

    expect(crear.mock.calls[0][0].solicitudAcademia).toEqual({ nombreAcademia: null });
  });

  it("acepta un nombreAcademia de exactamente 150 caracteres", async () => {
    const crear = stubRepositorio();
    const nombreAcademia = "a".repeat(150);

    await registrar({ ...datosValidos, rol: "instructor", nombreAcademia });

    expect(crear.mock.calls[0][0].solicitudAcademia).toEqual({ nombreAcademia });
  });

  it.each(["estudiante", "padre"])(
    "el rol %s no crea solicitud de academia aunque envie nombreAcademia",
    async (rol) => {
      const crear = stubRepositorio();

      await registrar({ ...datosValidos, rol, nombreAcademia: "Academia Ritmo" });

      expect(crear).toHaveBeenCalledTimes(1);
      expect(crear.mock.calls[0][0].solicitudAcademia).toBeUndefined();
    },
  );

  it.each([
    ["numero", 123],
    ["objeto", { nombre: "x" }],
    ["arreglo", ["Academia"]],
    ["booleano", true],
    ["texto de 151 caracteres", "a".repeat(151)],
  ])(
    "un nombreAcademia invalido (%s) devuelve 400 INVALID_ACADEMY_NAME y no crea el usuario",
    async (_caso, nombreAcademia) => {
      const crear = stubRepositorio();

      const intento = registrar({ ...datosValidos, rol: "instructor", nombreAcademia });

      await expect(intento).rejects.toBeInstanceOf(AppError);
      await expect(intento).rejects.toMatchObject({ statusCode: 400, code: "INVALID_ACADEMY_NAME" });
      expect(crear).not.toHaveBeenCalled();
    },
  );

  it("devuelve el usuario creado (misma forma que espera el controlador)", async () => {
    stubRepositorio();

    const usuario = await registrar({ ...datosValidos, rol: "instructor" });

    expect(usuario).toMatchObject({ id: "usuario-1", rol: "instructor", correo: "ana@danzas.app" });
  });
});

describe("userRepository.create (usuario y solicitud en una sola escritura atomica)", () => {
  const prisma = require("../src/config/prisma");
  const base = {
    nombre: "Ana",
    correo: "ana@danzas.app",
    passwordHash: "hash",
    ciudad: "Barranquilla",
  };

  it("con solicitudAcademia anida la creacion de una solicitud pendiente", async () => {
    const crear = vi.spyOn(prisma.usuario, "create").mockResolvedValue({ id: "usuario-1" });

    await userRepository.create({
      ...base,
      rol: "instructor",
      solicitudAcademia: { nombreAcademia: "Academia Ritmo" },
    });

    expect(crear).toHaveBeenCalledWith({
      data: {
        ...base,
        rol: "instructor",
        solicitudes: { create: { nombreAcademia: "Academia Ritmo", estado: "pendiente" } },
      },
    });
  });

  it("un instructor independiente crea la solicitud con nombreAcademia null", async () => {
    const crear = vi.spyOn(prisma.usuario, "create").mockResolvedValue({ id: "usuario-1" });

    await userRepository.create({
      ...base,
      rol: "instructor",
      solicitudAcademia: { nombreAcademia: null },
    });

    expect(crear.mock.calls[0][0].data.solicitudes).toEqual({
      create: { nombreAcademia: null, estado: "pendiente" },
    });
  });

  it("sin solicitudAcademia no anida nada (estudiante / padre)", async () => {
    const crear = vi.spyOn(prisma.usuario, "create").mockResolvedValue({ id: "usuario-1" });

    await userRepository.create({ ...base, rol: "estudiante" });

    expect(crear.mock.calls[0][0].data).not.toHaveProperty("solicitudes");
  });
});

describe("recuperarPassword (correo de recuperacion y enlace configurable)", () => {
  const emailService = require("../src/services/email.service");
  const { recuperarPassword } = require("../src/services/auth.service");

  const stubs = (usuario = { id: "usuario-1", correo: "ana@danzas.app" }) => {
    vi.spyOn(userRepository, "findByEmail").mockResolvedValue(usuario);
    vi.spyOn(jwtUtil, "signToken").mockReturnValue("token-falso");
    return {
      recuperacion: vi.spyOn(emailService, "enviarCorreoRecuperacion").mockResolvedValue(undefined),
      verificacion: vi.spyOn(emailService, "enviarCorreoVerificacion").mockResolvedValue(undefined),
    };
  };

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("usa el correo de recuperacion (no el de verificacion) y firma un token de 30 minutos", async () => {
    const { recuperacion, verificacion } = stubs();
    vi.stubEnv("FRONTEND_URL", "https://app.danzas.test");

    await recuperarPassword("ana@danzas.app");

    expect(verificacion).not.toHaveBeenCalled();
    expect(recuperacion).toHaveBeenCalledWith(
      "ana@danzas.app",
      "https://app.danzas.test/restablecer-password?token=token-falso",
    );
    expect(jwtUtil.signToken).toHaveBeenCalledWith(
      { id: "usuario-1", tipo: "recuperacion_password" },
      "30m",
    );
  });

  it("quita la barra final de FRONTEND_URL", async () => {
    const { recuperacion } = stubs();
    vi.stubEnv("FRONTEND_URL", "https://app.danzas.test///");

    await recuperarPassword("ana@danzas.app");

    expect(recuperacion.mock.calls[0][1]).toBe(
      "https://app.danzas.test/restablecer-password?token=token-falso",
    );
  });

  it.each([["sin definir", undefined], ["vacia", ""]])(
    "con FRONTEND_URL %s cae a http://localhost:5173",
    async (_caso, valor) => {
      const { recuperacion } = stubs();
      vi.stubEnv("FRONTEND_URL", valor ?? "");

      await recuperarPassword("ana@danzas.app");

      expect(recuperacion.mock.calls[0][1]).toBe(
        "http://localhost:5173/restablecer-password?token=token-falso",
      );
    },
  );

  it("con un correo no registrado responde igual y no envia nada", async () => {
    const { recuperacion } = stubs(null);

    const resultado = await recuperarPassword("nadie@danzas.app");

    expect(resultado.message).toMatch(/Si el correo está registrado/);
    expect(recuperacion).not.toHaveBeenCalled();
  });
});

describe("login (RF-002 / RF-007: cuentas suspendidas)", () => {
  const CONTRASENA = "Clave1234";
  // Costo bajo: solo importa que bcrypt.compare funcione de verdad en el test.
  const passwordHash = bcrypt.hashSync(CONTRASENA, 4);

  const usuario = (estado, extra = {}) => ({
    id: "usuario-1",
    correo: "usuario@danzas.app",
    rol: "instructor",
    estado,
    passwordHash,
    intentosFallidos: 0,
    bloqueadoHasta: null,
    ...extra,
  });

  const stubs = (user) => {
    vi.spyOn(userRepository, "findByEmail").mockResolvedValue(user);
    return {
      actualizar: vi.spyOn(userRepository, "update").mockResolvedValue({}),
      firmar: vi.spyOn(jwtUtil, "signToken").mockReturnValue("token-falso"),
    };
  };

  it("un usuario suspendido con la contrasena correcta recibe 403 ACCOUNT_SUSPENDED y ningun token", async () => {
    const { firmar } = stubs(usuario("suspendido"));

    const intento = login({ correo: "usuario@danzas.app", contraseña: CONTRASENA });

    await expect(intento).rejects.toBeInstanceOf(AppError);
    await expect(intento).rejects.toMatchObject({ statusCode: 403, code: "ACCOUNT_SUSPENDED" });
    expect(firmar).not.toHaveBeenCalled();
  });

  it("un usuario suspendido con la contrasena incorrecta recibe el error normal de credenciales (no revela el estado)", async () => {
    const { actualizar, firmar } = stubs(usuario("suspendido"));

    const intento = login({ correo: "usuario@danzas.app", contraseña: "Incorrecta99" });

    await expect(intento).rejects.toMatchObject({ statusCode: 401, code: "INVALID_CREDENTIALS" });
    expect(firmar).not.toHaveBeenCalled();
    // El contador de intentos fallidos sigue funcionando igual que antes.
    expect(actualizar).toHaveBeenCalledWith("usuario-1", { intentosFallidos: 1 });
  });

  it("un usuario suspendido con el 5to intento fallido sigue recibiendo el bloqueo temporal", async () => {
    stubs(usuario("suspendido", { intentosFallidos: 4 }));

    await expect(
      login({ correo: "usuario@danzas.app", contraseña: "Incorrecta99" }),
    ).rejects.toMatchObject({ statusCode: 423, code: "ACCOUNT_LOCKED" });
  });

  it.each(["pendiente", "activo"])(
    "un usuario %s con la contrasena correcta inicia sesion y recibe token",
    async (estado) => {
      const { actualizar, firmar } = stubs(usuario(estado));

      const resultado = await login({ correo: "usuario@danzas.app", contraseña: CONTRASENA });

      expect(resultado.token).toBe("token-falso");
      expect(resultado.user.estado).toBe(estado);
      expect(firmar).toHaveBeenCalledWith({ id: "usuario-1", rol: "instructor" });
      expect(actualizar).toHaveBeenCalledWith("usuario-1", {
        intentosFallidos: 0,
        bloqueadoHasta: null,
      });
    },
  );
});
