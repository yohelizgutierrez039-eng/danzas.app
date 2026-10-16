import { createRequire } from "node:module";
import { afterEach, describe, expect, it, vi } from "vitest";

// Los modulos de src son CommonJS: se cargan con el require nativo.
const require = createRequire(import.meta.url);
const { enviarCorreoRecuperacion } = require("../src/services/email.service");

// ---------------------------------------------------------------------------
// Pruebas unitarias: el proveedor (fetch de Resend) se sustituye por un stub.
// ---------------------------------------------------------------------------
describe("enviarCorreoRecuperacion", () => {
  const LINK = "https://app.danzas.test/restablecer-password?token=abc.def.ghi";

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  const conProveedor = (fetchFalso) => {
    vi.stubEnv("RESEND_API_KEY", "clave-de-prueba");
    vi.stubEnv("EMAIL_FROM", "Danzas <no-responder@danzas.test>");
    vi.stubGlobal("fetch", fetchFalso);
  };

  it("envia un correo de recuperacion (no de verificacion) con el enlace, la vigencia y el aviso de ignorar", async () => {
    const fetchFalso = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: "m-1" }) });
    conProveedor(fetchFalso);

    await enviarCorreoRecuperacion("ana@danzas.app", LINK);

    expect(fetchFalso).toHaveBeenCalledTimes(1);
    const cuerpo = JSON.parse(fetchFalso.mock.calls[0][1].body);

    expect(cuerpo.to).toBe("ana@danzas.app");
    expect(cuerpo.subject).toBe("Recupera tu contraseña en Danzas.app");
    expect(cuerpo.subject).not.toMatch(/Verifica/i);
    expect(cuerpo.text).toContain(LINK);
    expect(cuerpo.text).toMatch(/30 minutos/);
    expect(cuerpo.text).toMatch(/ignorar este mensaje/);
  });

  it("sin proveedor configurado simula el envio con un log y no lanza", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("EMAIL_FROM", "");
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(enviarCorreoRecuperacion("ana@danzas.app", LINK)).resolves.toEqual({
      simulado: true,
    });
    expect(log.mock.calls[0][0]).toContain("Recupera tu contraseña en Danzas.app");
  });

  it("si el proveedor falla (red caida) NO lanza y registra el error", async () => {
    conProveedor(vi.fn().mockRejectedValue(new Error("fallo de red")));
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(enviarCorreoRecuperacion("ana@danzas.app", LINK)).resolves.toBeUndefined();
    expect(error).toHaveBeenCalledWith(
      "[notificaciones] No se pudo enviar el correo:",
      "fallo de red",
    );
  });

  it("si el proveedor responde con error HTTP NO lanza", async () => {
    conProveedor(
      vi.fn().mockResolvedValue({ ok: false, status: 500, text: async () => "boom" }),
    );
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(enviarCorreoRecuperacion("ana@danzas.app", LINK)).resolves.toBeUndefined();
  });

  it("sin destinatario no lanza (la validacion falla dentro del try)", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(enviarCorreoRecuperacion(undefined, LINK)).resolves.toBeUndefined();
  });
});
