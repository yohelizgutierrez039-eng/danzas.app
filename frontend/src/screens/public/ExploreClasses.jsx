import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ExploreClasses.css";

function ExploreClasses() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    search: "",
    type: "",
    city: "",
    modality: "",
  });

  const [showFilters, setShowFilters] = useState(false);

  // Datos de ejemplo.
  // Posteriormente serán obtenidos desde:
  // GET /classes/search?tipo=&ciudad=&modalidad=
  const classes = [
    {
      id: 1,
      name: "Salsa Básica",
      instructor: "Carlos Martínez",
      type: "Salsa",
      city: "Barranquilla",
      modality: "Presencial",
      schedule: "Lunes y miércoles · 5:00 PM",
      price: 80000,
      available: 8,
      total: 15,
    },
    {
      id: 2,
      name: "Bachata Inicial",
      instructor: "Laura Rodríguez",
      type: "Bachata",
      city: "Cartagena",
      modality: "Presencial",
      schedule: "Martes y jueves · 6:00 PM",
      price: 75000,
      available: 5,
      total: 12,
    },
    {
      id: 3,
      name: "Danza Urbana",
      instructor: "Andrés Gómez",
      type: "Danza urbana",
      city: "Bogotá",
      modality: "Virtual",
      schedule: "Sábados · 10:00 AM",
      price: 60000,
      available: 12,
      total: 20,
    },
    {
      id: 4,
      name: "Cumbia Colombiana",
      instructor: "María Fernández",
      type: "Cumbia",
      city: "Santa Marta",
      modality: "Presencial",
      schedule: "Viernes · 4:00 PM",
      price: 70000,
      available: 10,
      total: 15,
    },
    {
      id: 5,
      name: "Salsa Intermedia",
      instructor: "Daniel Pérez",
      type: "Salsa",
      city: "Bogotá",
      modality: "Virtual",
      schedule: "Miércoles · 7:00 PM",
      price: 65000,
      available: 6,
      total: 10,
    },
    {
      id: 6,
      name: "Danza Contemporánea",
      instructor: "Sofía Torres",
      type: "Contemporánea",
      city: "Medellín",
      modality: "Presencial",
      schedule: "Sábados · 2:00 PM",
      price: 85000,
      available: 7,
      total: 12,
    },
  ];

  const filteredClasses = useMemo(() => {
    return classes.filter((classItem) => {
      const search = filters.search.toLowerCase().trim();

      const matchesSearch =
        !search ||
        classItem.name.toLowerCase().includes(search) ||
        classItem.instructor.toLowerCase().includes(search) ||
        classItem.type.toLowerCase().includes(search);

      const matchesType = !filters.type || classItem.type === filters.type;

      const matchesCity = !filters.city || classItem.city === filters.city;

      const matchesModality =
        !filters.modality || classItem.modality === filters.modality;

      return matchesSearch && matchesType && matchesCity && matchesModality;
    });
  }, [filters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      type: "",
      city: "",
      modality: "",
    });
  };

  const handleViewClass = (id) => {
    navigate(`/clases/${id}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const activeFilters =
    filters.type || filters.city || filters.modality || filters.search;

  return (
    <div className="explore-classes-page">
      {/* HEADER */}
      <header className="explore-classes-header">
        <div className="explore-classes-header-content">
          <button
            type="button"
            className="explore-classes-logo"
            onClick={() => navigate("/")}
          >
            <span className="explore-classes-logo-icon">♫</span>

            <span>
              Danzas<span>.app</span>
            </span>
          </button>

          <nav className="explore-classes-nav">
            <button type="button" onClick={() => navigate("/")}>
              Inicio
            </button>

            <button type="button" className="active">
              Explorar clases
            </button>

            <button type="button" onClick={() => navigate("/login")}>
              Iniciar sesión
            </button>

            <button
              type="button"
              className="explore-classes-register"
              onClick={() => navigate("/registro")}
            >
              Crear cuenta
            </button>
          </nav>
        </div>
      </header>

      {/* HERO / SEARCH */}
      <section className="explore-classes-hero">
        <div className="explore-classes-container">
          <div className="explore-classes-heading">
            <span className="explore-classes-label">DANZAS.APP</span>

            <h1>Explora clases de danza</h1>

            <p>
              Encuentra una clase que se adapte a tus gustos, ubicación y
              horario.
            </p>
          </div>

          <div className="explore-classes-search">
            <span className="explore-classes-search-icon">⌕</span>

            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Busca por clase, instructor o tipo de danza..."
            />

            <button
              type="button"
              onClick={() => setShowFilters((previous) => !previous)}
              className="explore-classes-filter-toggle"
            >
              ⚙ Filtros
            </button>
          </div>

          {/* FILTERS */}
          <div
            className={`explore-classes-filters ${showFilters ? "show" : ""}`}
          >
            <div className="explore-filter">
              <label htmlFor="type">Tipo de danza</label>

              <select
                id="type"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
              >
                <option value="">Todos los tipos</option>
                <option value="Salsa">Salsa</option>
                <option value="Bachata">Bachata</option>
                <option value="Cumbia">Cumbia</option>
                <option value="Danza urbana">Danza urbana</option>
                <option value="Contemporánea">Contemporánea</option>
              </select>
            </div>

            <div className="explore-filter">
              <label htmlFor="city">Ciudad</label>

              <select
                id="city"
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
              >
                <option value="">Todas las ciudades</option>
                <option value="Barranquilla">Barranquilla</option>
                <option value="Bogotá">Bogotá</option>
                <option value="Cartagena">Cartagena</option>
                <option value="Medellín">Medellín</option>
                <option value="Santa Marta">Santa Marta</option>
              </select>
            </div>

            <div className="explore-filter">
              <label htmlFor="modality">Modalidad</label>

              <select
                id="modality"
                name="modality"
                value={filters.modality}
                onChange={handleFilterChange}
              >
                <option value="">Todas las modalidades</option>
                <option value="Presencial">Presencial</option>
                <option value="Virtual">Virtual</option>
              </select>
            </div>

            {activeFilters && (
              <button
                type="button"
                className="explore-clear-filters"
                onClick={clearFilters}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <main className="explore-classes-main">
        <div className="explore-classes-container">
          <div className="explore-results-header">
            <div>
              <span className="explore-results-label">RESULTADOS</span>

              <h2>Clases disponibles</h2>

              <p>
                {filteredClasses.length === 1
                  ? "1 clase encontrada"
                  : `${filteredClasses.length} clases encontradas`}
              </p>
            </div>

            {activeFilters && (
              <button
                type="button"
                className="explore-results-clear"
                onClick={clearFilters}
              >
                Limpiar búsqueda
              </button>
            )}
          </div>

          {filteredClasses.length > 0 ? (
            <div className="explore-classes-grid">
              {filteredClasses.map((classItem) => (
                <article className="explore-class-card" key={classItem.id}>
                  <div className="explore-class-card-top">
                    <div className="explore-class-icon">♫</div>

                    <span className="explore-class-modality">
                      {classItem.modality}
                    </span>
                  </div>

                  <div className="explore-class-card-content">
                    <span className="explore-class-type">{classItem.type}</span>

                    <h3>{classItem.name}</h3>

                    <p className="explore-class-instructor">
                      Instructor: {classItem.instructor}
                    </p>

                    <div className="explore-class-info">
                      <div>
                        <span>📍</span>
                        <p>{classItem.city}</p>
                      </div>

                      <div>
                        <span>◷</span>
                        <p>{classItem.schedule}</p>
                      </div>

                      <div>
                        <span>♙</span>
                        <p>{classItem.available} cupos disponibles</p>
                      </div>
                    </div>
                  </div>

                  <div className="explore-class-card-footer">
                    <div className="explore-class-price">
                      <span>Precio</span>

                      <strong>{formatPrice(classItem.price)}</strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleViewClass(classItem.id)}
                    >
                      Ver clase →
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="explore-empty-state">
              <div className="explore-empty-icon">⌕</div>

              <h3>No encontramos clases</h3>

              <p>
                No hay clases que coincidan con los criterios de búsqueda
                seleccionados.
              </p>

              <button type="button" onClick={clearFilters}>
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </main>

      {/* INFORMATION */}
      <section className="explore-classes-info-section">
        <div className="explore-classes-container">
          <div className="explore-info-box">
            <div className="explore-info-icon">ℹ</div>

            <div>
              <h3>¿Encontraste una clase que te gusta?</h3>

              <p>
                Puedes consultar la información de las clases como invitado.
                Para inscribirte debes iniciar sesión o crear una cuenta.
              </p>
            </div>

            <button type="button" onClick={() => navigate("/registro")}>
              Crear cuenta
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="explore-classes-footer">
        <div className="explore-classes-container">
          <span>
            ♫ Danzas<span>.app</span>
          </span>

          <p>Conectando personas con su pasión por la danza.</p>
        </div>
      </footer>
    </div>
  );
}

export default ExploreClasses;
