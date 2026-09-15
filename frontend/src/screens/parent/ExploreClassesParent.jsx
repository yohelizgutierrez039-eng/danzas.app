import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "../../components/Select/Select";
import EmptyState from "../../components/EmptyState/EmptyState";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import "./ExploreClassesParent.css";

const demoChildren = [
  {
    id: 1,
    name: "Sofía Gutiérrez",
    age: 10,
  },
  {
    id: 2,
    name: "Mateo Gutiérrez",
    age: 8,
  },
];

const demoClasses = [
  {
    id: 101,
    name: "Salsa Infantil",
    danceType: "Salsa",
    modality: "Presencial",
    city: "Guamal",
    academy: "Academia Ritmo Caribe",
    instructor: "Carlos Martínez",
    schedule: "Lunes y miércoles - 4:00 PM",
    duration: "1 hora",
    availableSpots: 8,
    price: 45000,
    ageRange: "8 - 12 años",
  },
  {
    id: 102,
    name: "Danza Urbana Kids",
    danceType: "Danza urbana",
    modality: "Presencial",
    city: "Guamal",
    academy: "Academia Ritmo Caribe",
    instructor: "Laura Pérez",
    schedule: "Martes y jueves - 3:30 PM",
    duration: "1 hora",
    availableSpots: 5,
    price: 50000,
    ageRange: "7 - 12 años",
  },
  {
    id: 103,
    name: "Ballet Infantil",
    danceType: "Ballet",
    modality: "Virtual",
    city: "Guamal",
    academy: "Danzas del Caribe",
    instructor: "María Rodríguez",
    schedule: "Sábados - 10:00 AM",
    duration: "1 hora",
    availableSpots: 10,
    price: 40000,
    ageRange: "6 - 12 años",
  },
];

function ExploreClassesParent() {
  const navigate = useNavigate();

  const [selectedChild, setSelectedChild] = useState("");
  const [danceType, setDanceType] = useState("");
  const [modality, setModality] = useState("");
  const [city, setCity] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const childOptions = demoChildren.map((child) => ({
    value: child.id,
    label: `${child.name} (${child.age} años)`,
  }));

  const danceTypeOptions = [
    { value: "Salsa", label: "Salsa" },
    { value: "Danza urbana", label: "Danza urbana" },
    { value: "Ballet", label: "Ballet" },
  ];

  const modalityOptions = [
    { value: "Presencial", label: "Presencial" },
    { value: "Virtual", label: "Virtual" },
  ];

  const cityOptions = [{ value: "Guamal", label: "Guamal" }];

  const filteredClasses = useMemo(() => {
    return demoClasses.filter((danceClass) => {
      const matchesSearch =
        !search ||
        danceClass.name.toLowerCase().includes(search.toLowerCase()) ||
        danceClass.academy.toLowerCase().includes(search.toLowerCase()) ||
        danceClass.danceType.toLowerCase().includes(search.toLowerCase());

      const matchesDanceType = !danceType || danceClass.danceType === danceType;

      const matchesModality = !modality || danceClass.modality === modality;

      const matchesCity = !city || danceClass.city === city;

      return (
        matchesSearch && matchesDanceType && matchesModality && matchesCity
      );
    });
  }, [search, danceType, modality, city]);

  const handleViewClass = (classId) => {
    if (!selectedChild) {
      setError("Primero debes seleccionar cuál hijo/a quieres inscribir.");
      return;
    }

    navigate(`/padre/clases/${classId}/inscribir/${selectedChild}`);
  };

  const clearFilters = () => {
    setSearch("");
    setDanceType("");
    setModality("");
    setCity("");
  };

  return (
    <div className="explore-classes-parent">
      <div className="explore-parent-header">
        <div>
          <span className="explore-parent-eyebrow">PADRE DE FAMILIA</span>

          <h1>Explorar clases</h1>

          <p>
            Encuentra una clase de danza y selecciona el hijo o hija que deseas
            inscribir.
          </p>
        </div>
      </div>

      <section className="child-selector-card">
        <div className="child-selector-icon">👨‍👩‍👧</div>

        <div className="child-selector-content">
          <h2>¿Para quién quieres buscar una clase?</h2>

          <p>
            Selecciona uno de tus hijos antes de continuar con la inscripción.
          </p>

          <Select
            label="Seleccionar hijo/a"
            name="selectedChild"
            value={selectedChild}
            onChange={(event) => {
              setSelectedChild(event.target.value);
              setError("");
            }}
            options={childOptions}
            placeholder="Selecciona un hijo/a"
            required
            fullWidth
          />
        </div>
      </section>

      {error && <ErrorMessage message={error} onClose={() => setError("")} />}

      <section className="parent-filters">
        <div className="parent-search">
          <label htmlFor="class-search">Buscar clase</label>

          <div className="parent-search-input">
            <span>🔎</span>

            <input
              id="class-search"
              type="text"
              placeholder="Nombre de clase, academia o danza..."
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

      <div className="classes-parent-toolbar">
        <div>
          <strong>{filteredClasses.length}</strong> clases encontradas
        </div>

        {selectedChild && (
          <div className="selected-child-badge">
            Inscripción para:{" "}
            <strong>
              {
                demoChildren.find(
                  (child) => String(child.id) === String(selectedChild),
                )?.name
              }
            </strong>
          </div>
        )}
      </div>

      {filteredClasses.length === 0 ? (
        <EmptyState
          title="No encontramos clases"
          message="Intenta cambiar los filtros o realizar otra búsqueda."
        />
      ) : (
        <div className="parent-classes-grid">
          {filteredClasses.map((danceClass) => (
            <article className="parent-class-card" key={danceClass.id}>
              <div className="parent-class-card-top">
                <span className="dance-type-badge">{danceClass.danceType}</span>

                <span className="modality-badge">{danceClass.modality}</span>
              </div>

              <div className="parent-class-card-body">
                <h2>{danceClass.name}</h2>

                <p className="parent-academy">🏫 {danceClass.academy}</p>

                <div className="parent-class-info">
                  <span>📍 {danceClass.city}</span>
                  <span>👤 {danceClass.instructor}</span>
                  <span>🕐 {danceClass.schedule}</span>
                  <span>⏱️ {danceClass.duration}</span>
                  <span>👧 {danceClass.ageRange}</span>
                </div>

                <div className="parent-class-footer">
                  <div>
                    <span className="price-label">Mensualidad</span>
                    <strong>${danceClass.price.toLocaleString("es-CO")}</strong>
                  </div>

                  <span className="available-spots">
                    {danceClass.availableSpots} cupos disponibles
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
                  onClick={() => handleViewClass(danceClass.id)}
                >
                  Inscribir hijo/a
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <section className="parent-info-box">
        <span className="parent-info-icon">ℹ️</span>

        <div>
          <h3>Importante</h3>

          <p>
            Como padre de familia, puedes seleccionar cualquiera de tus hijos
            registrados para realizar su inscripción a una clase. Antes de
            pagar, podrás revisar nuevamente los datos de la inscripción.
          </p>
        </div>
      </section>
    </div>
  );
}

export default ExploreClassesParent;
