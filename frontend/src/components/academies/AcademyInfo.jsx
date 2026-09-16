// src/components/academies/AcademyInfo.jsx

import AcademyStatusBadge from "./AcademyStatusBadge";

import "./AcademyInfo.css";

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Bloque de detalle de una academia, pensado para insertarse dentro de una
 * pantalla de detalle más grande (no es una tarjeta).
 *
 * @param {Object} props
 * @param {Object} props.academia - { nombreAcademia, estado, revisadoEn, instructor: { nombre, correo, ciudad } }
 */
function AcademyInfo({ academia }) {
  const { nombreAcademia, estado, revisadoEn, instructor } = academia;

  return (
    <div className="academy-info">
      <h2 className="academy-info__title">
        {nombreAcademia || instructor?.nombre}
      </h2>

      <dl className="academy-info__list">
        <div className="academy-info__row">
          <dt className="academy-info__label">Instructor responsable</dt>
          <dd className="academy-info__value">{instructor?.nombre}</dd>
        </div>

        <div className="academy-info__row">
          <dt className="academy-info__label">Correo</dt>
          <dd className="academy-info__value">{instructor?.correo}</dd>
        </div>

        <div className="academy-info__row">
          <dt className="academy-info__label">Ciudad</dt>
          <dd className="academy-info__value">{instructor?.ciudad}</dd>
        </div>

        <div className="academy-info__row">
          <dt className="academy-info__label">Estado</dt>
          <dd className="academy-info__value">
            <AcademyStatusBadge estado={estado} />
          </dd>
        </div>
      </dl>

      {revisadoEn && (
        <p className="academy-info__reviewed">
          Revisado el {formatearFecha(revisadoEn)}
        </p>
      )}
    </div>
  );
}

export default AcademyInfo;
