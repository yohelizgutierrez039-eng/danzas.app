import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "../../components/Select/Select";
import Loading from "../../components/Loading/Loading";
import EmptyState from "../../components/EmptyState/EmptyState";
import "./ExploreClasses.css";

function ExploreClasses() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [danceType, setDanceType] = useState("");
  const [city, setCity] = useState("");
  const [modality, setModality] = useState("");

  const [loading] = useState(false);

  /*
    Datos de demostración.
    Posteriormente serán reemplazados por la respuesta
    del backend.

    Endpoint:
    GET /classes/search?tipo=&ciudad=&modalidad=
  */
  const classes = [
    {
      id: 1,
      name: "Salsa Básica",
      instructor: "Carlos Martínez",
      academy: "Academia Ritmo Caribe",
      type: "Salsa",
      city: "Barranquilla",
      modality: "Presencial",
      schedule: "Lunes y miércoles · 6:00 PM",
      price: "$80.000",
      available: 8,
      duration: "1 hora",
    },
    {
      id: 2,
      name: "Bachata Inicial",
      instructor: "Laura Rodríguez",
      academy: "Baila Conmigo",
      type: "Bachata",
      city: "Cartagena",
      modality: "Presencial",
      schedule: "Martes y jueves · 5:00 PM",
      price: "$75.000",
      available: 5,
      duration: "1 hora",
    },
    {
      id: 3,
      name: "Danza Urbana",
      instructor: "Andrés Gómez",
      academy: "Movimiento Urbano",
      type: "Danza urbana",
      city: "Bogotá",
      modality: "Virtual",
      schedule: "Sábados · 10:00 AM",
      price: "$60.000",
      available: 12,
      duration: "1 hora",
    },
    {
      id: 4,
      name: "Salsa Intermedia",
      instructor: "Sofía Torres",
      academy: "Danza Viva",
      type: "Salsa",
      city: "Medellín",
      modality: "Presencial",
      schedule: "Viernes · 7:00 PM",
      price: "$90.000",
      available: 6,
      duration: "1 hora",
    },
    {
      id: 5,
      name: "Folclor Colombiano",
      instructor: "María González",
      academy: "Pasos de Colombia",
      type: "Folclor",
      city: "Santa Marta",
      modality: "Presencial",
      schedule: "Sábados · 3:00 PM",
      price: "$65.000",
      available: 10,
      duration: "1 hora",
    },
    {
      id: 6,
      name: "Salsa Online",
      instructor: "Daniel Pérez",
      academy: "Dance Studio",
      type: "Salsa",
      city: "Cali",
      modality: "Virtual",
      schedule: "Miércoles · 8:00 PM",
      price: "$55.000",
      available: 15,
      duration: "1 hora",
    },
    {
      id: 7,
      name: "Bachata Avanzada",
      instructor: "Natalia Herrera",
      academy: "Baila Conmigo",
      type: "Bachata",
      city: "Cartagena",
      modality: "Virtual",
      schedule: "Domingos · 4:00 PM",
      price: "$70.000",
      available: 9,
      duration: "1 hora",
    },
    {
      id: 8,
      name: "Danza Contemporánea",
      instructor: "Camila Vargas",
      academy: "Danza Viva",
      type: "Contemporánea",
      city: "Medellín",
      modality: "Presencial",
      schedule: "Martes · 6:30 PM",
      price: "$85.000",
      available: 4,
      duration: "1 hora",
    },
  ];

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
    { value: "Presencial", label: "Presencial" },
    { value: "Virtual", label: "Virtual" },
  ];

  const filteredClasses = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return classes.filter((danceClass) => {
      const matchesSearch =
        !searchValue ||
        danceClass.name.toLowerCase().includes(searchValue) ||
        danceClass.instructor.toLowerCase().includes(searchValue) ||
        danceClass.academy.toLowerCase().includes(searchValue) ||
        danceClass.city.toLowerCase().includes(searchValue) ||
        danceClass.type.toLowerCase().includes(searchValue);

      const matchesDanceType = !danceType || danceClass.type === danceType;

      const matchesCity = !city || danceClass.city === city;

      const matchesModality = !modality || danceClass.modality === modality;

      return (
        matchesSearch && matchesDanceType && matchesCity && matchesModality
      );
    });
  }, [classes, search, danceType, city, modality]);

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

  if (loading) {
    return <Loading text="Cargando clases..." fullScreen />;
  }

  return (
    <div className="explore-classes-page">
      {/* HEADER */}

      <header className="explore-classes-header">
        <div className="explore-classes-header-container">
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

            <button type="button" onClick={() => navigate("/academias")}>
              Academias
            </button>

            <button type="button" className="active">
              Clases
            </button>
          </nav>

          <div className="explore-classes-actions">
            <button
              type="button"
              className="explore-classes-login"
              onClick={handleLogin}
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              className="explore-classes-register"
              onClick={handleRegister}
            >
              Registrarse
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO */}

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
              placeholder="Buscar clase, instructor o academia..."
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

          {filteredClasses.length > 0 ? (
            <div className="explore-classes-grid">
              {filteredClasses.map((danceClass) => (
                <article className="explore-class-card" key={danceClass.id}>
                  <div className="explore-class-card-top">
                    <div className="explore-class-icon">♫</div>

                    <span className="explore-class-modality">
                      {danceClass.modality}
                    </span>
                  </div>

                  <div className="explore-class-body">
                    <span className="explore-class-type">
                      {danceClass.type}
                    </span>

                    <h3>{danceClass.name}</h3>

                    <p className="explore-class-academy">
                      {danceClass.academy}
                    </p>

                    <div className="explore-class-instructor">
                      <span>♙</span>
                      <div>
                        <small>Instructor</small>
                        <strong>{danceClass.instructor}</strong>
                      </div>
                    </div>

                    <div className="explore-class-data">
                      <div>
                        <span>📍</span>
                        <div>
                          <small>Ciudad</small>
                          <strong>{danceClass.city}</strong>
                        </div>
                      </div>

                      <div>
                        <span>◷</span>
                        <div>
                          <small>Horario</small>
                          <strong>{danceClass.schedule}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="explore-class-footer">
                      <div className="explore-class-price">
                        <small>Precio</small>

                        <strong>{danceClass.price}</strong>
                      </div>

                      <div className="explore-class-slots">
                        <small>Cupos</small>

                        <strong>{danceClass.available} disponibles</strong>
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
          ) : (
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

      {/* FOOTER */}

      <footer className="explore-classes-footer">
        <div className="explore-classes-footer-container">
          <div className="explore-classes-footer-brand">
            <strong>
              Danzas<span>.app</span>
            </strong>

            <p>Conectando personas con la danza.</p>
          </div>

          <div className="explore-classes-footer-links">
            <button type="button" onClick={() => navigate("/")}>
              Inicio
            </button>

            <button type="button" onClick={() => navigate("/academias")}>
              Academias
            </button>

            <button type="button" onClick={() => navigate("/clases")}>
              Clases
            </button>

            <button type="button" onClick={handleLogin}>
              Iniciar sesión
            </button>
          </div>
        </div>

        <div className="explore-classes-footer-bottom">
          © 2026 Danzas.app. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}

export default ExploreClasses;
