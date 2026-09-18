import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Select from "../../components/Select/Select";
import Loading from "../../components/Loading/Loading";
import EmptyState from "../../components/EmptyState/EmptyState";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";

import api from "../../services/api";

import "./ExploreClasses.css";

const demoClasses = [
  {
    id: 1,
    name: "Salsa Básica",
    danceType: "Salsa",
    academy: "Academia Ritmo Caribe",
    instructor: "Carlos Martínez",
    city: "Guamal",
    modality: "Presencial",
    schedule: "Lunes y miércoles - 5:00 PM",
    duration: "1 hora",
    price: 50000,
    available: 8,
    description: "Clase para aprender los pasos básicos de salsa desde cero.",
  },
  {
    id: 2,
    name: "Bachata Inicial",
    danceType: "Bachata",
    academy: "Danza Viva",
    instructor: "Laura Gómez",
    city: "Santa Marta",
    modality: "Presencial",
    schedule: "Martes y jueves - 6:00 PM",
    duration: "1 hora",
    price: 60000,
    available: 5,
    description: "Aprende los movimientos principales de la bachata.",
  },
  {
    id: 3,
    name: "Danza Urbana",
    danceType: "Urbana",
    academy: "Urban Dance",
    instructor: "Andrés Pérez",
    city: "Barranquilla",
    modality: "Virtual",
    schedule: "Sábados - 10:00 AM",
    duration: "1 hora y 30 minutos",
    price: 45000,
    available: 12,
    description: "Clase de danza urbana para desarrollar ritmo y coordinación.",
  },
  {
    id: 4,
    name: "Cumbia Tradicional",
    danceType: "Cumbia",
    academy: "Academia Folclórica del Caribe",
    instructor: "María Rodríguez",
    city: "Guamal",
    modality: "Presencial",
    schedule: "Viernes - 4:00 PM",
    duration: "1 hora",
    price: 40000,
    available: 10,
    description: "Conoce y practica los pasos tradicionales de la cumbia.",
  },
];

