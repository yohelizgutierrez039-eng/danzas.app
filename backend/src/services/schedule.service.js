const prisma = require("../config/prisma");
const classRepository = require("../repositories/class.repository");
const { AppError } = require("../middleware/errorHandler");

const MARGEN_MINUTOS = 15;

const HORA_TEXTO = /^(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/;
const FECHA_HORA_ISO = /^\d{4}-\d{2}-\d{2}T/;

const horarioInvalido = () =>
  new AppError(
    "El horario no es válido: la hora de inicio y de fin deben tener un formato correcto y la hora de fin debe ser posterior a la de inicio.",
    400,
    "INVALID_SCHEDULE",
  );

/**
 * Convierte una hora a minutos desde la medianoche. Acepta tres formas:
 *  - Date (lo que entrega Prisma para columnas TIME): se usa la hora UTC.
 *  - Texto ISO-8601 ("1970-01-01T18:30:00.000Z", lo que llega por la API): se
 *    parsea a Date y se usa la hora UTC, igual que Prisma al guardarla.
 *  - Texto "HH:MM" (o "HH:MM:SS").
 * Cualquier otro valor lanza INVALID_SCHEDULE (400) en lugar de producir NaN,
 * porque con NaN toda comparacion es falsa y el cruce de horarios no se detecta.
 */
const aMinutos = (valor) => {
  if (valor instanceof Date) {
    if (Number.isNaN(valor.getTime())) {
      throw horarioInvalido();
    }

    return valor.getUTCHours() * 60 + valor.getUTCMinutes();
  }

  if (typeof valor === "string") {
    const texto = valor.trim();

    if (FECHA_HORA_ISO.test(texto)) {
      return aMinutos(new Date(texto));
    }

    const coincidencia = HORA_TEXTO.exec(texto);

    if (coincidencia) {
      const horas = Number(coincidencia[1]);
      const minutos = Number(coincidencia[2]);

      if (horas <= 23 && minutos <= 59) {
        return horas * 60 + minutos;
      }
    }
  }

  throw horarioInvalido();
};

/**
 * Valida un horario antes de consultar la base de datos: ambas horas deben ser
 * convertibles a minutos y la hora de fin debe ser posterior a la de inicio.
 */
const validarHorario = (horario) => {
  const inicio = aMinutos(horario?.horaInicio);
  const fin = aMinutos(horario?.horaFin);

  if (fin <= inicio) {
    throw horarioInvalido();
  }
};

const seSuperponen = (horarioExistente, nuevoHorario) => {
  if (horarioExistente.diaSemana !== nuevoHorario.diaSemana) {
    return false;
  }

  const inicioExistente = aMinutos(horarioExistente.horaInicio);
  const finExistente = aMinutos(horarioExistente.horaFin);
  const inicioNuevo = aMinutos(nuevoHorario.horaInicio);
  const finNuevo = aMinutos(nuevoHorario.horaFin);

  // Hay conflicto si los rangos se superponen, o si queda menos de
  // MARGEN_MINUTOS entre el fin de uno y el inicio del otro.
  return inicioNuevo < finExistente + MARGEN_MINUTOS && inicioExistente < finNuevo + MARGEN_MINUTOS;
};

const hayConflictoDeHorario = async (instructorId, nuevoHorario, claseIdAExcluir = null) => {
  validarHorario(nuevoHorario);

  const hayConflicto = await prisma.$transaction(async (tx) => {
    const clasesDelInstructor = await classRepository.findByInstructor(
      instructorId,
      { estado: "activa" },
      tx,
    );

    for (const clase of clasesDelInstructor) {
      if (claseIdAExcluir && clase.id === claseIdAExcluir) {
        continue;
      }

      const tieneCruce = clase.horarios.some((horarioExistente) =>
        seSuperponen(horarioExistente, nuevoHorario),
      );

      if (tieneCruce) {
        return true;
      }
    }

    return false;
  });

  if (hayConflicto) {
    throw new AppError("El horario se cruza con otra clase del instructor.", 409, "SCHEDULE_CONFLICT");
  }
};

module.exports = {
  hayConflictoDeHorario,
};
