// src/components/classes/ClassStatusBadge.jsx

const STATUS_CONFIG = {
  activa: { variant: "success", label: "Activa" },
  cancelada: { variant: "danger", label: "Cancelada" },
  finalizada: { variant: "neutral", label: "Finalizada" },
};

/**
 * Insignia de estado para una clase.
 * Reutiliza las clases `.badge` / `.badge--*` definidas en globals.css.
 *
 * @param {Object} props
 * @param {"activa"|"cancelada"|"finalizada"} props.estado
 */
function ClassStatusBadge({ estado }) {
  const config = STATUS_CONFIG[estado] ?? STATUS_CONFIG.finalizada;

  return (
    <span className={`badge badge--${config.variant}`}>{config.label}</span>
  );
}

export default ClassStatusBadge;
