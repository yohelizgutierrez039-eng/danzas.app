import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchClasses } from "../../services/classes.service";
import { formatearHorario } from "../../utils/formatDate";
import { formatearPrecio } from "../../utils/formatCurrency";
import Loading from "../../components/common/Loading/Loading";
import ErrorMessage from "../../components/common/ErrorMessage/ErrorMessage";
import "./ExploreClasses.css";

function obtenerClases(respuesta) {
  const data = respuesta?.data ?? respuesta;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.clases)) return data.clases;
  if (Array.isArray(data?.classes)) return data.classes;

  return [];
}

function ExploreClasses() {
  const navigate = useNavigate();

  const [tipo, setTipo] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargarClases = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const respuesta = await searchClasses({ tipo, ciudad });
      setClases(obtenerClases(respuesta));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "No se pudieron cargar las clases. Intenta nuevamente.",
      );
      setClases([]);
    } finally {
      setLoading(false);
    }
  }, [tipo, ciudad]);

  useEffect(() => {
    cargarClases();
  }, [cargarClases]);

  const clasesActivas = clases.filter(
    (clase) => String(clase.estado ?? "").toLowerCase() === "activa",
  );

  const buscar = (event) => {
    event.preventDefault();
    cargarClases();
  };

  return (
    <main className="explore-classes-page">
      <header className="explore-classes-header">
        <h1>Explora las clases</h1>
        <p>Encuentra una clase de baile que se adapte a ti.</p>
      </header>

      <form className="explore-classes-filters" onSubmit={buscar}>
        <label>
          Tipo de baile
          <input
            type="text"
            value={tipo}
            onChange={(event) => setTipo(event.target.value)}
            placeholder="Ej. Salsa"
          />
        </label>

        <label>
          Ciudad
          <input
            type="text"
            value={ciudad}
            onChange={(event) => setCiudad(event.target.value)}
            placeholder="Ej. Guamal"
          />
        </label>

        <button type="submit" disabled={loading}>
          Buscar
        </button>
      </form>

      {error && (
        <div role="alert">
          <ErrorMessage message={error} />
        </div>
      )}

      {loading ? (
        <Loading text="Cargando clases..." />
      ) : clasesActivas.length === 0 ? (
        <section className="explore-classes-empty">
          <h2>No se encontraron clases</h2>
          <p>
            No hay clases activas que coincidan con tu búsqueda. Prueba con otro
            tipo de baile o ciudad.
          </p>
        </section>
      ) : (
        <section className="explore-classes-grid">
          {clasesActivas.map((clase) => {
            const horarios = Array.isArray(clase.horarios)
              ? clase.horarios
              : [];

            return (
              <article className="explore-class-card" key={clase.id}>
                <div className="explore-class-card-header">
                  <h2>{clase.tipoBaile}</h2>
                  <span>
                    {clase.modalidad === "presencial"
                      ? "Presencial"
                      : clase.modalidad}
                  </span>
                </div>

                <p>
                  <strong>Ciudad:</strong> {clase.ciudad}
                </p>

                <div>
                  <strong>Horario:</strong>
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

                <p>
                  <strong>Precio:</strong> {formatearPrecio(clase.precio)}
                </p>

                <p>
                  <strong>Cupos disponibles:</strong>{" "}
                  {Number(clase.cupoDisponible) || 0} de{" "}
                  {Number(clase.cupoMaximo) || 0}
                </p>

                <button
                  type="button"
                  onClick={() => navigate(`/clases/${clase.id}`)}
                >
                  Ver detalles
                </button>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

export default ExploreClasses;
