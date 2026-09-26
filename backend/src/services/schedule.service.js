const prisma = require("../config/prisma");
const classRepository = require("../repositories/class.repository");
const { AppError } = require("../middleware/errorHandler");

const MARGEN_MINUTOS = 15;

const aMinutos = (valor) => {
  if (valor instanceof Date) {
    return valor.getUTCHours() * 60 + valor.getUTCMinutes();
  }

  const [horas, minutos] = String(valor).split(":").map(Number);
  return horas * 60 + (minutos || 0);
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
