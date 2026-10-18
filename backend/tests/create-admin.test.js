import { createRequire } from "node:module";
import { describe, expect, it, vi } from "vitest";

// Los modulos de scripts son CommonJS: se cargan con el require nativo.
// El script solo se ejecuta como CLI cuando es el modulo principal, asi que
// importarlo aqui no toca la base de datos.
const require = createRequire(import.meta.url);
const { validarDatosAdmin, crearAdmin, PASSWORD_MIN_LENGTH } = require("../scripts/create-admin");

const PASSWORD_VALIDA = "una-clave-larga-123";

// Cliente Prisma falso con solo lo que usa el script.
const crearPrisma = (usuarioExistente = null) => ({
  usuario: {
    findUnique: vi.fn().mockResolvedValue(usuarioExistente),
    create: vi.fn().mockResolvedValue({ id: "nuevo" }),
    update: vi.fn().mockResolvedValue({ id: "existente" }),
  },
});

const hashFalso = vi.fn(async (texto) => `hash(${texto})`);

describe("validarDatosAdmin", () => {
  it("acepta datos validos y recorta correo y nombre", () => {
    const datos = validarDatosAdmin({
      correo: "  admin@danzas.app ",
      password: PASSWORD_VALIDA,
      nombre: "  Ana Admin ",
    });

    expect(datos).toEqual({
      correo: "admin@danzas.app",
      password: PASSWORD_VALIDA,
      nombre: "Ana Admin",
      ciudad: "Sin definir",
    });
  });

  it("usa un nombre por defecto cuando no se indica", () => {
    const datos = validarDatosAdmin({ correo: "admin@danzas.app", password: PASSWORD_VALIDA });

    expect(datos.nombre).toBe("Administrador");
  });

  it("rechaza un correo vacio o con formato invalido", () => {
    expect(() => validarDatosAdmin({ correo: "", password: PASSWORD_VALIDA })).toThrow(/ADMIN_EMAIL/);
    expect(() => validarDatosAdmin({ correo: "no-es-correo", password: PASSWORD_VALIDA })).toThrow(
      /ADMIN_EMAIL/,
    );
    expect(() => validarDatosAdmin({ password: PASSWORD_VALIDA })).toThrow(/ADMIN_EMAIL/);
  });

  it("rechaza una contrasena vacia, solo espacios o menor al minimo", () => {
    expect(() => validarDatosAdmin({ correo: "a@b.co", password: "" })).toThrow(/ADMIN_PASSWORD/);
    expect(() => validarDatosAdmin({ correo: "a@b.co", password: "          " })).toThrow(
      /ADMIN_PASSWORD/,
    );
    expect(() =>
      validarDatosAdmin({ correo: "a@b.co", password: "x".repeat(PASSWORD_MIN_LENGTH - 1) }),
    ).toThrow(/ADMIN_PASSWORD/);
    expect(() => validarDatosAdmin({ correo: "a@b.co" })).toThrow(/ADMIN_PASSWORD/);
  });

  it("acepta una contrasena de exactamente el minimo", () => {
    expect(() =>
      validarDatosAdmin({ correo: "a@b.co", password: "x".repeat(PASSWORD_MIN_LENGTH) }),
    ).not.toThrow();
  });

  it("el mensaje de error nunca incluye la contrasena", () => {
    try {
      validarDatosAdmin({ correo: "a@b.co", password: "corta" });
    } catch (error) {
      expect(error.message).not.toContain("corta");
    }
  });
});

describe("crearAdmin", () => {
  it("crea un admin activo con la contrasena hasheada cuando el correo no existe", async () => {
    const prisma = crearPrisma(null);

    const resultado = await crearAdmin({
      prisma,
      hashPassword: hashFalso,
      correo: "admin@danzas.app",
      password: PASSWORD_VALIDA,
      nombre: "Ana Admin",
      ciudad: "Sin definir",
    });

    expect(prisma.usuario.findUnique).toHaveBeenCalledWith({ where: { correo: "admin@danzas.app" } });
    expect(prisma.usuario.create).toHaveBeenCalledWith({
      data: {
        nombre: "Ana Admin",
        correo: "admin@danzas.app",
        passwordHash: `hash(${PASSWORD_VALIDA})`,
        rol: "admin",
        ciudad: "Sin definir",
        estado: "activo",
      },
    });
    expect(prisma.usuario.update).not.toHaveBeenCalled();
    expect(resultado).toEqual({ accion: "creado", dryRun: false });
  });

  it("si ya es admin, solo actualiza la contrasena y desbloquea la cuenta (idempotente)", async () => {
    const prisma = crearPrisma({ id: "u-1", rol: "admin" });

    const resultado = await crearAdmin({
      prisma,
      hashPassword: hashFalso,
      correo: "admin@danzas.app",
      password: PASSWORD_VALIDA,
      nombre: "Ana Admin",
      ciudad: "Sin definir",
    });

    expect(prisma.usuario.create).not.toHaveBeenCalled();
    expect(prisma.usuario.update).toHaveBeenCalledWith({
      where: { id: "u-1" },
      data: {
        passwordHash: `hash(${PASSWORD_VALIDA})`,
        estado: "activo",
        intentosFallidos: 0,
        bloqueadoHasta: null,
      },
    });
    expect(resultado).toEqual({ accion: "actualizado", dryRun: false });
  });

  it("se niega a convertir en admin a un usuario existente con otro rol", async () => {
    const prisma = crearPrisma({ id: "u-2", rol: "estudiante" });

    await expect(
      crearAdmin({
        prisma,
        hashPassword: hashFalso,
        correo: "alguien@danzas.app",
        password: PASSWORD_VALIDA,
        nombre: "Alguien",
        ciudad: "Sin definir",
      }),
    ).rejects.toThrow(/estudiante/);

    expect(prisma.usuario.create).not.toHaveBeenCalled();
    expect(prisma.usuario.update).not.toHaveBeenCalled();
  });

  it("--dry-run informa que haria pero no escribe ni calcula el hash", async () => {
    const hash = vi.fn();
    const prismaNuevo = crearPrisma(null);
    const prismaExistente = crearPrisma({ id: "u-1", rol: "admin" });
    const datos = {
      hashPassword: hash,
      correo: "admin@danzas.app",
      password: PASSWORD_VALIDA,
      nombre: "Ana Admin",
      ciudad: "Sin definir",
      dryRun: true,
    };

    expect(await crearAdmin({ ...datos, prisma: prismaNuevo })).toEqual({
      accion: "creado",
      dryRun: true,
    });
    expect(await crearAdmin({ ...datos, prisma: prismaExistente })).toEqual({
      accion: "actualizado",
      dryRun: true,
    });

    expect(prismaNuevo.usuario.create).not.toHaveBeenCalled();
    expect(prismaExistente.usuario.update).not.toHaveBeenCalled();
    expect(hash).not.toHaveBeenCalled();
  });
});
