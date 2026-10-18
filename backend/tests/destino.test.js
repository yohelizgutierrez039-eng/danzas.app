import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

// Los modulos de scripts son CommonJS: se cargan con el require nativo.
const require = createRequire(import.meta.url);
const { describirDestino, formatearDestino } = require("../scripts/lib/destino");

describe("describirDestino", () => {
  it("devuelve host, puerto y base SIN usuario ni contrasena", () => {
    const destino = describirDestino(
      "mysql://avnadmin:Sup3rSecreta!@mysql-demo.aivencloud.com:12345/defaultdb?sslaccept=accept_invalid_certs",
    );

    expect(destino).toEqual({ host: "mysql-demo.aivencloud.com", puerto: "12345", base: "defaultdb" });
    expect(JSON.stringify(destino)).not.toContain("avnadmin");
    expect(JSON.stringify(destino)).not.toContain("Sup3rSecreta");
  });

  it("usa 3306 cuando la URL no trae puerto", () => {
    expect(describirDestino("mysql://u:p@localhost/danzas_app").puerto).toBe("3306");
  });

  it("devuelve null sin lanzar si no se puede parsear", () => {
    expect(describirDestino("esto no es una url")).toBeNull();
    expect(describirDestino(undefined)).toBeNull();
  });

  it("devuelve null (y no deja ver parte de la clave) cuando la contrasena rompe el parseo", () => {
    // new URL interpreta "u" como host y "123" como puerto: habria que mostrar basura de la clave.
    expect(describirDestino("mysql://u:123/xyz@host:3306/db")).toBeNull();
  });

  it("devuelve null si no hay usuario en la URL", () => {
    expect(describirDestino("mysql://host:3306/db")).toBeNull();
  });

  it("devuelve null si la ruta contiene una arroba", () => {
    expect(describirDestino("mysql://u:p@host:3306/db@otro")).toBeNull();
  });
});

describe("formatearDestino", () => {
  it("arma host:puerto y la base sin credenciales", () => {
    expect(formatearDestino({ host: "h", puerto: "3306", base: "db" })).toBe("h:3306 (base: db)");
  });

  it("indica 'sin nombre' cuando no hay base", () => {
    expect(formatearDestino({ host: "h", puerto: "3306", base: "" })).toBe("h:3306 (base: sin nombre)");
  });
});
