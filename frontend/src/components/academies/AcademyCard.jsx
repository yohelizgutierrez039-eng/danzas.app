// src/components/academies/AcademyCard.jsx

import Button from "../common/Button/Button";
import AcademyStatusBadge from "./AcademyStatusBadge";

import "./AcademyCard.css";

/**
 * Tarjeta resumen de una solicitud de academia (o instructor independiente).
 *
 * @param {Object} props
 * @param {Object} props.solicitud - { id, nombreAcademia, estado, instructor: { nombre, ciudad } }
 * @param {(id: string|number) => void} props.onViewProfile
 */
function AcademyCard({ solicitud, onViewProfile }) {
  const { id, nombreAcademia, estado, instructor } = solicitud;
  const esIndependiente = !nombreAcademia;
  const titulo = esIndependiente ? instructor?.nombre : nombreAcademia;

  return (
    <div className="academy-card">
      <div className="academy-card__header">
        <h3 className="academy-card__title">{titulo}</h3>

        {esIndependiente && (
          <span className="academy-card__note">Instructor independiente</span>
        )}
      </div>

      <p className="academy-card__subtext">{instructor?.ciudad}</p>

      <div className="academy-card__status">
        <AcademyStatusBadge estado={estado} />
      </div>

      <div className="academy-card__action">
        <Button
          variant="outline"
          size="small"
          onClick={() => onViewProfile(id)}
        >
          Ver perfil
        </Button>
      </div>
    </div>
  );
}

export default AcademyCard;
