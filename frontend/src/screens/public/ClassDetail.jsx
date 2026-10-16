import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getClassById } from "../../services/classes.service";
import { formatearPrecio } from "../../utils/formatCurrency";
import { formatearHorario } from "../../utils/formatDate";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../components/common/Loading/Loading";
import ErrorMessage from "../../components/common/ErrorMessage/ErrorMessage";
import "./ClassDetail.css";

function ClassDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [clase, setClase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelado = false;

    const cargarClase = async () => {
      try {
        setLoading(true);
        setError("");
        setClase(null);

        const respuesta = await getClassById(id);

        if (!cancelado) {
          setClase(
            respuesta?.data?.clase ??
              respuesta?.data ??
              respuesta?.clase ??
              respuesta,
          );
        }
      } catch (err) {
        if (!cancelado) {
          const status = err?.response?.status;

          setError(
            status === 404
              ? "Clase no encontrada"
              : err?.response?.data?.message ||
                  "No se pudo cargar la información de la clase.",
          );
        }
      } finally {
        if (!cancelado) {
          setLoading(false);
        }
      }
    };

    cargarClase();

    return () => {
      cancelado = true;
    };
  }, [id]);

  const handleInscripcion = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    const rol = String(user.rol ?? user.role ?? "").toLowerCase();

    if (rol === "estudiante") {
      navigate(`/estudiante/clases/${id}/inscribir`);
    } else if (rol === "padre") {
      navigate(`/padre/clases/${id}/inscribir`);
    }
  };

  if (loading) {
    return <Loading text="Cargando información de la clase..." />;
  }

  if (error) {
    return (
      <div className="class-detail-page">
        <ErrorMessage message={error} />
        <button type="button" onClick={() => navigate(-1)}>
          Volver
        </button>
      </div>
    );
  }

  if (!clase) {
    return <p>Clase no encontrada</p>;
  }

  const horarios = Array.isArray(clase.horarios) ? clase.horarios : [];
  const cupoMaximo = Number(clase.cupoMaximo) || 0;
  const cupoDisponible = Number(clase.cupoDisponible) || 0;

  const rol = String(user?.rol ?? user?.role ?? "").toLowerCase();
  const puedeInscribirse = !user || ["estudiante", "padre"].includes(rol);

  return (
    <main className="class-detail-page">
      <button
        type="button"
        className="class-detail-back"
        onClick={() => navigate(-1)}
      >
        ← Volver
      </button>

      <section className="class-detail-card">
        <header className="class-detail-header">
          <div>
            <h1>{clase.tipoBaile}</h1>
            <p>{clase.ciudad}</p>
          </div>
          <span className="class-detail-modality">
            {clase.modalidad === "presencial" ? "Presencial" : clase.modalidad}
          </span>
        </header>

        <div className="class-detail-info">
          <p>
            <strong>Instructor:</strong>{" "}
            {clase.instructor?.nombre || "No especificado"}
          </p>

          <p>
            <strong>Precio:</strong> {formatearPrecio(clase.precio)}
          </p>

          <p>
            <strong>Cupos disponibles:</strong> {cupoDisponible} de {cupoMaximo}
          </p>

          <div className="class-detail-schedules">
            <strong>Horarios:</strong>

            {horarios.length > 0 ? (
              <ul>
                {horarios.map((horario, index) => (
                  <li key={`${clase.id}-horario-${index}`}>
                    {formatearHorario(horario) || "Horario no disponible"}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Horario no disponible</p>
            )}
          </div>
        </div>

        {puedeInscribirse && (
          <button
            type="button"
            className="class-detail-enroll"
            onClick={handleInscripcion}
            disabled={Boolean(user) && cupoDisponible <= 0}
          >
            {cupoDisponible <= 0 && user
              ? "Sin cupos disponibles"
              : "Inscribirme"}
          </button>
        )}
      </section>
    </main>
  );
}

export default ClassDetail;