function ExploreClasses() {
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [danceType, setDanceType] = useState("");
  const [city, setCity] = useState("");
  const [modality, setModality] = useState("");

  useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoading(true);
        setError("");

        /*
         * Cuando el backend esté conectado:
         *
         * const data = await api("/classes/search");
         * setClasses(data);
         */

        await new Promise((resolve) => setTimeout(resolve, 500));

        setClasses(demoClasses);
      } catch (err) {
        setError(err.message || "No fue posible cargar las clases.");
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, []);

  const danceTypeOptions = useMemo(() => {
    const values = [...new Set(classes.map((item) => item.danceType))];

    return values.map((value) => ({
      value,
      label: value,
    }));
  }, [classes]);

  const cityOptions = useMemo(() => {
    const values = [...new Set(classes.map((item) => item.city))];

    return values.map((value) => ({
      value,
      label: value,
    }));
  }, [classes]);

  const modalityOptions = [
    {
      value: "Presencial",
      label: "Presencial",
    },
    {
      value: "Virtual",
      label: "Virtual",
    },
  ];

  const filteredClasses = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return classes.filter((item) => {
      const matchesSearch =
        !searchValue ||
        item.name?.toLowerCase().includes(searchValue) ||
        item.academy?.toLowerCase().includes(searchValue) ||
        item.instructor?.toLowerCase().includes(searchValue) ||
        item.danceType?.toLowerCase().includes(searchValue);

      const matchesDanceType = !danceType || item.danceType === danceType;

      const matchesCity = !city || item.city === city;

      const matchesModality = !modality || item.modality === modality;

      return (
        matchesSearch && matchesDanceType && matchesCity && matchesModality
      );
    });
  }, [classes, search, danceType, city, modality]);

  const clearFilters = () => {
    setSearch("");
    setDanceType("");
    setCity("");
    setModality("");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return <Loading text="Cargando clases..." fullScreen />;
  }

  return (
    <div className="explore-classes">
      <section className="explore-hero">
        <div className="explore-hero-content">
          <span className="explore-badge">Encuentra tu ritmo</span>

          <h1>Explora clases de danza</h1>

          <p>
            Encuentra la clase que más te guste, conoce diferentes academias y
            comienza a disfrutar de la danza.
          </p>

          <div className="explore-search">
            <span className="search-icon">⌕</span>

            <input
              type="text"
              placeholder="Busca una clase, academia, instructor o danza..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      <main className="explore-container">
        <section className="filters-section">
          <div className="filters-header">
            <div>
              <h2>Encuentra tu clase</h2>
              <p>
                Utiliza los filtros para encontrar una clase según tus
                preferencias.
              </p>
            </div>

            {(search || danceType || city || modality) && (
              <button
                type="button"
                className="clear-filters"
                onClick={clearFilters}
              >
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="filters-grid">
            <Select
              label="Tipo de danza"
              name="danceType"
              value={danceType}
              onChange={(e) => setDanceType(e.target.value)}
              options={danceTypeOptions}
              placeholder="Todas las danzas"
            />

            <Select
              label="Ciudad"
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              options={cityOptions}
              placeholder="Todas las ciudades"
            />

            <Select
              label="Modalidad"
              name="modality"
              value={modality}
              onChange={(e) => setModality(e.target.value)}
              options={modalityOptions}
              placeholder="Todas las modalidades"
            />
          </div>
        </section>

        {error && <ErrorMessage message={error} onClose={() => setError("")} />}

        <section className="results-section">
          <div className="results-header">
            <div>
              <h2>Clases disponibles</h2>
              <span>
                {filteredClasses.length}{" "}
                {filteredClasses.length === 1
                  ? "clase encontrada"
                  : "clases encontradas"}
              </span>
            </div>
          </div>

          {filteredClasses.length === 0 ? (
            <EmptyState
              title="No encontramos clases"
              message="Intenta cambiar los filtros o realizar otra búsqueda."
              icon="💃"
              action={
                <button
                  type="button"
                  className="empty-action"
                  onClick={clearFilters}
                >
                  Ver todas las clases
                </button>
              }
            />
          ) : (
            <div className="classes-grid">
              {filteredClasses.map((danceClass) => (
                <article className="class-card" key={danceClass.id}>
                  <div className="class-card-top">
                    <span className="dance-type">{danceClass.danceType}</span>

                    <span
                      className={`modality ${
                        danceClass.modality === "Virtual" ? "virtual" : ""
                      }`}
                    >
                      {danceClass.modality}
                    </span>
                  </div>

                  <div className="class-card-content">
                    <h3>{danceClass.name}</h3>

                    <p className="academy-name">{danceClass.academy}</p>

                    <p className="class-description">
                      {danceClass.description}
                    </p>

                    <div className="class-info">
                      <div>
                        <span>Instructor</span>
                        <strong>{danceClass.instructor}</strong>
                      </div>

                      <div>
                        <span>Ciudad</span>
                        <strong>{danceClass.city}</strong>
                      </div>

                      <div>
                        <span>Horario</span>
                        <strong>{danceClass.schedule}</strong>
                      </div>

                      <div>
                        <span>Duración</span>
                        <strong>{danceClass.duration}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="class-card-bottom">
                    <div>
                      <span>Desde</span>
                      <strong>{formatPrice(danceClass.price)}</strong>
                    </div>

                    <span className="available">
                      {danceClass.available} cupos disponibles
                    </span>
                  </div>

                  <div className="class-card-actions">
                    <button
                      type="button"
                      className="details-button"
                      onClick={() => navigate(`/clases/${danceClass.id}`)}
                    >
                      Ver detalles
                    </button>

                    <button
                      type="button"
                      className="enroll-button"
                      onClick={() => navigate(`/clases/${danceClass.id}`)}
                    >
                      Inscribirme
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default ExploreClasses;
