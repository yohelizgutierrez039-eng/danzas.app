import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Academies.css";

function Academies() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");

  // Datos de ejemplo.
  // Posteriormente estos datos pueden venir del backend.
  const academies = [
    {
      id: 1,
      name: "Academia Ritmo Caribe",
      city: "Barranquilla",
      description:
        "Academia especializada en diferentes estilos de danza para niños, jóvenes y adultos.",
      classes: 8,
      image:
        "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      name: "Danza Viva",
      city: "Bogotá",
      description:
        "Espacio dedicado al aprendizaje y práctica de diferentes estilos de baile.",
      classes: 12,
      image:
        "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      name: "Movimiento Dance",
      city: "Medellín",
      description:
        "Academia de danza con clases presenciales y diferentes horarios.",
      classes: 10,
      image:
        "https://images.unsplash.com/photo-1535525153412-5a42439a210d?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 4,
      name: "Pasos y Ritmos",
      city: "Cartagena",
      description:
        "Aprende, practica y disfruta la danza en un ambiente pensado para todos.",
      classes: 6,
      image:
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const filteredAcademies = academies.filter((academy) => {
    const matchesSearch =
      academy.name.toLowerCase().includes(search.toLowerCase()) ||
      academy.description.toLowerCase().includes(search.toLowerCase());

    const matchesCity =
      city === "" || academy.city.toLowerCase() === city.toLowerCase();

    return matchesSearch && matchesCity;
  });

  const handleViewAcademy = (id) => {
    navigate(`/academias/${id}`);
  };

  return (
    <div className="academies-page">
      {/* Encabezado */}
      <section className="academies-header">
        <div className="academies-header-content">
          <span className="academies-tag">DANZAS.APP</span>

          <h1>Encuentra tu academia de danza</h1>

          <p>
            Descubre academias, conoce sus clases y encuentra el espacio
            perfecto para aprender a bailar.
          </p>
        </div>
      </section>

      {/* Contenido */}
      <main className="academies-container">
        {/* Buscador y filtros */}
        <section className="academies-search">
          <div className="academies-search-box">
            <span className="academies-search-icon">⌕</span>

            <input
              type="text"
              placeholder="Buscar academia..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="academies-filter">
            <label htmlFor="academy-city">Ciudad</label>

            <select
              id="academy-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="">Todas las ciudades</option>
              <option value="Bogotá">Bogotá</option>
              <option value="Medellín">Medellín</option>
              <option value="Barranquilla">Barranquilla</option>
              <option value="Cartagena">Cartagena</option>
            </select>
          </div>
        </section>

        {/* Título de resultados */}
        <section className="academies-results-header">
          <div>
            <h2>Academias disponibles</h2>
            <p>
              {filteredAcademies.length}{" "}
              {filteredAcademies.length === 1
                ? "academia encontrada"
                : "academias encontradas"}
            </p>
          </div>
        </section>

        {/* Tarjetas */}
        {filteredAcademies.length > 0 ? (
          <section className="academies-grid">
            {filteredAcademies.map((academy) => (
              <article className="academy-card" key={academy.id}>
                <div className="academy-card-image">
                  <img src={academy.image} alt={academy.name} />

                  <span className="academy-card-city">📍 {academy.city}</span>
                </div>

                <div className="academy-card-content">
                  <h3>{academy.name}</h3>

                  <p>{academy.description}</p>

                  <div className="academy-card-info">
                    <span>
                      <strong>{academy.classes}</strong> clases disponibles
                    </span>
                  </div>

                  <button
                    type="button"
                    className="academy-card-button"
                    onClick={() => handleViewAcademy(academy.id)}
                  >
                    Ver academia
                    <span>→</span>
                  </button>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="academies-empty">
            <div className="academies-empty-icon">⌕</div>

            <h3>No encontramos academias</h3>

            <p>
              Intenta cambiar el nombre de búsqueda o seleccionar otra ciudad.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCity("");
              }}
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Academies;
