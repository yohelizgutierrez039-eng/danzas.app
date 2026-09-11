import React from "react";
import "./instructorinfo.css";

const InstructorInfo = ({ instructor, onEdit, onChangeStatus, onBack }) => {
  if (!instructor) {
    return (
      <div className="instructor-info">
        <p>No se encontró la información del instructor.</p>
      </div>
    );
  }

  return (
    <div className="instructor-info">
      {/* Encabezado */}
      <div className="instructor-info__header">
        <button
          type="button"
          className="instructor-info__back"
          onClick={onBack}
        >
          ← Volver
        </button>

        <h1>Información del instructor</h1>
      </div>

      {/* Información principal */}
      <div className="instructor-info__card">
        <div className="instructor-info__profile">
          <img
            src={instructor.imagen || "/images/default-user.png"}
            alt={`${instructor.nombre} ${instructor.apellido}`}
            className="instructor-info__image"
          />

          <div className="instructor-info__main">
            <h2>
              {instructor.nombre} {instructor.apellido}
            </h2>

            <p className="instructor-info__role">
              Instructor de danza
            </p>

            <span
              className={`instructor-info__status ${
                instructor.estado?.toLowerCase() === "activo"
                  ? "active"
                  : "inactive"
              }`}
            >
              {instructor.estado}
            </span>
          </div>

          <button
            type="button"
            className="instructor-info__edit"
            onClick={() => onEdit?.(instructor)}
          >
            ✎ Editar información
          </button>
        </div>

        {/* Datos del instructor */}
        <div className="instructor-info__section">
          <h3>Información personal</h3>

          <div className="instructor-info__grid">
            <div className="instructor-info__field">
              <span>Nombre completo</span>
              <strong>
                {instructor.nombre} {instructor.apellido}
              </strong>
            </div>

            <div className="instructor-info__field">
              <span>Correo electrónico</span>
              <strong>{instructor.correo || "No registrado"}</strong>
            </div>

            <div className="instructor-info__field">
              <span>Teléfono</span>
              <strong>{instructor.telefono || "No registrado"}</strong>
            </div>

            <div className="instructor-info__field">
              <span>Ciudad</span>
              <strong>{instructor.ciudad || "No registrada"}</strong>
            </div>
          </div>
        </div>

        {/* Academia */}
        <div className="instructor-info__section">
          <h3>Academia asociada</h3>

          <div className="instructor-info__academy">
            <div>
              <span>Academia</span>
              <strong>
                {instructor.academia || "Independiente"}
              </strong>
            </div>

            <div>
              <span>Estado</span>
              <strong>
                {instructor.estadoAcademia || "Activa"}
              </strong>
            </div>
          </div>
        </div>

        {/* Estilos de baile */}
        <div className="instructor-info__section">
          <h3>Estilos de baile</h3>

          <div className="instructor-info__styles">
            {instructor.estilos?.length > 0 ? (
              instructor.estilos.map((estilo, index) => (
                <span key={index} className="dance-style">
                  {estilo}
                </span>
              ))
            ) : (
              <p>No hay estilos registrados.</p>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="instructor-info__actions">
          <button
            type="button"
            className="instructor-info__button instructor-info__button--edit"
            onClick={() => onEdit?.(instructor)}
          >
            Editar instructor
          </button>

          <button
            type="button"
            className="instructor-info__button instructor-info__button--status"
            onClick={() => onChangeStatus?.(instructor)}
          >
            {instructor.estado?.toLowerCase() === "activo"
              ? "Desactivar instructor"
              : "Activar instructor"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructorInfo;