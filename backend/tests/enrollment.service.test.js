import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// Los modulos de src son CommonJS: se cargan con el require nativo para compartir
// la misma instancia que usa el service, y asi poder espiar sus funciones.
const require = createRequire(import.meta.url);
require("dotenv").config({ quiet: true });

const prisma = require("../src/config/prisma");
const enrollmentRepository = require("../src/repositories/enrollment.repository");
const dependentRepository = require("../src/repositories/dependent.repository");
const userRepository = require("../src/repositories/user.repository");
const {
  crearInscripcion,
  obtenerHistorial,
} = require("../src/services/enrollment.service");
const { AppError } = require("../src/middleware/errorHandler");

const estudiante = { id: "estudiante-1", rol: "estudiante" };
const padre = { id: "padre-1", rol: "padre" };
const admin = { id: "admin-1", rol: "admin" };

// ---------------------------------------------------------------------------
// Pruebas unitarias: los repositorios se sustituyen por stubs, sin base de datos.
// ---------------------------------------------------------------------------
describe("crearInscripcion (reglas del service, repositorios simulados)", () => {
  const inscripcionCreada = { id: "insc-1", estado: "pendiente_pago" };

  const stubCrear = (resultado) =>
    vi.spyOn(enrollmentRepository, "crearConDecrementoDeCupo").mockResolvedValue(resultado);

  describe("inscripcion exitosa con cupo", () => {
    it("un estudiante se inscribe a si mismo y recibe la inscripcion en pendiente_pago", async () => {
      const crear = stubCrear({ inscripcion: inscripcionCreada });

      const resultado = await crearInscripcion(estudiante, { claseId: "clase-1" });

      expect(resultado).toBe(inscripcionCreada);
      expect(crear).toHaveBeenCalledTimes(1);
      expect(crear).toHaveBeenCalledWith({
        claseId: "clase-1",
        usuarioId: estudiante.id,
        menorId: null,
      });
    });

    it("un padre inscribe a su propio menor: la inscripcion queda a nombre del padre y del menor", async () => {
      vi.spyOn(dependentRepository, "findById").mockResolvedValue({
        id: "menor-1",
        padreId: padre.id,
      });
      const crear = stubCrear({ inscripcion: inscripcionCreada });

      const resultado = await crearInscripcion(padre, { claseId: "clase-1", menorId: "menor-1" });

      expect(resultado).toBe(inscripcionCreada);
      expect(crear).toHaveBeenCalledWith({
        claseId: "clase-1",
        usuarioId: padre.id,
        menorId: "menor-1",
      });
    });
  });

  describe("errores de negocio devueltos por el repositorio", () => {
    it.each([
      ["SIN_CUPO", 409, "CLASS_FULL"],
      ["CLASE_NO_ENCONTRADA", 404, "CLASS_NOT_FOUND"],
      ["CLASE_NO_ACTIVA", 409, "CLASS_NOT_ACTIVE"],
      ["INSCRIPCION_DUPLICADA", 409, "ENROLLMENT_ALREADY_EXISTS"],
    ])("traduce %s a un AppError %i %s", async (errorRepositorio, status, codigo) => {
      stubCrear({ error: errorRepositorio });

      const promesa = crearInscripcion(estudiante, { claseId: "clase-1" });

      await expect(promesa).rejects.toBeInstanceOf(AppError);
      await expect(promesa).rejects.toMatchObject({ statusCode: status, code: codigo });
    });

    it("clase sin cupo: el codigo real es CLASS_FULL (no NO_AVAILABLE_SLOTS)", async () => {
      stubCrear({ error: "SIN_CUPO" });

      const error = await crearInscripcion(estudiante, { claseId: "clase-1" }).catch((e) => e);

      expect(error.code).toBe("CLASS_FULL");
      expect(error.code).not.toBe("NO_AVAILABLE_SLOTS");
      expect(error.statusCode).toBe(409);
    });
  });

  describe("validacion de entrada", () => {
    it("rechaza la peticion sin claseId (400 VALIDATION_ERROR)", async () => {
      const crear = stubCrear({ inscripcion: inscripcionCreada });

      await expect(crearInscripcion(estudiante, {})).rejects.toMatchObject({
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
      expect(crear).not.toHaveBeenCalled();
    });

    it("rechaza ids que no son texto para no pasarle objetos a Prisma", async () => {
      const crear = stubCrear({ inscripcion: inscripcionCreada });

      await expect(
        crearInscripcion(estudiante, { claseId: { contains: "" } }),
      ).rejects.toMatchObject({ statusCode: 400, code: "VALIDATION_ERROR" });

      await expect(
        crearInscripcion(padre, { claseId: "clase-1", menorId: { not: null } }),
      ).rejects.toMatchObject({ statusCode: 400, code: "VALIDATION_ERROR" });

      expect(crear).not.toHaveBeenCalled();
    });
  });

  describe("reglas de perfil", () => {
    it("un padre debe indicar el menor (400 VALIDATION_ERROR)", async () => {
      const crear = stubCrear({ inscripcion: inscripcionCreada });

      await expect(crearInscripcion(padre, { claseId: "clase-1" })).rejects.toMatchObject({
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
      expect(crear).not.toHaveBeenCalled();
    });

    it("un padre no puede inscribir a un menor que no es suyo (403 FORBIDDEN)", async () => {
      vi.spyOn(dependentRepository, "findById").mockResolvedValue({
        id: "menor-ajeno",
        padreId: "otro-padre",
      });
      const crear = stubCrear({ inscripcion: inscripcionCreada });

      await expect(
        crearInscripcion(padre, { claseId: "clase-1", menorId: "menor-ajeno" }),
      ).rejects.toMatchObject({ statusCode: 403, code: "FORBIDDEN" });
      expect(crear).not.toHaveBeenCalled();
    });

    it("un padre que indica un menor inexistente recibe 404 DEPENDENT_NOT_FOUND", async () => {
      vi.spyOn(dependentRepository, "findById").mockResolvedValue(null);
      const crear = stubCrear({ inscripcion: inscripcionCreada });

      await expect(
        crearInscripcion(padre, { claseId: "clase-1", menorId: "no-existe" }),
      ).rejects.toMatchObject({ statusCode: 404, code: "DEPENDENT_NOT_FOUND" });
      expect(crear).not.toHaveBeenCalled();
    });

    it("un estudiante no puede inscribir a un menor (403 FORBIDDEN)", async () => {
      const crear = stubCrear({ inscripcion: inscripcionCreada });

      await expect(
        crearInscripcion(estudiante, { claseId: "clase-1", menorId: "menor-1" }),
      ).rejects.toMatchObject({ statusCode: 403, code: "FORBIDDEN" });
      expect(crear).not.toHaveBeenCalled();
    });

    it.each(["instructor", "admin"])("el rol %s no puede inscribirse (403 FORBIDDEN)", async (rol) => {
      const crear = stubCrear({ inscripcion: inscripcionCreada });

      await expect(
        crearInscripcion({ id: "u-1", rol }, { claseId: "clase-1" }),
      ).rejects.toMatchObject({ statusCode: 403, code: "FORBIDDEN" });
      expect(crear).not.toHaveBeenCalled();
    });
  });
});

describe("obtenerHistorial (permisos, repositorios simulados)", () => {
  const historial = [{ id: "insc-1" }];

  it("cualquier usuario consulta su propio historial", async () => {
    const porUsuario = vi.spyOn(enrollmentRepository, "findByUsuario").mockResolvedValue(historial);

    await expect(obtenerHistorial(estudiante, estudiante.id)).resolves.toBe(historial);
    expect(porUsuario).toHaveBeenCalledWith(estudiante.id);
  });

  it("un padre consulta el historial de su menor", async () => {
    vi.spyOn(dependentRepository, "findById").mockResolvedValue({ id: "menor-1", padreId: padre.id });
    const porMenor = vi.spyOn(enrollmentRepository, "findByMenor").mockResolvedValue(historial);

    await expect(obtenerHistorial(padre, "menor-1")).resolves.toBe(historial);
    expect(porMenor).toHaveBeenCalledWith("menor-1");
  });

  it("un padre no puede ver el historial de un menor ajeno (403 FORBIDDEN)", async () => {
    vi.spyOn(dependentRepository, "findById").mockResolvedValue({
      id: "menor-ajeno",
      padreId: "otro-padre",
    });
    const porMenor = vi.spyOn(enrollmentRepository, "findByMenor").mockResolvedValue(historial);

    await expect(obtenerHistorial(padre, "menor-ajeno")).rejects.toMatchObject({
      statusCode: 403,
      code: "FORBIDDEN",
    });
    expect(porMenor).not.toHaveBeenCalled();
  });

  it("un estudiante no puede ver el historial de otro usuario (403 FORBIDDEN)", async () => {
    vi.spyOn(dependentRepository, "findById").mockResolvedValue(null);

    await expect(obtenerHistorial(estudiante, "otro-usuario")).rejects.toMatchObject({
      statusCode: 403,
      code: "FORBIDDEN",
    });
  });

  it("el admin consulta el historial de cualquier usuario", async () => {
    vi.spyOn(userRepository, "findById").mockResolvedValue({ id: "usuario-9" });
    const porUsuario = vi.spyOn(enrollmentRepository, "findByUsuario").mockResolvedValue(historial);

    await expect(obtenerHistorial(admin, "usuario-9")).resolves.toBe(historial);
    expect(porUsuario).toHaveBeenCalledWith("usuario-9");
  });

  it("el admin consulta el historial de un menor cuando el id no es de un usuario", async () => {
    vi.spyOn(userRepository, "findById").mockResolvedValue(null);
    vi.spyOn(dependentRepository, "findById").mockResolvedValue({ id: "menor-9", padreId: "x" });
    const porMenor = vi.spyOn(enrollmentRepository, "findByMenor").mockResolvedValue(historial);

    await expect(obtenerHistorial(admin, "menor-9")).resolves.toBe(historial);
    expect(porMenor).toHaveBeenCalledWith("menor-9");
  });

  it("el admin recibe 404 USER_NOT_FOUND si el id no es de usuario ni de menor", async () => {
    vi.spyOn(userRepository, "findById").mockResolvedValue(null);
    vi.spyOn(dependentRepository, "findById").mockResolvedValue(null);

    await expect(obtenerHistorial(admin, "fantasma")).rejects.toMatchObject({
      statusCode: 404,
      code: "USER_NOT_FOUND",
    });
  });
});

// ---------------------------------------------------------------------------
// Prueba de integracion REAL contra MySQL: la garantia de concurrencia vive en
// enrollment.repository.crearConDecrementoDeCupo (SELECT ... FOR UPDATE dentro
// de una transaccion de Prisma), asi que no se puede validar con mocks.
// Se omite si no hay DATABASE_URL. Crea sus propios datos (ids y correos unicos)
// y en afterAll borra SOLO lo que creo, nunca los datos del seed.
// ---------------------------------------------------------------------------
describe.skipIf(!process.env.DATABASE_URL)(
  "crearInscripcion - concurrencia real contra MySQL",
  () => {
    const sufijo = randomUUID().slice(0, 8);
    const ids = {
      instructor: randomUUID(),
      estudiantes: [randomUUID(), randomUUID(), randomUUID()],
      clases: [],
    };

    const crearClase = async (cupo) => {
      const claseId = randomUUID();
      ids.clases.push(claseId);

      await prisma.clase.create({
        data: {
          id: claseId,
          instructorId: ids.instructor,
          tipoBaile: `TEST-${sufijo}`,
          ciudad: "TEST",
          modalidad: "presencial",
          cupoMaximo: cupo,
          cupoDisponible: cupo,
          precio: 10000,
          estado: "activa",
          horarios: {
            create: [
              {
                diaSemana: 1,
                horaInicio: new Date("1970-01-01T08:00:00.000Z"),
                horaFin: new Date("1970-01-01T09:00:00.000Z"),
              },
            ],
          },
        },
      });

      return claseId;
    };

    const comoEstudiante = (indice) => ({ id: ids.estudiantes[indice], rol: "estudiante" });

    const cupoDe = async (claseId) =>
      (await prisma.clase.findUnique({ where: { id: claseId } })).cupoDisponible;

    const inscripcionesDe = async (claseId) =>
      await prisma.inscripcion.findMany({ where: { claseId } });

    beforeAll(async () => {
      await prisma.usuario.create({
        data: {
          id: ids.instructor,
          nombre: `Instructor TEST ${sufijo}`,
          correo: `instructor.test.${sufijo}@danzas-test.invalid`,
          passwordHash: "no-se-usa",
          rol: "instructor",
          ciudad: "TEST",
          estado: "activo",
        },
      });

      for (const [indice, id] of ids.estudiantes.entries()) {
        await prisma.usuario.create({
          data: {
            id,
            nombre: `Estudiante TEST ${sufijo} ${indice}`,
            correo: `estudiante.test.${sufijo}.${indice}@danzas-test.invalid`,
            passwordHash: "no-se-usa",
            rol: "estudiante",
            ciudad: "TEST",
            estado: "activo",
          },
        });
      }
    });

    afterAll(async () => {
      // Orden seguro respecto de las FK: hijos primero, y solo filas propias.
      const porClase = { claseId: { in: ids.clases } };

      await prisma.asistencia.deleteMany({ where: { inscripcion: porClase } });
      await prisma.pago.deleteMany({ where: { inscripcion: porClase } });
      await prisma.inscripcion.deleteMany({ where: porClase });
      await prisma.horario.deleteMany({ where: { claseId: { in: ids.clases } } });
      await prisma.clase.deleteMany({ where: { id: { in: ids.clases } } });
      await prisma.usuario.deleteMany({
        where: { id: { in: [ids.instructor, ...ids.estudiantes] } },
      });

      await prisma.$disconnect();
    });

    it("inscripcion exitosa con cupo: crea la inscripcion pendiente_pago y descuenta el cupo", async () => {
      const claseId = await crearClase(2);

      const inscripcion = await crearInscripcion(comoEstudiante(0), { claseId });

      expect(inscripcion.estado).toBe("pendiente_pago");
      expect(inscripcion.usuarioId).toBe(ids.estudiantes[0]);
      expect(await cupoDe(claseId)).toBe(1);
    });

    it("con cupoDisponible = 1, dos inscripciones en paralelo: una gana y la otra falla con CLASS_FULL", async () => {
      // Se repite con clases nuevas para darle varias oportunidades a la carrera.
      for (let ronda = 0; ronda < 5; ronda++) {
        const claseId = await crearClase(1);

        const resultados = await Promise.allSettled([
          crearInscripcion(comoEstudiante(0), { claseId }),
          crearInscripcion(comoEstudiante(1), { claseId }),
        ]);

        const exitosas = resultados.filter((r) => r.status === "fulfilled");
        const fallidas = resultados.filter((r) => r.status === "rejected");

        expect(exitosas).toHaveLength(1);
        expect(fallidas).toHaveLength(1);
        expect(fallidas[0].reason).toBeInstanceOf(AppError);
        expect(fallidas[0].reason.code).toBe("CLASS_FULL");
        expect(fallidas[0].reason.statusCode).toBe(409);

        // El cupo nunca queda negativo y hay una unica inscripcion en la clase.
        expect(await cupoDe(claseId)).toBe(0);
        expect(await inscripcionesDe(claseId)).toHaveLength(1);
      }
    });

    it("con 2 cupos y 3 solicitudes en paralelo: se aceptan exactamente 2 y 1 falla con CLASS_FULL", async () => {
      const claseId = await crearClase(2);

      const resultados = await Promise.allSettled([
        crearInscripcion(comoEstudiante(0), { claseId }),
        crearInscripcion(comoEstudiante(1), { claseId }),
        crearInscripcion(comoEstudiante(2), { claseId }),
      ]);

      const exitosas = resultados.filter((r) => r.status === "fulfilled");
      const fallidas = resultados.filter((r) => r.status === "rejected");

      expect(exitosas).toHaveLength(2);
      expect(fallidas).toHaveLength(1);
      expect(fallidas[0].reason.code).toBe("CLASS_FULL");
      expect(await cupoDe(claseId)).toBe(0);
      expect(await inscripcionesDe(claseId)).toHaveLength(2);
    });

    it("una clase ya llena rechaza la inscripcion con CLASS_FULL (409) sin crear filas", async () => {
      const claseId = await crearClase(1);
      await crearInscripcion(comoEstudiante(0), { claseId });

      await expect(crearInscripcion(comoEstudiante(1), { claseId })).rejects.toMatchObject({
        code: "CLASS_FULL",
        statusCode: 409,
      });
      expect(await inscripcionesDe(claseId)).toHaveLength(1);
    });
  },
);
