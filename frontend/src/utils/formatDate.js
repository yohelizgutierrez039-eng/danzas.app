// 0 = domingo, igual que el campo diaSemana de los horarios del backend.
export const DIAS_SEMANA = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export const diaSemanaTexto = (n) => DIAS_SEMANA[n] ?? "";

// El backend guarda la hora tal cual, sin zona horaria: se lee la hora UTC del ISO.
export const horaDesdeISO = (iso) => {
  const fecha = new Date(iso);

  if (!iso || Number.isNaN(fecha.getTime())) {
    return "";
  }

  const horas = String(fecha.getUTCHours()).padStart(2, "0");
  const minutos = String(fecha.getUTCMinutes()).padStart(2, "0");

  return `${horas}:${minutos}`;
};

export const horaAISO = (hhmm) => `1970-01-01T${hhmm}:00.000Z`;

// Ejemplo: "Lunes 18:00 - 19:00". Devuelve "" si el horario está incompleto.
export const formatearHorario = (horario) => {
  const dia = diaSemanaTexto(horario?.diaSemana);
  const inicio = horaDesdeISO(horario?.horaInicio);
  const fin = horaDesdeISO(horario?.horaFin);

  if (!dia || !inicio || !fin) {
    return "";
  }

  return `${dia} ${inicio} - ${fin}`;
};

// Fecha local de hoy como YYYY-MM-DD, el formato de un input type="date".
export const fechaDeHoy = () => {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");

  return `${hoy.getFullYear()}-${mes}-${dia}`;
};
