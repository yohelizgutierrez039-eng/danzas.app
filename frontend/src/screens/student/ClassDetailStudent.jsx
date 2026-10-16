import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getClassById } from "../../services/classes.service";
import { formatearPrecio } from "../../utils/formatCurrency";
import { formatearHorario } from "../../utils/formatDate";
import Loading from "../../components/common/Loading/Loading";
import ErrorMessage from "../../components/common/ErrorMessage/ErrorMessage";
import "./ClassDetailStudent.css";

function ClassDetailStudent() {
  const { id } = useParams();
  const navigate = useNavigate();

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
          setError(
            err?.response?.status === 404
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

  if (loading) {
    return <Loading text="Cargando información de la clase..." />;
  }

  if (error) {
    return (
      <div className="class-detail-student-page">
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
  const cupoDisponible = Number(clase.cupoDisponible) || 0;
  const estado = String(clase.estado ?? "").toLowerCase();
  const claseActiva = estado === "activa";
  const puedeInscribirse = claseActiva && cupoDisponible > 0;

  let motivoBloqueo = "";

  if (cupoDisponible <= 0) {
    motivoBloqueo = "Esta clase no tiene cupos disponibles.";
  } else if (!claseActiva) {
    motivoBloqueo = "Esta clase no está activa y no admite inscripciones.";
  }

  const handleInscripcion = () => {
    if (!puedeInscribirse) return;
    navigate(`/estudiante/clases/${id}/inscribir`);
  };

  return (
    <main className="class-detail-student-page">
      <button
        type="button"
        className="class-detail-student-back"
        onClick={() => navigate(-1)}
      >
        ← Volver
      </button>

      <section className="class-detail-student-card">
        <header className="class-detail-student-header">
          <div>
            <h1>{clase.tipoBaile}</h1>
            <p>{clase.ciudad}</p>
          </div>

          <span className="class-detail-student-status">
            {clase.estado || "Sin estado"}
          </span>
        </header>

        <div className="class-detail-student-info">
          <p>
            <strong>Instructor:</strong>{" "}
            {clase.instructor?.nombre || "No especificado"}
          </p>

          <p>
            <strong>Modalidad:</strong>{" "}
            {clase.modalidad === "presencial"
              ? "Presencial"
              : clase.modalidad || "No especificada"}
          </p>

          <p>
            <strong>Precio:</strong> {formatearPrecio(clase.precio)}
          </p>

          <p>
            <strong>Cupos disponibles:</strong> {cupoDisponible}
          </p>

          <div>
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

        {!puedeInscribirse && (
          <p className="class-detail-student-warning" role="status">
            {motivoBloqueo}
          </p>
        )}

        <button
          type="button"
          className="class-detail-student-enroll"
          onClick={handleInscripcion}
          disabled={!puedeInscribirse}
        >
          Inscribirme
        </button>
      </section>
    </main>
  );
}

export default ClassDetailStudent;
