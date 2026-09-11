import React from "react";
import "./instructorCard.css";

const InstructorCard = ({ instructor, onEdit, onView }) => {
  const { nombre, apellido, academia, estado, imagen } = instructor;

  const estadoClase = estado?.toLowerCase().replace(" ", "-");

  return (
    <div className="instructor-card">
      <div className="instructor-card__info">
        <img
          src={imagen || "/images/default-user.png"}
          alt={`${nombre} ${apellido}`}
          className="instructor-card__image"
        />

        <div className="instructor-card__data">
          <h3>
            {nombre} {apellido}
          </h3>

          <p className="instructor-card__academy">
            {academia || "Sin academia asociada"}
          </p>
        </div>
      </div>

      <div className="instructor-card__status">
        <span className={`status status--${estadoClase}`}>
          {estado}
        </span>
      </div>

      <div className="instructor-card__actions">
        <button
          type="button"
          className="instructor-card__button instructor-card__button--view"
          onClick={() => onView?.(instructor)}
        >
          Ver
        </button>

        <button
          type="button"
          className="instructor-card__button instructor-card__button--edit"
          onClick={() => onEdit?.(instructor)}
        >
          Editar
        </button>
      </div>
    </div>
  );
};

export default InstructorCard;