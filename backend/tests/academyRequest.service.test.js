import { createRequire } from "node:module";
import { afterEach, describe, expect, it, vi } from "vitest";

// Los modulos de src son CommonJS: se cargan con el require nativo para compartir
// la misma instancia que usa el service, y asi poder espiar sus funciones.
const require = createRequire(import.meta.url);
const academyRequestRepository = require("../src/repositories/academyRequest.repository");
const { listarPendientes, obtenerSolicitud } = require("../src/services/academyRequest.service");
const { AppError } = require("../src/middleware/errorHandler");

const solicitud = (estado) => ({
  id: `sol-${estado}`,
  instructorId: "instructor-1",
  nombreAcademia: "Academia Demo",
  estado,
  instructor: {
    id: "instructor-1",
    nombre: "Instructor Demo",
    correo: "instructor@danzas.app",
    ciudad: "Barranquilla",
  },
});

describe("solicitudes de academia (vista de administrador)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("obtenerSolicitud", () => {
    it.each(["pendiente", "aprobada", "rechazada"])(
      "devuelve la solicitud en estado %s con los datos del instructor",
      async (estado) => {
        const encontrada = solicitud(estado);
        const findById = vi
          .spyOn(academyRequestRepository, "findById")
          .mockResolvedValue(encontrada);

        const resultado = await obtenerSolicitud(encontrada.id);

        expect(resultado).toBe(encontrada);
        expect(findById).toHaveBeenCalledWith(encontrada.id);
      }
    );

    it("lanza 404 REQUEST_NOT_FOUND si la solicitud no existe", async () => {
      vi.spyOn(academyRequestRepository, "findById").mockResolvedValue(null);

      const error = await obtenerSolicitud("inexistente").catch((e) => e);

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe("Solicitud no encontrada.");
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe("REQUEST_NOT_FOUND");
    });
  });

  describe("listarPendientes", () => {
    it("devuelve lo que entrega el repositorio", async () => {
      const pendientes = [solicitud("pendiente")];
      vi.spyOn(academyRequestRepository, "findPending").mockResolvedValue(pendientes);

      expect(await listarPendientes()).toBe(pendientes);
    });
  });
});
