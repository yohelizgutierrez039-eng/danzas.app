import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Loading from "../../../components/Loading/Loading";
import ErrorMessage from "../../../components/ErrorMessage/ErrorMessage";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import api from "../../../services/api";

import "./UserDetail.css";

function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        setError("");

        /*
         * Cuando el backend tenga disponible el endpoint:
         *
         * const data = await api(`/users/${id}`);
         *
         * const result = data?.user || data?.data || data;
         * setUser(result);
         */

        // Datos temporales para visualizar la pantalla
        const demoUsers = {
          1: {
            id: 1,
            nombre: "María González",
            correo: "maria@email.com",
            rol: "estudiante",
            ciudad: "Guamal",
            telefono: "300 000 0000",
            estado: "activo",
            fechaRegistro: "10 de agosto de 2026",
          },
          2: {
            id: 2,
            nombre: "Carlos Rodríguez",
            correo: "carlos@email.com",
            rol: "instructor",
            ciudad: "Guamal",
            telefono: "301 000 0000",
            estado: "activo",
            fechaRegistro: "5 de agosto de 2026",
          },
          3: {
            id: 3,
            nombre: "Laura Martínez",
            correo: "laura@email.com",
            rol: "padre",
            ciudad: "Santa Marta",
            telefono: "302 000 0000",
            estado: "activo",
            fechaRegistro: "1 de agosto de 2026",
          },
          4: {
            id: 4,
            nombre: "Andrés Pérez",
            correo: "andres@email.com",
            rol: "estudiante",
            ciudad: "Ciénaga",
            telefono: "303 000 0000",
            estado: "inactivo",
            fechaRegistro: "20 de julio de 2026",
          },
        };

        setTimeout(() => {
          setUser(
            demoUsers[id] || {
              id,
              nombre: "Usuario de ejemplo",
              correo: "usuario@email.com",
              rol: "estudiante",
              ciudad: "Guamal",
              telefono: "300 000 0000",
              estado: "activo",
              fechaRegistro: "10 de agosto de 2026",
            },
          );

          setLoading(false);
        }, 500);
      } catch (err) {
        setError(
          err.message || "No se pudo cargar la información del usuario.",
        );
        setLoading(false);
      }
    };

    loadUser();
  }, [id]);

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

  const handleBack = () => {
    navigate("/admin/usuarios");
  };

  const handleToggleStatus = async () => {
    try {
      setUpdatingStatus(true);
      setError("");

      const newStatus = user.estado === "activo" ? "inactivo" : "activo";

      /*
       * Cuando el backend defina el endpoint correspondiente,
       * realizar aquí la petición.
       *
       * Ejemplo:
       *
       * await api(`/users/${id}/status`, {
       *   method: "PUT",
       *   body: JSON.stringify({
       *     status: newStatus,
       *   }),
       * });
       */

      setUser((prev) => ({
        ...prev,
        estado: newStatus,
      }));

      setShowStatusDialog(false);
    } catch (err) {
      setError(err.message || "No se pudo actualizar el estado del usuario.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="user-detail-page">
        <Loading />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-detail-page">
        <div className="user-detail-not-found">
          <h2>Usuario no encontrado</h2>

          <button type="button" className="btn-primary" onClick={handleBack}>
            Volver a usuarios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-detail-page">
      <div className="user-detail-container">
        {/* Encabezado */}
        <div className="user-detail-header">
          <div>
            <button type="button" className="back-button" onClick={handleBack}>
              ← Volver a usuarios
            </button>

            <div className="profile-header">
              <div className="profile-avatar">{getInitials(user.nombre)}</div>

              <div className="profile-info">
                <span className="profile-subtitle">Detalle del usuario</span>

                <h1>{user.nombre}</h1>

                <p>{user.correo}</p>
              </div>
            </div>
          </div>

          <span className={`status-badge status-${user.estado}`}>
            {getStatusLabel(user.estado)}
          </span>
        </div>

        {error && (
          <div className="user-detail-error">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Información */}
        <div className="user-detail-grid">
          <section className="detail-card">
            <div className="card-header">
              <h2>Información personal</h2>
            </div>

            <div className="info-list">
              <div className="info-item">
                <span>Nombre completo</span>
                <strong>{user.nombre}</strong>
              </div>

              <div className="info-item">
                <span>Correo electrónico</span>
                <strong>{user.correo}</strong>
              </div>

              <div className="info-item">
                <span>Teléfono</span>
                <strong>{user.telefono || "No registrado"}</strong>
              </div>

              <div className="info-item">
                <span>Ciudad</span>
                <strong>{user.ciudad || "No registrada"}</strong>
              </div>
            </div>
          </section>

          <section className="detail-card">
            <div className="card-header">
              <h2>Información de la cuenta</h2>
            </div>

            <div className="info-list">
              <div className="info-item">
                <span>ID del usuario</span>
                <strong>{user.id}</strong>
              </div>

              <div className="info-item">
                <span>Rol</span>

                <span className={`role-badge role-${user.rol}`}>
                  {getRoleLabel(user.rol)}
                </span>
              </div>

              <div className="info-item">
                <span>Estado</span>

                <span className={`status-badge status-${user.estado}`}>
                  {getStatusLabel(user.estado)}
                </span>
              </div>

              <div className="info-item">
                <span>Fecha de registro</span>
                <strong>{user.fechaRegistro || "No disponible"}</strong>
              </div>
            </div>
          </section>
        </div>

        {/* Acciones */}
        <section className="detail-card actions-card">
          <div className="card-header">
            <h2>Acciones administrativas</h2>

            <p>Gestiona el estado de la cuenta del usuario.</p>
          </div>

          <div className="admin-actions">
            <button
              type="button"
              className={
                user.estado === "activo" ? "btn-danger" : "btn-primary"
              }
              onClick={() => setShowStatusDialog(true)}
            >
              {user.estado === "activo"
                ? "Desactivar usuario"
                : "Activar usuario"}
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleBack}
            >
              Volver a la lista
            </button>
          </div>
        </section>
      </div>

      {/* Confirmación */}
      {showStatusDialog && (
        <ConfirmDialog
          title={
            user.estado === "activo" ? "Desactivar usuario" : "Activar usuario"
          }
          message={
            user.estado === "activo"
              ? `¿Estás seguro de que deseas desactivar la cuenta de ${user.nombre}?`
              : `¿Deseas activar nuevamente la cuenta de ${user.nombre}?`
          }
          onConfirm={handleToggleStatus}
          onCancel={() => setShowStatusDialog(false)}
          loading={updatingStatus}
        />
      )}
    </div>
  );
}

export default UserDetail;
