export const DIAS_SEMANA = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export const diaSemanaTexto = (n) => {
  return DIAS_SEMANA[n] ?? "";
};

export const horaDesdeISO = (iso) => {
  if (!iso) return "";

  const fecha = new Date(iso);

  if (Number.isNaN(fecha.getTime())) return "";

  return `${String(fecha.getUTCHours()).padStart(2, "0")}:${String(
    fecha.getUTCMinutes(),
  ).padStart(2, "0")}`;
};

export const horaAISO = (hhmm) => {
  if (!hhmm || !/^([01]\d|2[0-3]):[0-5]\d$/.test(hhmm)) {
    return "";
  }

  return `1970-01-01T${hhmm}:00.000Z`;
};

export const formatearHorario = (horario) => {
  if (!horario) return "";

  const dia = diaSemanaTexto(Number(horario.diaSemana));
  const horaInicio = horaDesdeISO(horario.horaInicio);
  const horaFin = horaDesdeISO(horario.horaFin);

  if (!dia || !horaInicio || !horaFin) return "";

  return `${dia} ${horaInicio} - ${horaFin}`;
};
