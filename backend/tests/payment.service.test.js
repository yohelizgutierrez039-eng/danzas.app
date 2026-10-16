import { createRequire } from "node:module";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Los modulos de src son CommonJS: se cargan con el require nativo para compartir
// la misma instancia que usan los services, y asi poder espiar sus funciones.
const require = createRequire(import.meta.url);
const prisma = require("../src/config/prisma");
const enrollmentRepository = require("../src/repositories/enrollment.repository");
const paymentRepository = require("../src/repositories/payment.repository");
const userRepository = require("../src/repositories/user.repository");
const notificationEmitter = require("../src/events/notificationEmitter");
const { paymentProvider } = require("../src/services/payment/paymentProvider");
const { simularPago } = require("../src/services/payment.service");
const { cancelarInscripcion } = require("../src/services/enrollment.service");
const { AppError } = require("../src/middleware/errorHandler");

// Prisma entrega las columnas TIME como Date en UTC con fecha 1970-01-01.
const hora = (hhmm) => new Date(`1970-01-01T${hhmm}:00.000Z`);

const MIERCOLES = 3;

// La clase es semanal: miercoles de 18:00 a 19:00 hora de Colombia (UTC-5), es
// decir, 23:00-00:00 UTC. El miercoles 2026-10-07 la sesion empieza a las 23:00Z.
const INICIO_SESION = new Date("2026-10-07T23:00:00.000Z");
const MS_HORA = 60 * 60 * 1000;
const antesDelInicio = (ms) => new Date(INICIO_SESION.getTime() - ms);

const solicitante = { id: "estudiante-1", rol: "estudiante" };

const crearInscripcion = (sobrescribir = {}) => ({
  id: "insc-1",
  claseId: "clase-1",
  usuarioId: solicitante.id,
  menorId: null,
  estado: "confirmada",
  menor: null,
  clase: {
    id: "clase-1",
    tipoBaile: "Salsa",
    ciudad: "Cali",
    estado: "activa",
    precio: "50000.00",
    horarios: [{ diaSemana: MIERCOLES, horaInicio: hora("18:00"), horaFin: hora("19:00") }],
  },
  pago: { id: "pago-1", monto: "50000.00", estado: "aprobado", reembolsado: false },
  ...sobrescribir,
});

// Deja que se ejecute la notificacion "fire and forget" posterior al commit.
const esperarCorreo = () => vi.waitFor(() => expect(notificationEmitter.emit).toHaveBeenCalled());

let tx;

const prepararTransaccion = () => {
  tx = { marca: "tx" };
  // La transaccion se resuelve en memoria: ejecuta el callback con un tx falso.
  vi.spyOn(prisma, "$transaction").mockImplementation(async (callback) => callback(tx));
  vi.spyOn(enrollmentRepository, "bloquearClase").mockResolvedValue(undefined);
  vi.spyOn(enrollmentRepository, "transicionarEstado").mockResolvedValue(true);
  vi.spyOn(enrollmentRepository, "incrementarCupoDisponible").mockResolvedValue({});
  vi.spyOn(userRepository, "findById").mockResolvedValue({
    id: solicitante.id,
    nombre: "Ana",
    correo: "ana@example.com",
  });
  vi.spyOn(notificationEmitter, "emit").mockReturnValue(true);
};

