import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Loading from "../../components/common/Loading/Loading";
import ErrorMessage from "../../components/common/ErrorMessage/ErrorMessage";
import useClasses from "../../hooks/useClasses";

import { formatearHorario } from "../../utils/formatDate";
import { formatearPrecio } from "../../utils/formatCurrency";

import "./MyClasses.css";

const obtenerClases = (response) => {
  const data = response?.data ?? response;
  return Array.isArray(data) ? data : (data?.clases ?? data?.classes ?? []);
};

const obtenerEstado = (estado) => {
  const estados = {
    activa: "Activa",
    cancelada: "Cancelada",
    finalizada: "Finalizada",
  };

  return estados[String(estado ?? "").toLowerCase()] ?? estado ?? "Sin estado";
};

function MyClasses() {
  const navigate = useNavigate();
  const { getMine, remove } = useClasses();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelandoId, setCancelandoId] = useState(null);

  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMine();
      setClasses(obtenerClases(response));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudieron cargar tus clases.",
      );
    } finally {
      setLoading(false);
    }
  }, [getMine]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const handleCancelClass = async (clase) => {
    const estado = String(clase.estado ?? "").toLowerCase();

    if (estado !== "activa") return;

    const confirmar = window.confirm(
      `¿Estás segura de que deseas cancelar la clase de ${clase.tipoBaile} en ${clase.ciudad}?`,
    );

    if (!confirmar) return;

    try {
      setCancelandoId(clase.id);
      setError("");

      await remove(clase.id);
      await loadClasses();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo cancelar la clase.",
      );
    } finally {
      setCancelandoId(null);
    }
  };

  if (loading) {
    return <Loading text="Cargando tus clases..." />;
  }

  return (
    <div className="my-classes-page">
      <div className="my-classes-header">
        <div>
          <span className="my-classes-eyebrow">GESTIÓN DE CLASES</span>
          <h1>Mis clases</h1>
          <p>Consulta y administra tus clases en Danzas.app.</p>
        </div>

        <button
          type="button"
          className="my-classes-create-button"
          onClick={() => navigate("/instructor/clases/nueva")}
        >
          <span>+</span> Nueva clase
        </button>
      </div>

      {error && (
        <div role="alert" className="my-classes-error">
          <ErrorMessage message={error} />
        </div>
      )}

      {classes.length === 0 ? (
        <div className="my-classes-empty">
          <h2>Todavía no tienes clases</h2>
          <p>
            Crea tu primera clase para que los estudiantes puedan encontrarla.
          </p>

          <button
            type="button"
            className="my-classes-create-button"
            onClick={() => navigate("/instructor/clases/nueva")}
          >
            Crear mi primera clase
          </button>
        </div>
      ) : (
        <div className="my-classes-grid">
          {classes.map((clase) => {
            const activa =
              String(clase.estado ?? "").toLowerCase() === "activa";

            const cupoMaximo = Number(clase.cupoMaximo) || 0;
            const cupoDisponible = Number(clase.cupoDisponible) || 0;
            const inscritos = Math.max(0, cupoMaximo - cupoDisponible);

            const horarios = Array.isArray(clase.horarios)
              ? clase.horarios
              : [];

            return (
              <article className="my-classes-card" key={clase.id}>
                <div className="my-classes-card-header">
                  <div>
                    <h2>{clase.tipoBaile}</h2>
                    <p>{clase.ciudad}</p>
                  </div>

                  <span
                    className={`my-classes-status ${
                      activa ? "is-active" : "is-inactive"
                    }`}
                  >
                    {obtenerEstado(clase.estado)}
                  </span>
                </div>

                <div className="my-classes-details">
                  <p>
                    <strong>Modalidad:</strong>{" "}
                    {clase.modalidad === "presencial"
                      ? "Presencial"
                      : clase.modalidad}
                  </p>

                  <div>
                    <strong>Horario:</strong>

                    {horarios.length > 0 ? (
                      <ul className="my-classes-schedules">
                        {horarios.map((horario, index) => (
                          <li key={`${clase.id}-horario-${index}`}>
                            {formatearHorario(horario) ||
                              "Horario no disponible"}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>Horario no disponible</p>
                    )}
                  </div>

                  <p>
                    <strong>Precio:</strong> {formatearPrecio(clase.precio)}
                  </p>

                  <p>
                    <strong>Estudiantes inscritos:</strong> {inscritos} de{" "}
                    {cupoMaximo}
                  </p>

                  <p>
                    <strong>Cupos disponibles:</strong> {cupoDisponible}
                  </p>
                </div>

                <div className="my-classes-card-actions">
                  <button
                    type="button"
                    className="my-classes-view-button"
                    onClick={() => navigate(`/instructor/clases/${clase.id}`)}
                  >
                    Ver detalles
                  </button>

                  {activa && (
                    <>
                      <button
                        type="button"
                        className="my-classes-edit-button"
                        onClick={() =>
                          navigate(`/instructor/clases/${clase.id}/editar`)
                        }
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="my-classes-cancel-button"
                        disabled={cancelandoId === clase.id}
                        onClick={() => handleCancelClass(clase)}
                      >
                        {cancelandoId === clase.id
                          ? "Cancelando..."
                          : "Cancelar clase"}
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyClasses;
