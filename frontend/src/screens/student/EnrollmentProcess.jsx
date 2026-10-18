import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../components/common/Loading/Loading";
import ErrorMessage from "../../components/common/ErrorMessage/ErrorMessage";
import {
  buildCheckoutRoute,
  createEnrollment,
} from "../../services/enrollments.service";
import { getClassById } from "../../services/classes.service";
import { formatearHorario } from "../../utils/formatDate";
import { formatearPrecio } from "../../utils/formatCurrency";
import "./EnrollmentProcess.css";

function EnrollmentProcess() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadClass = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await getClassById(id);

        if (isActive) {
          setClassData(result);
        }
      } catch (err) {
        if (isActive) {
          setError(
            err.status === 404
              ? "No se encontró la clase."
              : err.message || "No fue posible cargar la información.",
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadClass();

    return () => {
      isActive = false;
    };
  }, [id]);

  const handleEnrollment = async () => {
    try {
      setEnrolling(true);
      setError("");

      // POST /enrollments/:claseId (el estudiante sale del token).
      const response = await createEnrollment({ claseId: classData.id });

      /*
       * El backend puede devolver paymentUrl
       * para continuar con el pago.
       */
      if (response?.paymentUrl) {
        window.location.href = response.paymentUrl;
        return;
      }

      // Cupo reservado: continuar al checkout para confirmar el pago.
      const checkout = buildCheckoutRoute(response, {
        basePath: "/estudiante",
        clase: { nombre: classData.tipoBaile, precio: classData.precio },
      });

      if (checkout) {
        navigate(checkout.path, { state: checkout.state });
        return;
      }

      navigate("/estudiante/inscripciones");
    } catch (err) {
      setError(err.message || "No fue posible realizar la inscripción.");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <Loading text="Preparando inscripción..." />;
  }

  if (!classData) {
    return (
      <div className="enrollment-process">
        <ErrorMessage
          message={error || "No se encontró la clase."}
          type="error"
        />
      </div>
    );
  }

  return (
    <div className="enrollment-process">
      <div className="enrollment-process-container">
        <button
          type="button"
          className="enrollment-back"
          onClick={() => navigate(`/estudiante/clases/${id}`)}
        >
          ← Volver al detalle
        </button>

        <div className="enrollment-header">
          <span>Inscripción</span>
          <h1>Confirma tu inscripción</h1>
          <p>Revisa la información antes de continuar con el pago.</p>
        </div>

        {error && (
          <ErrorMessage
            message={error}
            type="error"
            onClose={() => setError("")}
          />
        )}

        <div className="enrollment-layout">
          <main className="enrollment-main">
            <section className="enrollment-card">
              <div className="enrollment-card-title">
                <div className="enrollment-class-icon">
                  {classData.tipoBaile.charAt(0)}
                </div>

                <div>
                  <h2>Clase de {classData.tipoBaile}</h2>
                  <span>
                    {classData.modalidad === "virtual"
                      ? "Virtual"
                      : "Presencial"}
                  </span>
                </div>
              </div>

              <div className="enrollment-details">
                <div>
                  <span>Instructor</span>
                  <strong>{classData.instructor.nombre}</strong>
                </div>

                <div>
                  <span>Ciudad</span>
                  <strong>{classData.ciudad}</strong>
                </div>

                <div>
                  <span>Horario</span>
                  {classData.horarios.map((horario) => (
                    <strong key={horario.id}>{formatearHorario(horario)}</strong>
                  ))}
                </div>
              </div>
            </section>

            <section className="enrollment-card enrollment-payment-info">
              <h2>Proceso de pago</h2>

              <p>
                Al confirmar la inscripción serás dirigido al proveedor de pago
                para completar el proceso.
              </p>

              <div className="payment-security">
                <span>🔒</span>
                <div>
                  <strong>Pago seguro</strong>
                  <p>
                    El pago será procesado mediante el proveedor externo
                    configurado por Danzas.app.
                  </p>
                </div>
              </div>
            </section>
          </main>

          <aside className="enrollment-summary">
            <h2>Resumen</h2>

            <div className="summary-class">
              <span>Clase</span>
              <strong>Clase de {classData.tipoBaile}</strong>
            </div>

            <div className="summary-row">
              <span>Inscripción</span>
              <strong>{formatearPrecio(classData.precio)}</strong>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-total">
              <span>Total</span>
              <strong>{formatearPrecio(classData.precio)}</strong>
            </div>

            <button
              type="button"
              className="enrollment-confirm-button"
              onClick={handleEnrollment}
              disabled={enrolling}
            >
              {enrolling ? "Procesando..." : "Confirmar y continuar al pago"}
            </button>

            <p className="summary-note">
              Al continuar confirmas que deseas inscribirte en esta clase.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default EnrollmentProcess;
