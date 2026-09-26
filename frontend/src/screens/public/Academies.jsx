import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "../../components/common/Select/Select";
import Loading from "../../components/common/Loading/Loading";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import "./Academies.css";

function Academies() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [danceType, setDanceType] = useState("");
  const [modality, setModality] = useState("");

  const [loading] = useState(false);

  /*
    Datos de demostración.
    Posteriormente serán reemplazados por la respuesta del backend.

    Endpoint relacionado con la búsqueda:
    GET /classes/search
  */
  const academies = [
    {
      id: 1,
      name: "Academia Ritmo Caribe",
      city: "Barranquilla",
      address: "Carrera 45 # 72-18",
      description:
        "Academia dedicada a la enseñanza de diferentes estilos de danza.",
      danceTypes: ["Salsa", "Bachata", "Danza urbana"],
      classes: 8,
    },
    {
      id: 2,
      name: "Baila Conmigo",
      city: "Cartagena",
      address: "Calle 32 # 10-25",
      description:
        "Espacio para aprender y disfrutar diferentes ritmos de danza.",
      danceTypes: ["Salsa", "Bachata"],
      classes: 5,
    },
    {
      id: 3,
      name: "Movimiento Urbano",
      city: "Bogotá",
      address: "Carrera 13 # 63-45",
      description:
        "Academia especializada en estilos urbanos y contemporáneos.",
      danceTypes: ["Danza urbana", "Contemporánea"],
      classes: 6,
    },
    {
      id: 4,
      name: "Danza Viva",
      city: "Medellín",
      address: "Carrera 70 # 45-20",
      description:
        "Academia que ofrece clases para diferentes edades y niveles.",
      danceTypes: ["Salsa", "Bachata", "Contemporánea"],
      classes: 7,
    },
    {
      id: 5,
      name: "Pasos de Colombia",
      city: "Santa Marta",
      address: "Calle 22 # 5-40",
      description: "Academia enfocada en ritmos tradicionales y latinos.",
      danceTypes: ["Folclor", "Salsa", "Merengue"],
      classes: 4,
    },
    {
      id: 6,
      name: "Dance Studio",
      city: "Cali",
      address: "Carrera 5 # 12-30",
      description:
        "Clases de danza para principiantes y personas con experiencia.",
      danceTypes: ["Salsa", "Danza urbana"],
      classes: 9,
    },
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

  const danceTypeOptions = [
    { value: "", label: "Todos los tipos" },
    { value: "Salsa", label: "Salsa" },
    { value: "Bachata", label: "Bachata" },
    { value: "Danza urbana", label: "Danza urbana" },
    { value: "Contemporánea", label: "Contemporánea" },
    { value: "Folclor", label: "Folclor" },
    { value: "Merengue", label: "Merengue" },
  ];

  const modalityOptions = [
    { value: "", label: "Todas las modalidades" },
    { value: "Presencial", label: "Presencial" },
    { value: "Virtual", label: "Virtual" },
  ];

  const filteredAcademies = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return academies.filter((academy) => {
      const matchesSearch =
        !searchValue ||
        academy.name.toLowerCase().includes(searchValue) ||
        academy.city.toLowerCase().includes(searchValue) ||
        academy.description.toLowerCase().includes(searchValue);

      const matchesCity = !city || academy.city === city;

      const matchesDance = !danceType || academy.danceTypes.includes(danceType);

      /*
        La modalidad pertenece principalmente a las clases.
        Se mantiene el filtro preparado para conectarlo
        posteriormente con la información real del backend.
      */
      const matchesModality = !modality || true;

      return matchesSearch && matchesCity && matchesDance && matchesModality;
    });
  }, [academies, search, city, danceType, modality]);

  const handleViewAcademy = (academyId) => {
    navigate(`/academias/${academyId}`);
  };

  const handleClearFilters = () => {
    setSearch("");
    setCity("");
    setDanceType("");
    setModality("");
  };

  const hasFilters = search || city || danceType || modality;

  if (loading) {
    return <Loading text="Cargando academias..." fullScreen />;
  }

  return (
    <div className="academies-page">
      <main className="academies-content">
        <section className="academies-hero">
          <div className="academies-hero-text">
            <span className="academies-eyebrow">DESCUBRE TU PRÓXIMO PASO</span>

            <h1>
              Encuentra una academia
              <br />
              <strong>cerca de ti</strong>
            </h1>

            <p>
              Explora academias de danza y encuentra diferentes opciones para
              aprender, practicar y disfrutar de la danza.
            </p>
          </div>

          <div className="academies-hero-icon">♫</div>
        </section>

        {/* FILTROS */}

        <section className="academies-filters">
          <div className="academies-search">
            <span>⌕</span>

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar academia o ciudad..."
            />
          </div>

          <div className="academies-filter-select">
            <Select
              label="Ciudad"
              name="city"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              options={cityOptions}
            />
          </div>

          <div className="academies-filter-select">
            <Select
              label="Tipo de baile"
              name="danceType"
              value={danceType}
              onChange={(event) => setDanceType(event.target.value)}
              options={danceTypeOptions}
            />
          </div>

          <div className="academies-filter-select">
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
              className="academies-clear"
              onClick={handleClearFilters}
            >
              Limpiar
            </button>
          )}
        </section>

        {/* RESULTADOS */}

        <section className="academies-results">
          <div className="academies-results-header">
            <div>
              <span className="academies-results-eyebrow">
                ACADEMIAS DISPONIBLES
              </span>

              <h2>Explora nuestras academias</h2>
            </div>

            <span className="academies-results-count">
              {filteredAcademies.length} academias
            </span>
          </div>

          {filteredAcademies.length > 0 ? (
            <div className="academies-grid">
              {filteredAcademies.map((academy) => (
                <article className="academy-card" key={academy.id}>
                  <div className="academy-card-cover">
                    <div className="academy-card-icon">♫</div>

                    <span className="academy-card-location">
                      📍 {academy.city}
                    </span>
                  </div>

                  <div className="academy-card-body">
                    <h3>{academy.name}</h3>

                    <p className="academy-card-address">{academy.address}</p>

                    <p className="academy-card-description">
                      {academy.description}
                    </p>

                    <div className="academy-card-tags">
                      {academy.danceTypes.slice(0, 3).map((dance) => (
                        <span key={dance}>{dance}</span>
                      ))}
                    </div>

                    <div className="academy-card-footer">
                      <span>{academy.classes} clases disponibles</span>

                      <button
                        type="button"
                        onClick={() => handleViewAcademy(academy.id)}
                      >
                        Ver academia →
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="⌕"
              title="No encontramos academias"
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
      </main>
    </div>
  );
}

export default Academies;