// ---------------------------------------------------------------------------
// RF-013: simularPago
// ---------------------------------------------------------------------------
describe("simularPago", () => {
  beforeEach(() => {
    prepararTransaccion();
    vi.spyOn(paymentRepository, "create").mockImplementation(async (datos) => ({
      id: "pago-nuevo",
      ...datos,
      procesadoEn: new Date(),
    }));
  });

  describe("pago aprobado", () => {
    it("confirma la inscripcion, registra el pago aprobado y NO libera el cupo", async () => {
      vi.spyOn(enrollmentRepository, "findById").mockResolvedValue(
        crearInscripcion({ estado: "pendiente_pago", pago: null }),
      );

      const resultado = await simularPago("insc-1", solicitante);

      expect(resultado.paymentStatus).toBe("aprobado");
      expect(resultado.inscripcion).toEqual({ id: "insc-1", estado: "confirmada" });
      expect(resultado.receiptId).toMatch(/^SIM-[0-9A-F]{10}$/);
      expect(resultado.comprobante).toMatchObject({
        esSimulado: true,
        claseId: "clase-1",
        clase: "Salsa",
        estado: "aprobado",
        referencia: resultado.receiptId,
      });

      expect(enrollmentRepository.bloquearClase).toHaveBeenCalledWith("clase-1", tx);
      expect(enrollmentRepository.transicionarEstado).toHaveBeenCalledWith(
        "insc-1",
        "pendiente_pago",
        "confirmada",
        {},
        tx,
      );
      expect(enrollmentRepository.incrementarCupoDisponible).not.toHaveBeenCalled();
      expect(paymentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          inscripcionId: "insc-1",
          monto: "50000.00",
          estado: "aprobado",
          referenciaPasarela: resultado.receiptId,
        }),
        tx,
      );
    });

    it("cobra el precio de la clase convertido a numero al proveedor de pago", async () => {
      vi.spyOn(enrollmentRepository, "findById").mockResolvedValue(
        crearInscripcion({ estado: "pendiente_pago", pago: null }),
      );
      const procesar = vi.spyOn(paymentProvider, "processPayment");

      await simularPago("insc-1", solicitante);

      expect(procesar).toHaveBeenCalledWith(50000, {
        inscripcionId: "insc-1",
        simularRechazo: false,
      });
    });
  });

  describe("pago rechazado (simularRechazo)", () => {
    it("cancela la inscripcion, libera el cupo y registra el pago rechazado", async () => {
      vi.spyOn(enrollmentRepository, "findById").mockResolvedValue(
        crearInscripcion({ estado: "pendiente_pago", pago: null }),
      );
      const procesar = vi.spyOn(paymentProvider, "processPayment");

      const resultado = await simularPago("insc-1", solicitante, { simularRechazo: true });

      expect(procesar).toHaveBeenCalledWith(50000, {
        inscripcionId: "insc-1",
        simularRechazo: true,
      });
      expect(resultado.paymentStatus).toBe("rechazado");
      expect(resultado.inscripcion).toEqual({ id: "insc-1", estado: "cancelada" });

      expect(enrollmentRepository.transicionarEstado).toHaveBeenCalledWith(
        "insc-1",
        "pendiente_pago",
        "cancelada",
        {},
        tx,
      );
      // El cupo se libera dentro de la misma transaccion.
      expect(enrollmentRepository.incrementarCupoDisponible).toHaveBeenCalledTimes(1);
      expect(enrollmentRepository.incrementarCupoDisponible).toHaveBeenCalledWith("clase-1", tx);
      expect(paymentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ inscripcionId: "insc-1", estado: "rechazado" }),
        tx,
      );
    });

    it("solo un simularRechazo estrictamente true rechaza el pago", async () => {
      vi.spyOn(enrollmentRepository, "findById").mockResolvedValue(
        crearInscripcion({ estado: "pendiente_pago", pago: null }),
      );

      const resultado = await simularPago("insc-1", solicitante, { simularRechazo: "true" });

      expect(resultado.paymentStatus).toBe("aprobado");
      expect(enrollmentRepository.incrementarCupoDisponible).not.toHaveBeenCalled();
    });
  });

  describe("proveedor de pago simulado", () => {
    it("aprueba por defecto y rechaza solo con simularRechazo === true", async () => {
      await expect(paymentProvider.processPayment(1000)).resolves.toMatchObject({ aprobado: true });
      await expect(paymentProvider.processPayment(1000, {})).resolves.toMatchObject({
        aprobado: true,
      });
      await expect(
        paymentProvider.processPayment(1000, { simularRechazo: "true" }),
      ).resolves.toMatchObject({ aprobado: true });

      const rechazado = await paymentProvider.processPayment(1000, { simularRechazo: true });
      expect(rechazado.aprobado).toBe(false);
      expect(rechazado.referencia).toMatch(/^SIM-[0-9A-F]{10}$/);
    });
  });

  describe("validaciones previas", () => {
    it("inscripcion inexistente: 404 ENROLLMENT_NOT_FOUND", async () => {
      vi.spyOn(enrollmentRepository, "findById").mockResolvedValue(null);

      const error = await simularPago("no-existe", solicitante).catch((e) => e);

      expect(error).toBeInstanceOf(AppError);
      expect(error).toMatchObject({ statusCode: 404, code: "ENROLLMENT_NOT_FOUND" });
    });

    it("solo el dueno puede pagar: 403 FORBIDDEN y no se cobra nada", async () => {
      vi.spyOn(enrollmentRepository, "findById").mockResolvedValue(
        crearInscripcion({ estado: "pendiente_pago", usuarioId: "otro-usuario" }),
      );
      const procesar = vi.spyOn(paymentProvider, "processPayment");

      await expect(simularPago("insc-1", solicitante)).rejects.toMatchObject({
        statusCode: 403,
        code: "FORBIDDEN",
      });
      expect(procesar).not.toHaveBeenCalled();
      expect(paymentRepository.create).not.toHaveBeenCalled();
    });

    it.each(["confirmada", "cancelada"])(
      "una inscripcion %s no se puede pagar: 409 INVALID_ENROLLMENT_STATE",
      async (estado) => {
        vi.spyOn(enrollmentRepository, "findById").mockResolvedValue(crearInscripcion({ estado }));
        const procesar = vi.spyOn(paymentProvider, "processPayment");

        await expect(simularPago("insc-1", solicitante)).rejects.toMatchObject({
          statusCode: 409,
          code: "INVALID_ENROLLMENT_STATE",
        });
        expect(procesar).not.toHaveBeenCalled();
        expect(prisma.$transaction).not.toHaveBeenCalled();
      },
    );

    it("si otro pago cambio el estado antes (transicion condicional falla): 409 y no se registra pago ni se libera cupo", async () => {
      vi.spyOn(enrollmentRepository, "findById").mockResolvedValue(
        crearInscripcion({ estado: "pendiente_pago", pago: null }),
      );
      enrollmentRepository.transicionarEstado.mockResolvedValue(false);

      await expect(
        simularPago("insc-1", solicitante, { simularRechazo: true }),
      ).rejects.toMatchObject({ statusCode: 409, code: "INVALID_ENROLLMENT_STATE" });
      expect(paymentRepository.create).not.toHaveBeenCalled();
      expect(enrollmentRepository.incrementarCupoDisponible).not.toHaveBeenCalled();
    });
  });

  describe("notificacion por correo (RF-017)", () => {
    it("emite el correo de pago aprobado al dueno de la inscripcion", async () => {
      vi.spyOn(enrollmentRepository, "findById").mockResolvedValue(
        crearInscripcion({ estado: "pendiente_pago", pago: null }),
      );

      await simularPago("insc-1", solicitante);
      await esperarCorreo();

      expect(notificationEmitter.emit).toHaveBeenCalledWith(
        "correo",
        expect.objectContaining({
          destinatario: "ana@example.com",
          asunto: "Pago aprobado: Salsa",
        }),
      );
    });

    it("emite el correo de pago rechazado cuando el pago es rechazado", async () => {
      vi.spyOn(enrollmentRepository, "findById").mockResolvedValue(
        crearInscripcion({ estado: "pendiente_pago", pago: null }),
      );

      await simularPago("insc-1", solicitante, { simularRechazo: true });
      await esperarCorreo();

      expect(notificationEmitter.emit).toHaveBeenCalledWith(
        "correo",
        expect.objectContaining({ asunto: "Pago rechazado: Salsa" }),
      );
    });

    it("un fallo al preparar el correo no afecta al pago", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      vi.spyOn(enrollmentRepository, "findById").mockResolvedValue(
        crearInscripcion({ estado: "pendiente_pago", pago: null }),
      );
      userRepository.findById.mockRejectedValue(new Error("DB caida"));

      const resultado = await simularPago("insc-1", solicitante);

      expect(resultado.paymentStatus).toBe("aprobado");
      expect(resultado.inscripcion.estado).toBe("confirmada");
    });
  });
});

