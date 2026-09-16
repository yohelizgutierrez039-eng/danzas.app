// src/components/classes/ClassCard.jsx

import Button from "../common/Button/Button";
import ClassStatusBadge from "./ClassStatusBadge";

import "./ClassCard.css";

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function formatearHora(iso) {
  return new Date(iso).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatearPrecio(precio) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(precio);
}

/**
 * Tarjeta resumen de una clase.
 *
 * @param {Object} props
 * @param {Object} props.clase - { id, tipoBaile, ciudad, modalidad, precio, cupoMaximo,
 *   cupoDisponible, estado, instructor: { nombre }, horarios: [{ diaSemana, horaInicio, horaFin }] }
 * @param {(id: string|number) => void} props.onViewDetails
 */
function ClassCard({ clase, onViewDetails }) {
  const {
    id,
    tipoBaile,
    ciudad,
    modalidad,
    precio,
    cupoMaximo,
    cupoDisponible,
    estado,
    instructor,
    horarios,
  } = clase;

  const primerHorario = horarios?.[0];

  return (
    <div className="class-card">
      <div className="class-card__header">
        <h3 className="class-card__title">{tipoBaile}</h3>
        <ClassStatusBadge estado={estado} />
      </div>

      <p className="class-card__subtext">
        {instructor?.nombre} · {ciudad} · {modalidad}
      </p>

      {primerHorario && (
        <p className="class-card__schedule">
          {DIAS_SEMANA[primerHorario.diaSemana]}{" "}
          {formatearHora(primerHorario.horaInicio)} -{" "}
          {formatearHora(primerHorario.horaFin)}
        </p>
      )}

      <p className="class-card__price">{formatearPrecio(precio)}</p>

      <p className="class-card__cupos">
        {cupoDisponible} de {cupoMaximo} cupos disponibles
      </p>

      <div className="class-card__action">
        <Button size="small" onClick={() => onViewDetails(id)}>
          Ver detalles
        </Button>
      </div>
    </div>
  );
}

export default ClassCard;
