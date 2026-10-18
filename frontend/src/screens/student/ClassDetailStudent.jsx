import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../components/common/Loading/Loading";
import ErrorMessage from "../../components/common/ErrorMessage/ErrorMessage";
import { getClassById } from "../../services/classes.service";
import { formatearHorario } from "../../utils/formatDate";
import { formatearPrecio } from "../../utils/formatCurrency";
import "./ClassDetailStudent.css";

function ClassDetailStudent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [danceClass, setDanceClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadClass = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await getClassById(id);

        if (isActive) {
          setDanceClass(result);
        }
      } catch (err) {
        if (isActive) {
          setError(
            err.status === 404
              ? "No se encontró la clase."
              : err.message ||
                  "No fue posible cargar la información de la clase.",
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

  if (loading) {
    return <Loading text="Cargando clase..." />;
  }

  if (error || !danceClass) {
    return (
      <div className="class-detail-student">
        <ErrorMessage
          message={error || "No se encontró la clase."}
          type="error"
        />
      </div>
    );
  }

  const isClassActive = danceClass.estado === "activa";
  const hasSpots = danceClass.cupoDisponible > 0;

  const getEnrollLabel = () => {
    if (!isClassActive) return "Clase no disponible";
    if (!hasSpots) return "Cupos agotados";

    return "Inscribirme";
  };

  return (
    <div className="class-detail-student">
      <div className="class-detail-student-header">
        <button
          type="button"
          className="student-back-button"
          onClick={() => navigate("/estudiante/clases")}
        >
          ← Volver a mis clases
        </button>

        <div className="student-class-heading">
          <div>
            <span className="student-class-type">{danceClass.tipoBaile}</span>

            <h1>Clase de {danceClass.tipoBaile}</h1>
          </div>

          <span className="student-class-status">
            {isClassActive ? "Disponible" : "No disponible"}
          </span>
        </div>
      </div>

      <div className="class-detail-student-content">
        <div className="class-detail-student-main">
          <section className="student-detail-card">
            <h2>Información de la clase</h2>

            <div className="student-info-grid">
              <div>
                <span>📅 Horario</span>
                {danceClass.horarios.map((horario) => (
                  <strong key={horario.id}>{formatearHorario(horario)}</strong>
                ))}
              </div>

              <div>
                <span>📍 Ciudad</span>
                <strong>{danceClass.ciudad}</strong>
              </div>

              <div>
                <span>🎭 Modalidad</span>
                <strong>
                  {danceClass.modalidad === "virtual" ? "Virtual" : "Presencial"}
                </strong>
              </div>

              <div>
                <span>👥 Cupos disponibles</span>
                <strong>
                  {danceClass.cupoDisponible} de {danceClass.cupoMaximo}
                </strong>
              </div>
            </div>
          </section>

          <section className="student-detail-card">
            <h2>Instructor</h2>

            <div className="student-instructor-info">
              <div className="student-instructor-icon">
                {danceClass.instructor.nombre.charAt(0)}
              </div>

              <div>
                <strong>{danceClass.instructor.nombre}</strong>
                <span>Instructor de danza</span>
              </div>
            </div>
          </section>
        </div>

        <aside className="student-enrollment-card">
          <span>Valor de la clase</span>

          <strong className="student-price">
            {formatearPrecio(danceClass.precio)}
          </strong>

          <span className="student-price-label">por inscripción</span>

          <div className="student-spots">
            <span>Cupos disponibles</span>
            <strong>{danceClass.cupoDisponible}</strong>
          </div>

          <button
            type="button"
            className="student-enroll-button"
            onClick={() =>
              navigate(`/estudiante/clases/${danceClass.id}/inscribir`)
            }
            disabled={!isClassActive || !hasSpots}
          >
            {getEnrollLabel()}
          </button>

          <p className="student-payment-note">
            Después de confirmar la inscripción podrás continuar con el proceso
            de pago.
          </p>
        </aside>
      </div>
    </div>
  );
}

export default ClassDetailStudent;
