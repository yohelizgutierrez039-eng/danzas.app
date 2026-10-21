import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../components/common/Loading/Loading";
import ErrorMessage from "../../components/common/ErrorMessage/ErrorMessage";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import Select from "../../components/common/Select/Select";
import useAuth from "../../hooks/useAuth";
import {
  buildCheckoutRoute,
  createEnrollment,
} from "../../services/enrollments.service";
import { getClassById } from "../../services/classes.service";
import { getDependents } from "../../services/users.service";
import { formatearHorario } from "../../utils/formatDate";
import { formatearPrecio } from "../../utils/formatCurrency";
import "./EnrollmentProcess.css";

function EnrollmentProcess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // El padre inscribe a uno de sus menores; el estudiante, a sí mismo.
  const isParent = user?.rol === "padre";
  const basePath = isParent ? "/padre" : "/estudiante";

  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dependents, setDependents] = useState([]);
  const [dependentsLoading, setDependentsLoading] = useState(isParent);
  const [dependentsError, setDependentsError] = useState("");
  const [dependentsAttempt, setDependentsAttempt] = useState(0);
  const [chosenChildId, setChosenChildId] = useState("");
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

  useEffect(() => {
    if (!isParent) {
      return;
    }

    let isActive = true;

    const loadDependents = async () => {
      try {
        const data = await getDependents();

        if (isActive) {
          setDependents(data.dependents ?? []);
        }
      } catch (err) {
        if (isActive) {
          setDependentsError(
            err.message || "No fue posible cargar tus menores.",
          );
        }
      } finally {
        if (isActive) {
          setDependentsLoading(false);
        }
      }
    };

    loadDependents();

    return () => {
      isActive = false;
    };
  }, [isParent, dependentsAttempt]);

  const handleRetryDependents = () => {
    setDependentsError("");
    setDependentsLoading(true);
    setDependentsAttempt((attempt) => attempt + 1);
  };

  // Con un solo menor registrado no hace falta elegir.
  const childId =
    chosenChildId || (dependents.length === 1 ? dependents[0].id : "");

  const handleEnrollment = async () => {
    try {
      setEnrolling(true);
      setError("");

      // POST /enrollments (el estudiante sale del token; el padre envía su menor).
      const response = await createEnrollment({
        claseId: classData.id,
        menorId: isParent ? childId : undefined,
      });

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
        basePath,
        clase: { nombre: classData.tipoBaile, precio: classData.precio },
      });

      if (checkout) {
        navigate(checkout.path, { state: checkout.state });
        return;
      }

      navigate(`${basePath}/inscripciones`);
    } catch (err) {
      setError(err.message || "No fue posible realizar la inscripción.");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading || dependentsLoading) {
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

  if (isParent && dependentsError) {
    return (
      <div className="enrollment-process">
        <EmptyState
          icon="⚠"
          title="No pudimos cargar tus menores"
          description={dependentsError}
          actionText="Reintentar"
          onAction={handleRetryDependents}
        />
      </div>
    );
  }

  if (isParent && dependents.length === 0) {
    return (
      <div className="enrollment-process">
        <EmptyState
          title="Primero registra a tu hijo/a"
          description="Para inscribir a un menor en una clase, antes debes registrarlo en tu cuenta."
          actionText="Registrar menor"
          onAction={() => navigate("/padre/menores/nuevo")}
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
          onClick={() =>
            navigate(isParent ? `/clases/${id}` : `/estudiante/clases/${id}`)
          }
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

            {isParent && (
              <section className="enrollment-card">
                <h2>¿A quién vas a inscribir?</h2>

                <Select
                  label="Hijo/a"
                  name="childId"
                  value={childId}
                  onChange={(event) => setChosenChildId(event.target.value)}
                  options={dependents.map((menor) => ({
                    value: menor.id,
                    label: menor.nombre,
                  }))}
                  placeholder="Selecciona un hijo/a"
                  required
                />
              </section>
            )}

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
              disabled={enrolling || (isParent && !childId)}
            >
              {enrolling ? "Procesando..." : "Confirmar y continuar al pago"}
            </button>

            <p className="summary-note">
              {isParent
                ? "Al continuar confirmas que deseas inscribir a tu hijo/a en esta clase."
                : "Al continuar confirmas que deseas inscribirte en esta clase."}
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default EnrollmentProcess;
