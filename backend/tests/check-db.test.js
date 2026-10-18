import { createRequire } from "node:module";
import { describe, expect, it, vi } from "vitest";

// Los modulos de scripts son CommonJS: se cargan con el require nativo.
// El script solo se ejecuta como CLI cuando es el modulo principal, asi que
// importarlo aqui no toca la base de datos.
const require = createRequire(import.meta.url);
const { describirDestino, interpretarSsl, pistasParaError, verificarConexion } = require(
  "../scripts/check-db",
);

describe("describirDestino", () => {
  it("devuelve host, puerto y base SIN usuario ni contrasena", () => {
    const destino = describirDestino(
      "mysql://avnadmin:Sup3rSecreta!@mysql-demo.aivencloud.com:12345/defaultdb?ssl-mode=REQUIRED",
    );

    expect(destino).toEqual({ host: "mysql-demo.aivencloud.com", puerto: "12345", base: "defaultdb" });
    expect(JSON.stringify(destino)).not.toContain("avnadmin");
    expect(JSON.stringify(destino)).not.toContain("Sup3rSecreta");
  });

  it("usa 3306 cuando la URL no trae puerto", () => {
    expect(describirDestino("mysql://u:p@localhost/danzas_app").puerto).toBe("3306");
  });

  it("devuelve null sin lanzar (ni filtrar la URL) si no se puede parsear", () => {
    expect(describirDestino("esto no es una url")).toBeNull();
    expect(describirDestino(undefined)).toBeNull();
  });
});

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

  it("sugiere las opciones de TLS ante errores de certificado o TLS", () => {
    const pistas = pistasParaError({ code: "P1011", message: "Error opening a TLS connection" }).join(" ");

    expect(pistas).toMatch(/sslaccept/);
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
