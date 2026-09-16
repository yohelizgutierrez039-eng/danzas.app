// src/components/payments/PaymentSummary.jsx

import "./PaymentSummary.css";

const formatCOP = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);

/**
 * Bloque resumen de "Pagos y retiros": total de ingresos como cifra
 * destacada y desglose de completados/pendientes/reembolsos debajo.
 * @param {{
 *   totalIngresos: number,
 *   completados: number,
 *   pendientes: number,
 *   reembolsos: number,
 * }} props
 */
function PaymentSummary({ totalIngresos, completados, pendientes, reembolsos }) {
  return (
    <div className="payment-summary">
      <div className="payment-summary__total">
        <span className="payment-summary__total-label">Total de ingresos</span>
        <span className="payment-summary__total-value">{formatCOP(totalIngresos)}</span>
      </div>

      <div className="payment-summary__rows">
        <div className="payment-summary__row">
          <span className="payment-summary__row-label">Completados</span>
          <span className="payment-summary__row-value">{formatCOP(completados)}</span>
        </div>

        <div className="payment-summary__row">
          <span className="payment-summary__row-label">Pendientes</span>
          <span className="payment-summary__row-value">{formatCOP(pendientes)}</span>
        </div>

        <div className="payment-summary__row">
          <span className="payment-summary__row-label">Reembolsos</span>
          <span className="payment-summary__row-value">{formatCOP(reembolsos)}</span>
        </div>
      </div>
    </div>
  );
}

export default PaymentSummary;
