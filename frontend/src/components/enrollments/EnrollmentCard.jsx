// src/components/enrollments/EnrollmentCard.jsx

import Button from "../common/Button/Button";
import EnrollmentStatusBadge from "./EnrollmentStatusBadge";

import "./EnrollmentCard.css";

/**
 * Tarjeta que resume una inscripción a una clase.
 * Si la inscripción fue hecha por un padre/madre para un menor a cargo
 * (RF-004/RF-012), se muestra una nota indicándolo.
 * @param {{
 *   inscripcion: {
 *     id: string | number,
 *     estado: "pendiente_pago" | "confirmada" | "cancelada",
 *     creadoEn: string | Date,
 *     clase: { tipoBaile: string, ciudad: string },
 *     usuario: { nombre: string },
 *     menor: { nombre: string } | null,
 *   },
 *   onViewDetails: (id: string | number) => void,
 * }} props
 */
function EnrollmentCard({ inscripcion, onViewDetails }) {
  const { id, estado, creadoEn, clase, menor } = inscripcion;

  const fechaFormateada = new Date(creadoEn).toLocaleDateString("es-CO");

  return (
    <div className="enrollment-card">
      <div className="enrollment-card__header">
        <h3 className="enrollment-card__title">{clase.tipoBaile}</h3>

        <EnrollmentStatusBadge estado={estado} />
      </div>

      <p className="enrollment-card__subtext">{clase.ciudad}</p>

      {menor && (
        <p className="enrollment-card__note">
          Inscripción de {menor.nombre}
        </p>
      )}

      <p className="enrollment-card__date">{fechaFormateada}</p>

      <div className="enrollment-card__actions">
        <Button
          size="small"
          variant="outline"
          onClick={() => onViewDetails(id)}
        >
          Ver detalles
        </Button>
      </div>
    </div>
  );
}

export default EnrollmentCard;
