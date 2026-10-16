import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getClassById } from "../../services/classes.service";
import { formatearPrecio } from "../../utils/formatCurrency";
import { formatearHorario } from "../../utils/formatDate";
import { createEnrollment } from "../../services/enrollments.service";
import Loading from "../../components/common/Loading/Loading";
import ErrorMessage from "../../components/common/ErrorMessage/ErrorMessage";
import "./EnrollmentProcess.css";

function EnrollmentProcess() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [clase, setClase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reservando, setReservando] = useState(false);

  useEffect(() => {
    let cancelado = false;

    const cargarClase = async () => {
      try {
        setLoading(true);
        setError("");

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

  const handleInscripcion = async () => {
    if (!clase || reservando) return;

    try {
      setReservando(true);
      setError("");

      // Mantén aquí el mismo llamado a createEnrollment que ya funciona.
      const respuesta = await createEnrollment({
        claseId: clase.id,
      });

      const inscripcion =
        respuesta?.data?.inscripcion ??
        respuesta?.data ??
        respuesta?.inscripcion ??
        respuesta;

      const enrollmentId = inscripcion?.id ?? inscripcion?.enrollmentId;

      if (!enrollmentId) {
        throw new Error("No se recibió el identificador de la inscripción.");
      }

      // Mantén la redirección al checkout.
      navigate(`/estudiante/clases/${id}/inscribir/pago`, {
        state: { enrollmentId },
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo reservar el cupo.",
      );
    } finally {
      setReservando(false);
    }
  };

  if (loading) {
    return <Loading text="Cargando información de la clase..." />;
  }

  if (error && !clase) {
    return (
      <div className="enrollment-process-page">
        <ErrorMessage message={error} />
        <button type="button" onClick={() => navigate(-1)}>
          Volver
        </button>
      </div>
    );
  }

  if (!clase) {
    return <p>Clase no encontrada.</p>;
  }

  const horarios = Array.isArray(clase.horarios) ? clase.horarios : [];

  return (
    <main className="enrollment-process-page">
      <button type="button" onClick={() => navigate(-1)}>
        ← Volver
      </button>

      <section className="enrollment-process-card">
        <h1>Confirmar inscripción</h1>
        <p>Revisa los datos de la clase antes de continuar.</p>

        <div className="enrollment-process-summary">
          <h2>{clase.tipoBaile}</h2>

          <p>
            <strong>Ciudad:</strong> {clase.ciudad || "No especificada"}
          </p>

          <p>
            <strong>Instructor:</strong>{" "}
            {clase.instructor?.nombre || "No especificado"}
          </p>

          <p>
            <strong>Precio:</strong> {formatearPrecio(clase.precio)}
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

        {error && <ErrorMessage message={error} />}

        <button type="button" onClick={handleInscripcion} disabled={reservando}>
          {reservando ? "Reservando cupo..." : "Reservar cupo y continuar"}
        </button>
      </section>
    </main>
  );
}

export default EnrollmentProcess;
