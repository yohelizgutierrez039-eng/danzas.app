import React, { useState } from "react";
import InstructorCard from "./instructorCard";
import "./instructorList.css";

const InstructorList = ({ instructors = [], onView, onEdit }) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");

  // Filtrar instructores
  const filteredInstructors = instructors.filter((instructor) => {
    const fullName =
      `${instructor.nombre} ${instructor.apellido}`.toLowerCase();

    const searchMatch =
      fullName.includes(search.toLowerCase()) ||
      instructor.academia
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const filterMatch =
      filter === "Todos" ||
      instructor.estado?.toLowerCase() === filter.toLowerCase();

    return searchMatch && filterMatch;
  });

  return (
    <div className="instructor-list">
      {/* Encabezado */}
      <div className="instructor-list__header">
        <div>
          <h1>Gestión de instructores</h1>
          <p>
            Administra y consulta la información de los instructores
            registrados.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="instructor-list__filters">
        <button
          type="button"
          className={filter === "Todos" ? "active" : ""}
          onClick={() => setFilter("Todos")}
        >
          Todos
        </button>

        <button
          type="button"
          className={filter === "Activo" ? "active" : ""}
          onClick={() => setFilter("Activo")}
        >
          Activos
        </button>

        <button
          type="button"
          className={filter === "Inactivo" ? "active" : ""}
          onClick={() => setFilter("Inactivo")}
        >
          Inactivos
        </button>
      </div>

      {/* Buscador */}
      <div className="instructor-list__search">
        <span>⌕</span>

        <input
          type="text"
          placeholder="Buscar instructor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Cantidad de resultados */}
      <div className="instructor-list__results">
        <h2>Instructores</h2>
        <span>
          {filteredInstructors.length} instructor
          {filteredInstructors.length !== 1 ? "es" : ""}
        </span>
      </div>

      {/* Lista */}
      <div className="instructor-list__items">
        {filteredInstructors.length > 0 ? (
          filteredInstructors.map((instructor) => (
            <InstructorCard
              key={instructor.id}
              instructor={instructor}
              onView={onView}
              onEdit={onEdit}
            />
          ))
        ) : (
          <div className="instructor-list__empty">
            <span>👤</span>
            <h3>No se encontraron instructores</h3>
            <p>
              Intenta cambiar el filtro o realizar otra búsqueda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorList;