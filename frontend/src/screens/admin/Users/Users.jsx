import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Loading from "../../../components/Loading/Loading";
import ErrorMessage from "../../../components/ErrorMessage/ErrorMessage";
import EmptyState from "../../../components/EmptyState/EmptyState";
import api from "../../../services/api";

import "./Users.css";

function Users() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError("");

        /*
         * Cuando el backend tenga disponible el endpoint:
         *
         * const data = await api("/users");
         *
         * const result = Array.isArray(data)
         *   ? data
         *   : data?.users || data?.data || [];
         *
         * setUsers(result);
         */

        // Datos temporales para visualizar la pantalla
        const demoUsers = [
          {
            id: 1,
            nombre: "María González",
            correo: "maria@email.com",
            rol: "estudiante",
            ciudad: "Guamal",
            estado: "activo",
          },
          {
            id: 2,
            nombre: "Carlos Rodríguez",
            correo: "carlos@email.com",
            rol: "instructor",
            ciudad: "Guamal",
            estado: "activo",
          },
          {
            id: 3,
            nombre: "Laura Martínez",
            correo: "laura@email.com",
            rol: "padre",
            ciudad: "Santa Marta",
            estado: "activo",
          },
          {
            id: 4,
            nombre: "Andrés Pérez",
            correo: "andres@email.com",
            rol: "estudiante",
            ciudad: "Ciénaga",
            estado: "inactivo",
          },
        ];

        setTimeout(() => {
          setUsers(demoUsers);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError(err.message || "No se pudieron cargar los usuarios.");
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const searchValue = search.toLowerCase().trim();

    const matchesSearch =
      !searchValue ||
      user.nombre?.toLowerCase().includes(searchValue) ||
      user.correo?.toLowerCase().includes(searchValue) ||
      user.ciudad?.toLowerCase().includes(searchValue);

    const matchesRole = !roleFilter || user.rol === roleFilter;

    const matchesStatus = !statusFilter || user.estado === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleLabel = (role) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "instructor":
        return "Instructor";
      case "estudiante":
        return "Estudiante";
      case "padre":
        return "Padre de familia";
      default:
        return role || "Sin rol";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "activo":
        return "Activo";
      case "inactivo":
        return "Inactivo";
      default:
        return status || "Sin estado";
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const handleViewUser = (id) => {
    navigate(`/admin/usuarios/${id}`);
  };

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("");
    setStatusFilter("");
  };

  if (loading) {
    return (
      <div className="users-page">
        <Loading />
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="users-container">
        {/* Encabezado */}
        <div className="users-header">
          <div>
            <span className="users-subtitle">Administración</span>

            <h1>Usuarios</h1>

            <p>Consulta y administra los usuarios registrados en Danzas.app.</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="users-error">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Resumen */}
        <div className="users-summary">
          <div className="user-summary-card">
            <span className="summary-number">{users.length}</span>

            <span className="summary-label">Total usuarios</span>
          </div>

          <div className="user-summary-card">
            <span className="summary-number">
              {users.filter((user) => user.estado === "activo").length}
            </span>

            <span className="summary-label">Usuarios activos</span>
          </div>

          <div className="user-summary-card">
            <span className="summary-number">
              {users.filter((user) => user.rol === "instructor").length}
            </span>

            <span className="summary-label">Instructores</span>
          </div>

          <div className="user-summary-card">
            <span className="summary-number">
              {users.filter((user) => user.rol === "estudiante").length}
            </span>

            <span className="summary-label">Estudiantes</span>
          </div>
        </div>

        {/* Lista */}
        <section className="users-section">
          <div className="users-section-header">
            <div>
              <h2>Lista de usuarios</h2>

              <p>
                {filteredUsers.length} usuario
                {filteredUsers.length !== 1 ? "s" : ""} encontrado
                {filteredUsers.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Filtros */}
          <div className="users-filters">
            <div className="search-box">
              <span>🔎</span>

              <input
                type="text"
                placeholder="Buscar por nombre, correo o ciudad..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="instructor">Instructor</option>
              <option value="estudiante">Estudiante</option>
              <option value="padre">Padre de familia</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>

            {(search || roleFilter || statusFilter) && (
              <button
                type="button"
                className="clear-filters"
                onClick={clearFilters}
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Tabla */}
          {filteredUsers.length === 0 ? (
            <EmptyState
              title="No se encontraron usuarios"
              message="No hay usuarios que coincidan con los filtros seleccionados."
            />
          ) : (
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Ciudad</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {getInitials(user.nombre)}
                          </div>

                          <div>
                            <strong>{user.nombre}</strong>

                            <span>ID: {user.id}</span>
                          </div>
                        </div>
                      </td>

                      <td>{user.correo}</td>

                      <td>
                        <span className={`role-badge role-${user.rol}`}>
                          {getRoleLabel(user.rol)}
                        </span>
                      </td>

                      <td>{user.ciudad || "—"}</td>

                      <td>
                        <span className={`status-badge status-${user.estado}`}>
                          {getStatusLabel(user.estado)}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="view-user-button"
                          onClick={() => handleViewUser(user.id)}
                        >
                          Ver detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Users;
