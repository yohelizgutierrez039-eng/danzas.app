import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Select from "../../components/common/Select/Select";
import Loading from "../../components/common/Loading/Loading";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import { searchClasses } from "../../services/classes.service";
import { formatearHorario } from "../../utils/formatDate";
import { formatearPrecio } from "../../utils/formatCurrency";
import "./ExploreClassesParent.css";

const danceTypeOptions = [
  { value: "Salsa", label: "Salsa" },
  { value: "Bachata", label: "Bachata" },
  { value: "Danza urbana", label: "Danza urbana" },
  { value: "Contemporánea", label: "Contemporánea" },
  { value: "Folclor", label: "Folclor" },
];

const cityOptions = [
  { value: "Barranquilla", label: "Barranquilla" },
  { value: "Bogotá", label: "Bogotá" },
  { value: "Cali", label: "Cali" },
  { value: "Cartagena", label: "Cartagena" },
  { value: "Medellín", label: "Medellín" },
  { value: "Santa Marta", label: "Santa Marta" },
];

const modalityOptions = [
  { value: "presencial", label: "Presencial" },
  { value: "virtual", label: "Virtual" },
];

function ExploreClassesParent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [danceType, setDanceType] = useState(searchParams.get("tipo") || "");
  const [city, setCity] = useState(searchParams.get("ciudad") || "");
  const [modality, setModality] = useState("");

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // GET /classes/search?tipo=&ciudad=
  useEffect(() => {
    let isActive = true;

    const fetchClasses = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await searchClasses({
          tipo: danceType || undefined,
          ciudad: city || undefined,
        });

        if (isActive) {
          setClasses(Array.isArray(result) ? result : []);
        }
      } catch (fetchError) {
        if (isActive) {
          setError(fetchError?.message || "No se pudieron cargar las clases.");
          setClasses([]);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchClasses();

    return () => {
      isActive = false;
    };
  }, [danceType, city]);

  // El backend filtra por tipo y ciudad; el texto y la modalidad se refinan
  // acá. Solo se muestran las clases activas.
  const filteredClasses = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return classes.filter((danceClass) => {
      const matchesSearch =
        !searchValue ||
        danceClass.tipoBaile?.toLowerCase().includes(searchValue) ||
        danceClass.ciudad?.toLowerCase().includes(searchValue) ||
        danceClass.instructor?.nombre?.toLowerCase().includes(searchValue);

      const matchesModality = !modality || danceClass.modalidad === modality;

      return danceClass.estado === "activa" && matchesSearch && matchesModality;
    });
  }, [classes, search, modality]);

  const clearFilters = () => {
    setSearch("");
    setDanceType("");
    setModality("");
    setCity("");
  };

  const renderClasses = () => {
    if (loading) {
      return <Loading text="Cargando clases..." />;
    }

    if (error) {
      return (
        <EmptyState
          icon="⚠"
          title="No pudimos cargar las clases"
          description={error}
        />
      );
    }

    if (filteredClasses.length === 0) {
      return (
        <EmptyState
          title="No encontramos clases"
          description="Intenta cambiar los filtros o realizar otra búsqueda."
        />
      );
    }

    return (
      <>
        <div className="classes-parent-toolbar">
          <div>
            <strong>{filteredClasses.length}</strong> clases encontradas
          </div>
        </div>

        <div className="parent-classes-grid">
          {filteredClasses.map((danceClass) => (
            <article className="parent-class-card" key={danceClass.id}>
              <div className="parent-class-card-top">
                <span className="dance-type-badge">{danceClass.tipoBaile}</span>

                <span className="modality-badge">
                  {danceClass.modalidad === "virtual" ? "Virtual" : "Presencial"}
                </span>
              </div>

              <div className="parent-class-card-body">
                <h2>Clase de {danceClass.tipoBaile}</h2>

                <div className="parent-class-info">
                  <span>📍 {danceClass.ciudad}</span>
                  <span>👤 {danceClass.instructor.nombre}</span>

                  {danceClass.horarios.map((horario) => (
                    <span key={horario.id}>🕐 {formatearHorario(horario)}</span>
                  ))}
                </div>

                <div className="parent-class-footer">
                  <div>
                    <span className="price-label">Precio</span>
                    <strong>{formatearPrecio(danceClass.precio)}</strong>
                  </div>

                  <span className="available-spots">
                    {danceClass.cupoDisponible} cupos disponibles
                  </span>
                </div>
              </div>

              <div className="parent-class-actions">
                <button
                  type="button"
                  className="details-button"
                  onClick={() => navigate(`/clases/${danceClass.id}`)}
                >
                  Ver detalles
                </button>

                <button
                  type="button"
                  className="enroll-child-button"
                  onClick={() =>
                    navigate(`/padre/clases/${danceClass.id}/inscribir`)
                  }
                  disabled={danceClass.cupoDisponible <= 0}
                >
                  {danceClass.cupoDisponible > 0
                    ? "Inscribir hijo/a"
                    : "Sin cupos"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="explore-classes-parent">
      <div className="explore-parent-header">
        <div>
          <span className="explore-parent-eyebrow">PADRE DE FAMILIA</span>

          <h1>Explorar clases</h1>

          <p>
            Encuentra una clase de danza e inscribe a tu hijo o hija. Podrás
            elegir a quién inscribir en el siguiente paso.
          </p>
        </div>
      </div>

      <section className="parent-filters">
        <div className="parent-search">
          <label htmlFor="class-search">Buscar clase</label>

          <div className="parent-search-input">
            <span>🔎</span>

            <input
              id="class-search"
              type="text"
              placeholder="Tipo de baile, ciudad o instructor..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <Select
          label="Tipo de danza"
          name="danceType"
          value={danceType}
          onChange={(event) => setDanceType(event.target.value)}
          options={danceTypeOptions}
          placeholder="Todos"
        />

        <Select
          label="Modalidad"
          name="modality"
          value={modality}
          onChange={(event) => setModality(event.target.value)}
          options={modalityOptions}
          placeholder="Todas"
        />

        <Select
          label="Ciudad"
          name="city"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          options={cityOptions}
          placeholder="Todas"
        />

        <button
          type="button"
          className="clear-filters-button"
          onClick={clearFilters}
        >
          Limpiar filtros
        </button>
      </section>

      {renderClasses()}

      <section className="parent-info-box">
        <span className="parent-info-icon">ℹ️</span>

        <div>
          <h3>Importante</h3>

          <p>
            Como padre de familia, puedes inscribir a cualquiera de tus hijos
            registrados en una clase. Antes de pagar, podrás revisar
            nuevamente los datos de la inscripción.
          </p>
        </div>
      </section>
    </div>
  );
}

export default ExploreClassesParent;
