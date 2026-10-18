// src/components/classes/ClassSchedule.jsx

import { diaSemanaTexto, horaDesdeISO } from "../../utils/formatDate";

import "./ClassSchedule.css";

// Semana de lunes a domingo (diaSemana: 0 = domingo)
const ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0];

/**
 * Vista semanal simple (filas apiladas) de los horarios de una clase.
 *
 * @param {Object} props
 * @param {Array} props.horarios - [{ diaSemana, horaInicio, horaFin, tipoBaile? }]
 */
function ClassSchedule({ horarios = [] }) {
  return (
    <div className="class-schedule">
      {ORDEN_SEMANA.map((diaSemana) => {
        const horariosDelDia = horarios.filter(
          (h) => h.diaSemana === diaSemana
        );

        return (
          <div key={diaSemana} className="class-schedule__row">
            <span className="class-schedule__day">
              {diaSemanaTexto(diaSemana)}
            </span>

            {horariosDelDia.length === 0 ? (
              <span className="class-schedule__empty">Sin clases</span>
            ) : (
              <div className="class-schedule__slots">
                {horariosDelDia.map((h, index) => (
                  <span key={index} className="class-schedule__slot">
                    {h.tipoBaile ? `${h.tipoBaile} · ` : ""}
                    {horaDesdeISO(h.horaInicio)} - {horaDesdeISO(h.horaFin)}
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
