import { createRequire } from "node:module";
import { describe, expect, it, vi } from "vitest";

// Los modulos de scripts son CommonJS: se cargan con el require nativo.
// El script solo se ejecuta como CLI cuando es el modulo principal, asi que
// importarlo aqui no toca la base de datos.
const require = createRequire(import.meta.url);
const { interpretarSsl, pistasParaError, verificarConexion, desconectarConLimite } = require(
  "../scripts/check-db",
);

describe("interpretarSsl", () => {
  it("reporta cifrado cuando Ssl_cipher trae un valor", () => {
    expect(interpretarSsl([{ Variable_name: "Ssl_cipher", Value: "TLS_AES_256_GCM_SHA384" }])).toEqual({
      cifrada: true,
      cifrado: "TLS_AES_256_GCM_SHA384",
    });
  });

  it("reporta sin cifrar cuando Ssl_cipher viene vacio o no existe", () => {
    expect(interpretarSsl([{ Variable_name: "Ssl_cipher", Value: "" }]).cifrada).toBe(false);
    expect(interpretarSsl([]).cifrada).toBe(false);
  });
});

describe("pistasParaError", () => {
  it("sugiere revisar host/puerto y si el servicio esta encendido ante P1001", () => {
    const pistas = pistasParaError({ code: "P1001", message: "Can't reach database server" });

    expect(pistas.join(" ")).toMatch(/apagado|encendido/i);
  });

  it("sugiere revisar usuario y contrasena ante P1000 o 'Access denied'", () => {
    expect(pistasParaError({ code: "P1000", message: "" }).join(" ")).toMatch(/usuario|contraseña/i);
    expect(pistasParaError({ message: "Access denied for user" }).join(" ")).toMatch(/usuario|contraseña/i);
  });

  it("sugiere sslaccept=accept_invalid_certs y la opcion estricta ante errores de TLS", () => {
    const pistas = pistasParaError({ code: "P1011", message: "Error opening a TLS connection" }).join(" ");

    expect(pistas).toMatch(/sslaccept=accept_invalid_certs/);
    expect(pistas).toMatch(/sslaccept=strict/);
  });

  it("no afirma que accept_invalid_certs sea el valor por defecto ni recomienda ssl-mode", () => {
    const pistas = pistasParaError({ code: "P1011", message: "TLS" }).join(" ");

    expect(pistas).not.toMatch(/por defecto/i);
    expect(pistas).toMatch(/ssl-mode/); // solo para avisar que Prisma lo ignora
    expect(pistas).toMatch(/ignor/i);
  });

  it("sugiere aumentar connect_timeout ante un timeout", () => {
    expect(pistasParaError({ code: "P1002", message: "timed out" }).join(" ")).toMatch(/connect_timeout/);
  });

  it("siempre devuelve al menos una pista generica", () => {
    expect(pistasParaError(new Error("algo raro")).length).toBeGreaterThan(0);
  });
});

describe("verificarConexion", () => {
  it("ejecuta SELECT 1 y SHOW STATUS y devuelve el resumen", async () => {
    const prisma = {
      $queryRaw: vi
        .fn()
        .mockResolvedValueOnce([{ resultado: 1n }])
        .mockResolvedValueOnce([{ Variable_name: "Ssl_cipher", Value: "TLS_AES_256_GCM_SHA384" }]),
    };

    const resultado = await verificarConexion(prisma);

    expect(prisma.$queryRaw).toHaveBeenCalledTimes(2);
    expect(resultado).toEqual({ ok: true, ssl: { cifrada: true, cifrado: "TLS_AES_256_GCM_SHA384" } });
  });

  it("propaga el error de la base para que el CLI lo explique", async () => {
    const prisma = { $queryRaw: vi.fn().mockRejectedValue(new Error("boom")) };

    await expect(verificarConexion(prisma)).rejects.toThrow("boom");
  });
});

describe("desconectarConLimite", () => {
  it("resuelve en cuanto $disconnect termina", async () => {
    const prisma = { $disconnect: vi.fn().mockResolvedValue(undefined) };

    await expect(desconectarConLimite(prisma, 1000)).resolves.toBeUndefined();
    expect(prisma.$disconnect).toHaveBeenCalledTimes(1);
  });

  it("no se cuelga si $disconnect nunca termina (consulta en vuelo tras un timeout)", async () => {
    const prisma = { $disconnect: vi.fn(() => new Promise(() => {})) };

    const inicio = Date.now();
    await desconectarConLimite(prisma, 30);

    expect(Date.now() - inicio).toBeLessThan(1000);
  });

  it("no lanza si $disconnect falla", async () => {
    const prisma = { $disconnect: vi.fn().mockRejectedValue(new Error("x")) };

    await expect(desconectarConLimite(prisma, 1000)).resolves.toBeUndefined();
  });
});
