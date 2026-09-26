// src/components/enrollments/EnrollmentStatusBadge.jsx

import Badge from "../common/Badge/Badge";

const ESTADO_CONFIG = {
  pendiente_pago: { variant: "warning", label: "Pendiente de pago" },
  confirmada: { variant: "success", label: "Confirmada" },
  cancelada: { variant: "danger", label: "Cancelada" },
};

/**
 * Muestra el estado de una inscripción (Inscripcion.estado) como badge.
 * @param {{ estado: "pendiente_pago" | "confirmada" | "cancelada" }} props
 */
function EnrollmentStatusBadge({ estado }) {
  const config = ESTADO_CONFIG[estado] || ESTADO_CONFIG.pendiente_pago;

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export default EnrollmentStatusBadge;
