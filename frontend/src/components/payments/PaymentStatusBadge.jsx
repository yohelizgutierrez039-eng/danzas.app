// src/components/payments/PaymentStatusBadge.jsx

const ESTADO_CONFIG = {
  pendiente: { variant: "warning", label: "Pendiente" },
  aprobado: { variant: "success", label: "Aprobado" },
  rechazado: { variant: "danger", label: "Rechazado" },
};

/**
 * Muestra el estado de un pago (Pago.estado) como badge.
 * @param {{ estado: "pendiente" | "aprobado" | "rechazado" }} props
 */
function PaymentStatusBadge({ estado }) {
  const config = ESTADO_CONFIG[estado] || ESTADO_CONFIG.pendiente;

  return <span className={`badge badge--${config.variant}`}>{config.label}</span>;
}

export default PaymentStatusBadge;
