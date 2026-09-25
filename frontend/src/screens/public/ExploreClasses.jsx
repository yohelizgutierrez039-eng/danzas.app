import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "../../components/common/Select/Select";
import Loading from "../../components/common/Loading/Loading";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import { searchClasses } from "../../services/classes.service";
import "./ExploreClasses.css";

function ExploreClasses() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [danceType, setDanceType] = useState("");
  const [city, setCity] = useState("");
  const [modality, setModality] = useState("");

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /*
    Conectado al backend real.

    Endpoint:
    GET /classes/search?tipo=&ciudad=
  */
  useEffect(() => {
    let isActive = true;

    const fetchClasses = async () => {
      setLoading(true);
      setError(null);

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
          setError(
            fetchError?.message || "No se pudieron cargar las clases."
          );
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

  const danceTypeOptions = [
    { value: "", label: "Todos los tipos" },
    { value: "Salsa", label: "Salsa" },
    { value: "Bachata", label: "Bachata" },
    { value: "Danza urbana", label: "Danza urbana" },
    { value: "Contemporánea", label: "Contemporánea" },
    { value: "Folclor", label: "Folclor" },
  ];

  const cityOptions = [
    { value: "", label: "Todas las ciudades" },
    { value: "Barranquilla", label: "Barranquilla" },
    { value: "Bogotá", label: "Bogotá" },
    { value: "Cali", label: "Cali" },
    { value: "Cartagena", label: "Cartagena" },
    { value: "Medellín", label: "Medellín" },
    { value: "Santa Marta", label: "Santa Marta" },
  ];

  const modalityOptions = [
    { value: "", label: "Todas las modalidades" },
    { value: "presencial", label: "Presencial" },
    { value: "virtual", label: "Virtual" },
  ];

  /*
    El backend filtra por ciudad en el propio query.
    El texto de búsqueda y la modalidad se refinan acá
    porque el endpoint de búsqueda no los soporta.
  */
  const filteredClasses = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return classes.filter((danceClass) => {
      const matchesSearch =
        !searchValue ||
        danceClass.tipoBaile?.toLowerCase().includes(searchValue) ||
        danceClass.ciudad?.toLowerCase().includes(searchValue);

      const matchesDanceType =
        !danceType || danceClass.tipoBaile === danceType;

      const matchesModality =
        !modality || danceClass.modalidad === modality;

      return matchesSearch && matchesDanceType && matchesModality;
    });
  }, [classes, search, danceType, modality]);

  const hasFilters = search || danceType || city || modality;

  const handleClearFilters = () => {
    setSearch("");
    setDanceType("");
    setCity("");
    setModality("");
  };

  const handleClassDetail = (classId) => {
    navigate(`/clases/${classId}`);
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegister = () => {
    navigate("/registro");
  };

  const formatPrice = (precio) => {
    const value = Number(precio);

    if (Number.isNaN(value)) {
      return "Precio por confirmar";
    }

    return value.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    });
  };

  if (loading) {
    return <Loading text="Cargando clases..." fullScreen />;
  }

  return (
    <div className="explore-classes-page">
      <main className="explore-classes-content">
        {/* HERO */}

        <section className="explore-classes-hero">
          <div className="explore-classes-hero-text">
            <span className="explore-classes-eyebrow">
              ENCUENTRA TU PRÓXIMA CLASE
            </span>

            <h1>
              Explora clases
              <br />
              <strong>de danza</strong>
            </h1>

            <p>
              Encuentra clases de diferentes estilos, ciudades y modalidades que
              se adapten a lo que estás buscando.
            </p>
          </div>

          <div className="explore-classes-hero-icon">♫</div>
        </section>

        {/* FILTROS */}

        <section className="explore-classes-filters">
          <div className="explore-classes-search">
            <span>⌕</span>

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por tipo de baile o ciudad..."
            />
          </div>

          <div className="explore-classes-filter">
            <Select
              label="Tipo de baile"
              name="danceType"
              value={danceType}
              onChange={(event) => setDanceType(event.target.value)}
              options={danceTypeOptions}
            />
          </div>

          <div className="explore-classes-filter">
            <Select
              label="Ciudad"
              name="city"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              options={cityOptions}
            />
          </div>

          <div className="explore-classes-filter">
            <Select
              label="Modalidad"
              name="modality"
              value={modality}
              onChange={(event) => setModality(event.target.value)}
              options={modalityOptions}
            />
          </div>

          {hasFilters && (
            <button
              type="button"
              className="explore-classes-clear"
              onClick={handleClearFilters}
            >
              Limpiar
            </button>
          )}
        </section>

        {/* RESULTADOS */}

        <section className="explore-classes-results">
          <div className="explore-classes-results-header">
            <div>
              <span className="explore-classes-results-eyebrow">
                CLASES DISPONIBLES
              </span>

              <h2>Encuentra una clase para ti</h2>

              <p>
                Explora las opciones disponibles y elige la clase que más te
                interese.
              </p>
            </div>

            <span className="explore-classes-count">
              {filteredClasses.length} clases
            </span>
          </div>

          {error && (
            <EmptyState
              icon="⚠"
              title="No pudimos cargar las clases"
              message={error}
            />
          )}

          {!error && filteredClasses.length > 0 && (
            <div className="explore-classes-grid">
              {filteredClasses.map((danceClass) => (
                <article className="explore-class-card" key={danceClass.id}>
                  <div className="explore-class-card-top">
                    <div className="explore-class-icon">♫</div>

                    <span className="explore-class-modality">
                      {danceClass.modalidad === "virtual"
                        ? "Virtual"
                        : "Presencial"}
                    </span>
                  </div>

                  <div className="explore-class-body">
                    <span className="explore-class-type">
                      {danceClass.tipoBaile}
                    </span>

                    <h3>Clase de {danceClass.tipoBaile}</h3>

                    <div className="explore-class-data">
                      <div>
                        <span>📍</span>
                        <div>
                          <small>Ciudad</small>
                          <strong>{danceClass.ciudad}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="explore-class-footer">
                      <div className="explore-class-price">
                        <small>Precio</small>

                        <strong>{formatPrice(danceClass.precio)}</strong>
                      </div>

                      <div className="explore-class-slots">
                        <small>Cupos</small>

                        <strong>
                          {danceClass.cupoDisponible} disponibles
                        </strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="explore-class-button"
                      onClick={() => handleClassDetail(danceClass.id)}
                    >
                      Ver clase →
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!error && filteredClasses.length === 0 && (
            <EmptyState
              icon="⌕"
              title="No encontramos clases"
              message="Intenta cambiar los filtros o realizar otra búsqueda."
              action={
                hasFilters
                  ? {
                      label: "Limpiar filtros",
                      onClick: handleClearFilters,
                    }
                  : undefined
              }
            />
          )}
        </section>

        {/* AVISO */}

        <section className="explore-classes-notice">
          <div className="explore-classes-notice-icon">♫</div>

          <div className="explore-classes-notice-text">
            <h2>¿Encontraste la clase que buscas?</h2>

            <p>
              Inicia sesión o crea una cuenta para poder inscribirte y continuar
              con el pago.
            </p>
          </div>

          <div className="explore-classes-notice-actions">
            <button
              type="button"
              className="explore-classes-notice-login"
              onClick={handleLogin}
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              className="explore-classes-notice-register"
              onClick={handleRegister}
            >
              Crear cuenta
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ExploreClasses;
