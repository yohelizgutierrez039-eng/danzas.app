import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { simulatePayment } from "../../services/enrollments.service";
import Loading from "../../components/common/Loading";
import Button from "../../components/common/Button";
import "./PaymentCheckout.css";

const PaymentCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const enrollment = location.state?.enrollment;

  const [loading, setLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [error, setError] = useState("");

  if (!enrollment) {
    return (
      <div className="payment-checkout">
        <div className="payment-card">
          <h2>Inscripción no encontrada</h2>
          <p>No se encontró la información de la inscripción pendiente.</p>

          <Button onClick={() => navigate("/estudiante/inscripciones")}>
            Volver a mis inscripciones
          </Button>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await simulatePayment(enrollment.id);

      setPaymentResult(result);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "No fue posible procesar el pago.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-checkout">
        <Loading />
      </div>
    );
  }

  if (paymentResult?.paymentStatus === "aprobado") {
    return (
      <div className="payment-checkout">
        <div className="payment-card payment-success">
          <div className="payment-success-icon">✓</div>

          <h1>¡Pago aprobado!</h1>

          <p className="payment-success-message">
            Tu inscripción fue confirmada correctamente.
          </p>

          <div className="payment-receipt">
            <h2>Comprobante de pago</h2>

            <div className="receipt-row">
              <span>Clase</span>
              <strong>
                {enrollment.clase?.nombre || enrollment.clase?.titulo}
              </strong>
            </div>

            <div className="receipt-row">
              <span>Monto</span>
              <strong>
                $
                {Number(
                  enrollment.clase?.precio || enrollment.monto || 0,
                ).toLocaleString("es-CO")}
              </strong>
            </div>

            <div className="receipt-row">
              <span>Fecha</span>
              <strong>{new Date().toLocaleDateString("es-CO")}</strong>
            </div>

            <div className="receipt-row">
              <span>Comprobante</span>
              <strong>{paymentResult.receiptId}</strong>
            </div>
          </div>

          <Button onClick={() => navigate("/estudiante/inscripciones")}>
            Ir a mis inscripciones
          </Button>
        </div>
      </div>
    );
  }

  if (paymentResult?.paymentStatus === "rechazado") {
    return (
      <div className="payment-checkout">
        <div className="payment-card payment-rejected">
          <h1>Pago rechazado</h1>

          <p>
            El pago no pudo ser aprobado. El cupo de la clase fue liberado, por
            lo que puedes volver a realizar la inscripción desde cero.
          </p>

          <Button onClick={() => navigate("/clases")}>
            Volver a intentar la inscripción
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-checkout">
      <div className="payment-card">
        <h1>Confirmar inscripción</h1>

        <p className="payment-description">
          Revisa los datos de tu inscripción antes de confirmar el pago.
        </p>

        <div className="enrollment-summary">
          <h2>Resumen de la inscripción</h2>

          <div className="summary-row">
            <span>Clase</span>
            <strong>
              {enrollment.clase?.nombre || enrollment.clase?.titulo}
            </strong>
          </div>

          <div className="summary-row">
            <span>Precio</span>
            <strong>
              $
              {Number(
                enrollment.clase?.precio || enrollment.monto || 0,
              ).toLocaleString("es-CO")}
            </strong>
          </div>

          <div className="summary-row">
            <span>Fecha</span>
            <strong>
              {enrollment.clase?.fecha
                ? new Date(enrollment.clase.fecha).toLocaleDateString("es-CO")
                : new Date().toLocaleDateString("es-CO")}
            </strong>
          </div>
        </div>

        {error && <div className="payment-error">{error}</div>}

        <Button onClick={handlePayment}>Confirmar pago (simulado)</Button>
      </div>
    </div>
  );
};

export default PaymentCheckout;
