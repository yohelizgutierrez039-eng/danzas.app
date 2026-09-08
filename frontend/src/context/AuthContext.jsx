import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AcademiesAdmin.css";

function AcademiesAdmin() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Todas");
  const [search, setSearch] = useState("");

  // Datos temporales.
  // Más adelante estos datos vendrán desde el backend.
  const [academies, setAcademies] = useState([
    {
      id: 1,
      name: "Ritmo & Sabor",
      location: "Medellín, Antioquia",
      owner: "Carlos Gómez",
      styles: ["Salsa", "Bachata"],
      status: "Pendiente",
      date: "10 Ago 2026",
      students: 45,
    },
    {
      id: 2,
      name: "Urban Dance Studio",
      location: "Bogotá, Cundinamarca",
      owner: "Laura Martínez",
      styles: ["Hip Hop", "Bachata"],
      status: "Aprobada",
      date: "08 Ago 2026",
      students: 78,
    },
    {
      id: 3,
      name: "Ballet Arte",
      location: "Cali, Valle del Cauca",
      owner: "Andrea López",
      styles: ["Ballet", "Contemporáneo"],
      status: "Aprobada",
      date: "05 Ago 2026",
      students: 52,
    },
    {
      id: 4,
      name: "Pasión Latina",
      location: "Barranquilla, Atlántico",
      owner: "Miguel Rojas",
      styles: ["Salsa", "Ritmos latinos"],
      status: "Rechazada",
      date: "03 Ago 2026",
      students: 31,
    },
    {
      id: 5,
      name: "Ritmo Caribe",
      location: "Cartagena, Bolívar",
      owner: "Sofía Ramírez",
      styles: ["Salsa", "Merengue"],
      status: "Pendiente",
      date: "01 Ago 2026",
      students: 26,
    },
  ]);

  const filteredAcademies = useMemo(() => {
    return academies.filter((academy) => {
      const matchesTab = activeTab === "Todas" || academy.status === activeTab;

      const searchText = search.toLowerCase();

      const matchesSearch =
        academy.name.toLowerCase().includes(searchText) ||
        academy.location.toLowerCase().includes(searchText) ||
        academy.owner.toLowerCase().includes(searchText);

      return matchesTab && matchesSearch;
    });
  }, [academies, activeTab, search]);

  const handleApprove = (id) => {
    setAcademies((prev) =>
      prev.map((academy) =>
        academy.id === id ? { ...academy, status: "Aprobada" } : academy,
      ),
    );
  };

  const handleReject = (id) => {
    setAcademies((prev) =>
      prev.map((academy) =>
        academy.id === id ? { ...academy, status: "Rechazada" } : academy,
      ),
    );
  };

  const handleViewDetails = (academy) => {
    // Ruta preparada para la pantalla de detalle.
    navigate(`/admin/academias/${academy.id}`);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Aprobada":
        return "academy-status approved";

      case "Pendiente":
        return "academy-status pending";

      case "Rechazada":
        return "academy-status rejected";

      default:
        return "academy-status";
    }
  };

  const totalAcademies = academies.length;
  const pendingAcademies = academies.filter(
    (academy) => academy.status === "Pendiente",
  ).length;
  const approvedAcademies = academies.filter(
    (academy) => academy.status === "Aprobada",
  ).length;
  const rejectedAcademies = academies.filter(
    (academy) => academy.status === "Rechazada",
  ).length;

  return (
    <section className="academies-admin">
      {/* ENCABEZADO */}
      <div className="academies-admin-header">
        <div>
          <span className="academies-admin-breadcrumb">
            Administración / Academias
          </span>

          <h1>Gestión de academias</h1>

          <p>
            Administra, revisa y controla las academias registradas en
            Danzas.app.
          </p>
        </div>

        <button
          type="button"
          className="academies-primary-button"
          onClick={() => navigate("/admin/academias/nueva")}
        >
          <span>＋</span>
          Nueva academia
        </button>
      </div>

      {/* ESTADÍSTICAS */}
      <div className="academies-stats">
        <div className="academy-stat-card">
          <div className="academy-stat-icon purple">⌂</div>

          <div>
            <span>Total academias</span>
            <strong>{totalAcademies}</strong>
          </div>
        </div>

        <div className="academy-stat-card">
          <div className="academy-stat-icon orange">◷</div>

          <div>
            <span>Pendientes</span>
            <strong>{pendingAcademies}</strong>
          </div>
        </div>

        <div className="academy-stat-card">
          <div className="academy-stat-icon green">✓</div>

          <div>
            <span>Aprobadas</span>
            <strong>{approvedAcademies}</strong>
          </div>
        </div>

        <div className="academy-stat-card">
          <div className="academy-stat-icon red">×</div>

          <div>
            <span>Rechazadas</span>
            <strong>{rejectedAcademies}</strong>
          </div>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="academies-admin-card">
        {/* TABS */}
        <div className="academies-tabs">
          {["Todas", "Pendiente", "Aprobada", "Rechazada"].map((tab) => (
            <button
              type="button"
              key={tab}
              className={
                activeTab === tab ? "academy-tab active" : "academy-tab"
              }
              onClick={() => setActiveTab(tab)}
            >
              {tab === "Todas" ? "Todas" : `${tab}s`}
            </button>
          ))}
        </div>

        {/* BÚSQUEDA */}
        <div className="academies-toolbar">
          <div className="academy-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Buscar academia..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button type="button" className="academy-filter-button">
            ⚙ Filtros
          </button>
        </div>

        {/* TABLA */}
        <div className="academies-table-wrapper">
          <table className="academies-table">
            <thead>
              <tr>
                <th>Academia</th>
                <th>Propietario</th>
                <th>Ubicación</th>
                <th>Estilos</th>
                <th>Estudiantes</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredAcademies.length > 0 ? (
                filteredAcademies.map((academy) => (
                  <tr key={academy.id}>
                    <td>
                      <div className="academy-info">
                        <div className="academy-logo">
                          {academy.name.charAt(0)}
                        </div>

                        <div>
                          <strong>{academy.name}</strong>
                          <small>Registrada el {academy.date}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="academy-owner">{academy.owner}</span>
                    </td>

                    <td>
                      <span className="academy-location">
                        ◉ {academy.location}
                      </span>
                    </td>

                    <td>
                      <div className="academy-styles">
                        {academy.styles.map((style) => (
                          <span key={style}>{style}</span>
                        ))}
                      </div>
                    </td>

                    <td>
                      <strong className="academy-students">
                        {academy.students}
                      </strong>
                    </td>

                    <td>
                      <span className={getStatusClass(academy.status)}>
                        <span className="status-dot"></span>
                        {academy.status}
                      </span>
                    </td>

                    <td>
                      <div className="academy-actions">
                        <button
                          type="button"
                          className="action-view"
                          title="Ver detalles"
                          onClick={() => handleViewDetails(academy)}
                        >
                          Ver detalles
                        </button>

                        {academy.status === "Pendiente" && (
                          <>
                            <button
                              type="button"
                              className="action-approve"
                              title="Aprobar academia"
                              onClick={() => handleApprove(academy.id)}
                            >
                              ✓
                            </button>

                            <button
                              type="button"
                              className="action-reject"
                              title="Rechazar academia"
                              onClick={() => handleReject(academy.id)}
                            >
                              ×
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          className="action-more"
                          title="Más opciones"
                        >
                          ⋯
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="academies-empty">
                    <div className="academies-empty-icon">⌕</div>

                    <h3>No se encontraron academias</h3>

                    <p>Intenta cambiar el filtro o realizar otra búsqueda.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        <div className="academies-pagination">
          <span>
            Mostrando <strong>{filteredAcademies.length}</strong> de{" "}
            <strong>{academies.length}</strong> academias
          </span>

          <div className="pagination-buttons">
            <button type="button" disabled>
              ←
            </button>

            <button type="button" className="pagination-active">
              1
            </button>

            <button type="button">2</button>
            <button type="button">3</button>

            <button type="button">→</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AcademiesAdmin;
