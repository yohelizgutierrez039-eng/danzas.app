// Los horarios de una clase son semanales: dia_semana (0 = domingo ... 6 = sabado)
// y hora_inicio/hora_fin guardadas como hora de pared (columna TIME, que Prisma
// entrega como Date en UTC con fecha 1970-01-01). La hora de pared es la de
// Colombia (UTC-5, sin horario de verano).
const OFFSET_COLOMBIA_MINUTOS = -5 * 60;
const MS_POR_MINUTO = 60 * 1000;

const aMinutos = (hora) => hora.getUTCHours() * 60 + hora.getUTCMinutes();

/**
 * Calcula el estado de la proxima sesion de una clase a partir de sus horarios.
 *
 * @param {Array} horarios Horarios de la clase ({ diaSemana, horaInicio, horaFin }).
 * @param {Date} ahora Instante de referencia.
 * @returns {{ enCurso: boolean, inicio: Date | null }}
 *   enCurso: hay una sesion que ya empezo y todavia no termina.
 *   inicio: inicio de la proxima sesion que aun no empieza (null si no hay horarios).
 */
const proximaSesion = (horarios, ahora = new Date()) => {
  const ahoraMs = ahora.getTime();
  const ahoraLocal = new Date(ahoraMs + OFFSET_COLOMBIA_MINUTOS * MS_POR_MINUTO);

  let enCurso = false;
  let proximoInicioMs = null;

  for (const horario of horarios) {
    const inicioMin = aMinutos(horario.horaInicio);
    const finMin = aMinutos(horario.horaFin);

    // Se revisan hoy y los 7 dias siguientes: cubre cualquier dia de la semana.
    for (let dias = 0; dias <= 7; dias++) {
      const diaLocal = new Date(
        Date.UTC(
          ahoraLocal.getUTCFullYear(),
          ahoraLocal.getUTCMonth(),
          ahoraLocal.getUTCDate() + dias,
        ),
      );

      if (diaLocal.getUTCDay() !== horario.diaSemana) {
        continue;
      }

      const medianocheUtcMs = diaLocal.getTime() - OFFSET_COLOMBIA_MINUTOS * MS_POR_MINUTO;
      const inicioMs = medianocheUtcMs + inicioMin * MS_POR_MINUTO;
      const finMs = medianocheUtcMs + finMin * MS_POR_MINUTO;

      if (inicioMs <= ahoraMs && ahoraMs < finMs) {
        enCurso = true;
      } else if (inicioMs > ahoraMs && (proximoInicioMs === null || inicioMs < proximoInicioMs)) {
        proximoInicioMs = inicioMs;
      }
    }
  }

  return {
    enCurso,
    inicio: proximoInicioMs === null ? null : new Date(proximoInicioMs),
  };
};

module.exports = {
  proximaSesion,
};