// ---------------------------------------------------------------------------
// RF-018: cancelarInscripcion y regla de reembolso de 2 horas.
// ERS: con 2 horas o mas de anticipacion al inicio -> reembolso completo; con
// menos de 2 horas -> se cancela y se libera el cupo, sin reembolso.
// El reloj se controla con fake timers: la sesion empieza el miercoles
// 2026-10-07 a las 18:00 hora de Colombia (23:00Z).
// ---------------------------------------------------------------------------
describe("cancelarInscripcion (RF-018)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    prepararTransaccion();
    vi.spyOn(paymentRepository, "marcarComoReembolsado").mockResolvedValue({});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const cancelarA = async (msAntesDelInicio, inscripcion = crearInscripcion()) => {
    vi.setSystemTime(antesDelInicio(msAntesDelInicio));
    vi.spyOn(enrollmentRepository, "findById").mockResolvedValue(inscripcion);

    return await cancelarInscripcion("insc-1", solicitante);
  };

  describe("reembolso segun la anticipacion", () => {
    it("con mas de 2 horas de anticipacion: reembolsado true", async () => {
      const resultado = await cancelarA(5 * MS_HORA);

      expect(resultado.cancelada).toBe(true);
      expect(resultado.reembolsado).toBe(true);
      expect(resultado.inscripcion).toEqual({ id: "insc-1", estado: "cancelada" });
      expect(resultado.mensaje).toBe("Inscripción cancelada. Se generó un reembolso completo.");
      expect(paymentRepository.marcarComoReembolsado).toHaveBeenCalledWith(
        "pago-1",
        "cancelacion_estudiante_anticipada",
        tx,
      );
      expect(enrollmentRepository.incrementarCupoDisponible).toHaveBeenCalledWith("clase-1", tx);
    });

    it("LIMITE: con exactamente 2 horas de anticipacion SI hay reembolso (>= 2 h)", async () => {
      const resultado = await cancelarA(2 * MS_HORA);

      expect(resultado.reembolsado).toBe(true);
      expect(paymentRepository.marcarComoReembolsado).toHaveBeenCalledTimes(1);
    });

    it("LIMITE: con 1 hora 59 minutos 59 segundos NO hay reembolso, pero el cupo se libera", async () => {
      const resultado = await cancelarA(2 * MS_HORA - 1000);

      expect(resultado.cancelada).toBe(true);
      expect(resultado.reembolsado).toBe(false);
      expect(resultado.mensaje).toBe(
        "Inscripción cancelada sin reembolso: faltaban menos de 2 horas para la clase.",
      );
      expect(paymentRepository.marcarComoReembolsado).not.toHaveBeenCalled();
      expect(enrollmentRepository.incrementarCupoDisponible).toHaveBeenCalledWith("clase-1", tx);
      expect(enrollmentRepository.transicionarEstado).toHaveBeenCalledWith(
        "insc-1",
        "confirmada",
        "cancelada",
        { canceladoPor: "estudiante" },
        tx,
      );
    });

    it("con 1 hora de anticipacion: reembolsado false y cupo liberado", async () => {
      const resultado = await cancelarA(1 * MS_HORA);

      expect(resultado.reembolsado).toBe(false);
      expect(paymentRepository.marcarComoReembolsado).not.toHaveBeenCalled();
      expect(enrollmentRepository.incrementarCupoDisponible).toHaveBeenCalledTimes(1);
    });

    it("con 1 minuto de anticipacion (la clase aun no empieza): se cancela sin reembolso", async () => {
      const resultado = await cancelarA(60 * 1000);

      expect(resultado.cancelada).toBe(true);
      expect(resultado.reembolsado).toBe(false);
    });

    it("si la sesion de esta semana ya paso, la proxima es la semana siguiente y SI hay reembolso", async () => {
      // Miercoles 19:30 hora de Colombia: la sesion de hoy ya termino.
      vi.setSystemTime(new Date("2026-10-08T00:30:00.000Z"));
      vi.spyOn(enrollmentRepository, "findById").mockResolvedValue(crearInscripcion());

      const resultado = await cancelarInscripcion("insc-1", solicitante);

      expect(resultado.reembolsado).toBe(true);
    });

    it("el reloj por defecto es el del sistema: sin pasar `ahora` se usa la fecha simulada", async () => {
      vi.setSystemTime(antesDelInicio(2 * MS_HORA));
      vi.spyOn(enrollmentRepository, "findById").mockResolvedValue(crearInscripcion());

      const [conReloj, conAhoraExplicito] = [
        await cancelarInscripcion("insc-1", solicitante),
        await cancelarInscripcion("insc-1", solicitante, antesDelInicio(2 * MS_HORA - 1000)),
      ];

      expect(conReloj.reembolsado).toBe(true);
      expect(conAhoraExplicito.reembolsado).toBe(false);
    });
  });

  describe("inscripciones sin pago reembolsable", () => {
    it("pendiente_pago (sin pago): se cancela y libera el cupo sin reembolso", async () => {
      const resultado = await cancelarA(
        5 * MS_HORA,
        crearInscripcion({ estado: "pendiente_pago", pago: null }),
      );

      expect(resultado.cancelada).toBe(true);
      expect(resultado.reembolsado).toBe(false);
      expect(resultado.mensaje).toBe("Inscripción cancelada.");
      expect(paymentRepository.marcarComoReembolsado).not.toHaveBeenCalled();
      expect(enrollmentRepository.incrementarCupoDisponible).toHaveBeenCalledTimes(1);
      expect(enrollmentRepository.transicionarEstado).toHaveBeenCalledWith(
        "insc-1",
        "pendiente_pago",
        "cancelada",
        { canceladoPor: "estudiante" },
        tx,
      );
    });

    it("un pago ya reembolsado no se reembolsa dos veces", async () => {
      const resultado = await cancelarA(
        5 * MS_HORA,
        crearInscripcion({
          pago: { id: "pago-1", estado: "aprobado", reembolsado: true, monto: "50000.00" },
        }),
      );

      expect(resultado.reembolsado).toBe(false);
      expect(paymentRepository.marcarComoReembolsado).not.toHaveBeenCalled();
    });

    it("un pago rechazado no genera reembolso", async () => {
      const resultado = await cancelarA(
        5 * MS_HORA,
        crearInscripcion({
          pago: { id: "pago-1", estado: "rechazado", reembolsado: false, monto: "50000.00" },
        }),
      );

      expect(resultado.reembolsado).toBe(false);
      expect(paymentRepository.marcarComoReembolsado).not.toHaveBeenCalled();
    });

    it("una clase sin horarios no tiene proxima sesion: se cancela y se reembolsa", async () => {
      const inscripcion = crearInscripcion();
      inscripcion.clase.horarios = [];

      const resultado = await cancelarA(5 * MS_HORA, inscripcion);

      expect(resultado.reembolsado).toBe(true);
    });
  });

  describe("reglas de cancelacion", () => {
    it("inscripcion inexistente: 404 ENROLLMENT_NOT_FOUND", async () => {
      vi.spyOn(enrollmentRepository, "findById").mockResolvedValue(null);

      await expect(cancelarInscripcion("no-existe", solicitante)).rejects.toMatchObject({
        statusCode: 404,
        code: "ENROLLMENT_NOT_FOUND",
      });
    });

    it("solo el dueno puede cancelar: 403 FORBIDDEN", async () => {
      await expect(
        cancelarA(5 * MS_HORA, crearInscripcion({ usuarioId: "otro-usuario" })),
      ).rejects.toMatchObject({ statusCode: 403, code: "FORBIDDEN" });
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it("una inscripcion ya cancelada: 409 ENROLLMENT_ALREADY_CANCELLED", async () => {
      await expect(
        cancelarA(5 * MS_HORA, crearInscripcion({ estado: "cancelada" })),
      ).rejects.toMatchObject({ statusCode: 409, code: "ENROLLMENT_ALREADY_CANCELLED" });
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it("con la sesion en curso la clase ya comenzo: 409 CLASS_ALREADY_STARTED y sin reembolso", async () => {
      // 18:30 hora de Colombia, sesion de 18:00 a 19:00.
      await expect(cancelarA(-30 * 60 * 1000)).rejects.toMatchObject({
        statusCode: 409,
        code: "CLASS_ALREADY_STARTED",
      });
      expect(paymentRepository.marcarComoReembolsado).not.toHaveBeenCalled();
      expect(enrollmentRepository.incrementarCupoDisponible).not.toHaveBeenCalled();
    });

    it("LIMITE: justo en el instante de inicio de la sesion la clase ya comenzo", async () => {
      await expect(cancelarA(0)).rejects.toMatchObject({ code: "CLASS_ALREADY_STARTED" });
    });

    it("una clase finalizada no se puede cancelar: 409 CLASS_ALREADY_STARTED", async () => {
      const inscripcion = crearInscripcion();
      inscripcion.clase.estado = "finalizada";

      await expect(cancelarA(5 * MS_HORA, inscripcion)).rejects.toMatchObject({
        statusCode: 409,
        code: "CLASS_ALREADY_STARTED",
      });
    });

    it("si el estado cambio mientras tanto (transicion condicional falla): 409 y sin reembolso ni cupo", async () => {
      enrollmentRepository.transicionarEstado.mockResolvedValue(false);

      await expect(cancelarA(5 * MS_HORA)).rejects.toMatchObject({
        statusCode: 409,
        code: "INVALID_ENROLLMENT_STATE",
      });
      expect(paymentRepository.marcarComoReembolsado).not.toHaveBeenCalled();
      expect(enrollmentRepository.incrementarCupoDisponible).not.toHaveBeenCalled();
    });
  });

  describe("notificacion por correo (RF-017)", () => {
    it("avisa al dueno con el resultado del reembolso", async () => {
      await cancelarA(5 * MS_HORA);
      await esperarCorreo();

      expect(notificationEmitter.emit).toHaveBeenCalledWith(
        "correo",
        expect.objectContaining({
          destinatario: "ana@example.com",
          asunto: "Inscripción cancelada: Salsa",
          cuerpo: expect.stringContaining("Se generó un reembolso completo"),
        }),
      );
    });

    it("el aviso indica que no hubo reembolso cuando faltaban menos de 2 horas", async () => {
      await cancelarA(1 * MS_HORA);
      await esperarCorreo();

      expect(notificationEmitter.emit).toHaveBeenCalledWith(
        "correo",
        expect.objectContaining({
          cuerpo: expect.stringContaining("menos de 2 horas de anticipación"),
        }),
      );
    });
  });
});
