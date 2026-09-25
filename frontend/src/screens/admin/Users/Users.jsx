// src/screens/admin/Users/Users.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";

import Loading from "../../../components/common/Loading/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage/ErrorMessage";
import EmptyState from "../../../components/common/EmptyState/EmptyState";
import Input from "../../../components/common/Input/Input";
import Select from "../../../components/common/Select/Select";
import { getUsers } from "../../../services/users.service";

import "./Users.css";

const ROLE_OPTIONS = [
  { value: "admin", label: "Administrador" },
  { value: "instructor", label: "Instructor" },
  { value: "estudiante", label: "Estudiante" },
  { value: "padre", label: "Padre de familia" },
];

const STATUS_OPTIONS = [
  { value: "activo", label: "Activo" },
  { value: "pendiente", label: "Pendiente" },
  { value: "suspendido", label: "Suspendido" },
];

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

        const data = await getUsers();

        const result = Array.isArray(data)
          ? data
          : data?.users || data?.data || [];

        setUsers(result);
      } catch (err) {
        setError(err.message || "No se pudieron cargar los usuarios.");
      } finally {
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
      case "pendiente":
        return "Pendiente";
      case "suspendido":
        return "Suspendido";
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
            <ErrorMessage message={error} onClose={() => setError("")} />
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
            <Input
              name="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, correo o ciudad..."
              icon={<FiSearch />}
              fullWidth={false}
              className="users-search-input"
            />

            <Select
              name="roleFilter"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              options={ROLE_OPTIONS}
              placeholder="Todos los roles"
              fullWidth={false}
              className="users-filter-select"
            />

            <Select
              name="statusFilter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              options={STATUS_OPTIONS}
              placeholder="Todos los estados"
              fullWidth={false}
              className="users-filter-select"
            />

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
              description="No hay usuarios que coincidan con los filtros seleccionados."
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
