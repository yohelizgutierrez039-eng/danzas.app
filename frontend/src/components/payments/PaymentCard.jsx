// src/components/payments/PaymentCard.jsx

import Button from "../common/Button/Button";
import PaymentStatusBadge from "./PaymentStatusBadge";

import "./PaymentCard.css";

const formatCOP = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);

/**
 * Tarjeta que resume un pago (Pago). Los pagos en v1.0 son siempre
 * simulados (RF-013), por eso se resalta cuando esSimulado es true para
 * que nadie lo confunda con un cobro real.
 * @param {{
 *   pago: {
 *     id: string | number,
 *     monto: number,
 *     estado: "pendiente" | "aprobado" | "rechazado",
 *     esSimulado: boolean,
 *     reembolsado: boolean,
 *     procesadoEn: string | Date | null,
 *     inscripcion: {
 *       clase: { tipoBaile: string },
 *       usuario: { nombre: string },
 *     },
 *   },
 *   onViewDetails: (id: string | number) => void,
 * }} props
 */
function PaymentCard({ pago, onViewDetails }) {
  const { id, monto, estado, esSimulado, reembolsado, procesadoEn, inscripcion } = pago;

  return (
    <div className="payment-card">
      <div className="payment-card__header">
        <h3 className="payment-card__title">{inscripcion.clase.tipoBaile}</h3>

        <PaymentStatusBadge estado={estado} />
      </div>

      <p className="payment-card__subtext">{inscripcion.usuario.nombre}</p>

      <p className="payment-card__amount">{formatCOP(monto)}</p>

      <div className="payment-card__notes">
        {esSimulado && (
          <span className="payment-card__note payment-card__note--info">
            Pago simulado
          </span>
        )}

        {reembolsado && (
          <span className="payment-card__note payment-card__note--warning">
            Reembolsado
          </span>
        )}
      </div>

      {procesadoEn && (
        <p className="payment-card__date">
          {new Date(procesadoEn).toLocaleDateString("es-CO")}
        </p>
      )}

      <div className="payment-card__actions">
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

export default PaymentCard;
