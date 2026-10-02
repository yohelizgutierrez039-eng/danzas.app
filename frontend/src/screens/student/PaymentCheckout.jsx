import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Loading from "../../components/common/Loading/Loading";
import Button from "../../components/common/Button/Button";
import useAuth from "../../hooks/useAuth";
import {
  getEnrollmentHistory,
  simulatePayment,
  unwrapEnrollment,
} from "../../services/enrollments.service";
import "./PaymentCheckout.css";

const formatMoney = (value) => `$${Number(value || 0).toLocaleString("es-CO")}`;

const getClassName = (enrollment) =>
  enrollment?.clase?.nombre ||
  enrollment?.clase?.titulo ||
  enrollment?.clase?.tipoBaile ||
  "Clase de danza";

const getAmount = (enrollment) =>
  enrollment?.clase?.precio ?? enrollment?.monto ?? 0;

/*
 * El backend responde algo como:
 * { pago: { estado: "aprobado" | "rechazado", referencia, monto },
 *   inscripcion: { id, estado: "confirmada" | "cancelada" } }
 * Se aceptan tambien `paymentStatus` / `receiptId` por compatibilidad.
 */
const getPaymentStatus = (result) => {
  const status = result?.pago?.estado || result?.paymentStatus;

  if (status) return status;

  if (result?.inscripcion?.estado === "confirmada") return "aprobado";
  if (result?.inscripcion?.estado === "cancelada") return "rechazado";

  return null;
};

const getReceipt = (result) =>
  result?.pago?.referencia ||
  result?.receiptId ||
  (result?.pago?.id ? `PAGO-${result.pago.id}` : "-");

function PaymentCheckout() {
  const { enrollmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const basePath = user?.rol === "padre" ? "/padre" : "/estudiante";
  const enrollmentsPath = `${basePath}/inscripciones`;

  // Al llegar desde la inscripcion la informacion viaja en el state del router;
  // si se recarga la pagina se recupera desde el historial (solo estudiante).
  const stateEnrollment = location.state?.enrollment
    ? unwrapEnrollment(location.state.enrollment)
    : null;
  const canRecover = !stateEnrollment && user?.rol !== "padre" && user?.id;

  const [enrollment, setEnrollment] = useState(stateEnrollment);
  const [loadingEnrollment, setLoadingEnrollment] = useState(
    Boolean(canRecover),
  );
  const [paying, setPaying] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [error, setError] = useState("");

  const userId = user?.id;

  useEffect(() => {
    if (!canRecover) {
      return;
    }

    let cancelled = false;

    const recoverEnrollment = async () => {
      try {
        const data = await getEnrollmentHistory(userId);
        const list = Array.isArray(data) ? data : data?.enrollments || [];
        const found = list.find((item) => String(item.id) === enrollmentId);

        if (!cancelled) setEnrollment(found || null);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "No fue posible cargar la inscripción.");
        }
      } finally {
        if (!cancelled) setLoadingEnrollment(false);
      }
    };

    recoverEnrollment();

    return () => {
      cancelled = true;
    };
  }, [canRecover, userId, enrollmentId]);

  const handlePayment = async () => {
    try {
      setPaying(true);
      setError("");

      // POST /enrollments/:id/simulate-payment
      const result = await simulatePayment(enrollmentId);

      setPaymentResult(result);
    } catch (err) {
      setError(err.message || "No fue posible procesar el pago.");
    } finally {
      setPaying(false);
    }
  };

  if (loadingEnrollment) {
    return (
      <div className="checkout-page">
        <Loading text="Cargando inscripción..." />
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="checkout-page">
        <div className="checkout-card">
          <h2>Inscripción no encontrada</h2>
          <p className="checkout-description">
            {error ||
              "No se encontró la información de la inscripción pendiente."}
          </p>

          <Button onClick={() => navigate(enrollmentsPath)}>
            Volver a mis inscripciones
          </Button>
        </div>
      </div>
    );
  }

  const paymentStatus = getPaymentStatus(paymentResult);

  if (paymentStatus === "aprobado") {
    return (
      <div className="checkout-page">
        <div className="checkout-card checkout-success">
          <div className="checkout-success-icon">✓</div>

          <h1>¡Pago aprobado!</h1>

          <p className="checkout-description">
            Tu inscripción fue confirmada correctamente.
          </p>

          <div className="checkout-box">
            <h2>Comprobante de pago</h2>

            <div className="checkout-row">
              <span>Clase</span>
              <strong>{getClassName(enrollment)}</strong>
            </div>

            <div className="checkout-row">
              <span>Monto</span>
              <strong>
                {formatMoney(paymentResult?.pago?.monto ?? getAmount(enrollment))}
              </strong>
            </div>

            <div className="checkout-row">
              <span>Fecha</span>
              <strong>{new Date().toLocaleDateString("es-CO")}</strong>
            </div>

            <div className="checkout-row">
              <span>Comprobante</span>
              <strong>{getReceipt(paymentResult)}</strong>
            </div>
          </div>

          <Button onClick={() => navigate(enrollmentsPath)}>
            Ir a mis inscripciones
          </Button>
        </div>
      </div>
    );
  }

  if (paymentStatus === "rechazado") {
    return (
      <div className="checkout-page">
        <div className="checkout-card checkout-rejected">
          <h1>Pago rechazado</h1>

          <p className="checkout-description">
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
    <div className="checkout-page">
      <div className="checkout-card">
        <h1>Confirmar inscripción</h1>

        <p className="checkout-description">
          Revisa los datos de tu inscripción antes de confirmar el pago.
        </p>

        <div className="checkout-box">
          <h2>Resumen de la inscripción</h2>

          <div className="checkout-row">
            <span>Clase</span>
            <strong>{getClassName(enrollment)}</strong>
          </div>

          <div className="checkout-row">
            <span>Precio</span>
            <strong>{formatMoney(getAmount(enrollment))}</strong>
          </div>

          <div className="checkout-row">
            <span>Fecha</span>
            <strong>{new Date().toLocaleDateString("es-CO")}</strong>
          </div>
        </div>

        {error && (
          <div className="checkout-error" role="alert">
            {error}
          </div>
        )}

        <Button onClick={handlePayment} loading={paying}>
          Confirmar pago (simulado)
        </Button>
      </div>
    </div>
  );
}

export default PaymentCheckout;
