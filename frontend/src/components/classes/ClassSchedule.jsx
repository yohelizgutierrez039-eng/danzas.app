// src/components/classes/ClassSchedule.jsx

import "./ClassSchedule.css";

const DIAS_SEMANA = [
  { diaSemana: 1, label: "Lunes" },
  { diaSemana: 2, label: "Martes" },
  { diaSemana: 3, label: "Miércoles" },
  { diaSemana: 4, label: "Jueves" },
  { diaSemana: 5, label: "Viernes" },
  { diaSemana: 6, label: "Sábado" },
  { diaSemana: 0, label: "Domingo" },
];

function formatearHora(iso) {
  return new Date(iso).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Vista semanal simple (filas apiladas) de los horarios de una clase.
 *
 * @param {Object} props
 * @param {Array} props.horarios - [{ diaSemana, horaInicio, horaFin, tipoBaile? }]
 */
function ClassSchedule({ horarios = [] }) {
  return (
    <div className="class-schedule">
      {DIAS_SEMANA.map(({ diaSemana, label }) => {
        const horariosDelDia = horarios.filter(
          (h) => h.diaSemana === diaSemana
        );

        return (
          <div key={diaSemana} className="class-schedule__row">
            <span className="class-schedule__day">{label}</span>

            {horariosDelDia.length === 0 ? (
              <span className="class-schedule__empty">Sin clases</span>
            ) : (
              <div className="class-schedule__slots">
                {horariosDelDia.map((h, index) => (
                  <span key={index} className="class-schedule__slot">
                    {h.tipoBaile ? `${h.tipoBaile} · ` : ""}
                    {formatearHora(h.horaInicio)} - {formatearHora(h.horaFin)}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ClassSchedule;
