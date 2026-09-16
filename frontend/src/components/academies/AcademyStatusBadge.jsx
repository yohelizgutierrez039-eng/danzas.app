// src/components/academies/AcademyStatusBadge.jsx

const STATUS_CONFIG = {
  pendiente: { variant: "warning", label: "Pendiente" },
  aprobada: { variant: "success", label: "Aprobada" },
  rechazada: { variant: "danger", label: "Rechazada" },
};

/**
 * Insignia de estado para una solicitud de academia.
 * Reutiliza las clases `.badge` / `.badge--*` definidas en globals.css.
 *
 * @param {Object} props
 * @param {"pendiente"|"aprobada"|"rechazada"} props.estado
 */
function AcademyStatusBadge({ estado }) {
  const config = STATUS_CONFIG[estado] ?? STATUS_CONFIG.pendiente;

  return (
    <span className={`badge badge--${config.variant}`}>{config.label}</span>
  );
}

export default AcademyStatusBadge;
