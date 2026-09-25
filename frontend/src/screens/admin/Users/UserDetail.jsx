// src/screens/admin/Users/UserDetail.jsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Loading from "../../../components/common/Loading/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage/ErrorMessage";
import ConfirmDialog from "../../../components/common/ConfirmDialog/ConfirmDialog";
import { getUserById, suspendUser, deleteUser } from "../../../services/users.service";

import "./UserDetail.css";

function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dialog, setDialog] = useState({ isOpen: false, type: null });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getUserById(id);

        const result = data?.user || data?.data || data;

        setUser(result);
      } catch (err) {
        setError(
          err.message || "No se pudo cargar la información del usuario.",
        );
      } finally {
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

  const formatDate = (date) => {
    if (!date) return "No disponible";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleBack = () => {
    navigate("/admin/usuarios");
  };

  const openDialog = (type) => {
    setDialog({ isOpen: true, type });
  };

  const closeDialog = () => {
    if (actionLoading) return;

    setDialog({ isOpen: false, type: null });
  };

  const handleConfirmAction = async () => {
    if (!user) return;

    try {
      setActionLoading(true);
      setError("");

      if (dialog.type === "suspend") {
        await suspendUser(id);

        setUser((prev) => ({
          ...prev,
          estado: "suspendido",
        }));

        setDialog({ isOpen: false, type: null });
        return;
      }

      if (dialog.type === "delete") {
        await deleteUser(id);

        navigate("/admin/usuarios");
        return;
      }
    } catch (err) {
      setError(err.message || "No se pudo completar la acción.");
    } finally {
      setActionLoading(false);
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

  const isSuspended = user.estado === "suspendido";

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
            <ErrorMessage message={error} onClose={() => setError("")} />
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
                <strong>{formatDate(user.creadoEn)}</strong>
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
            {!isSuspended && (
              <button
                type="button"
                className="btn-danger"
                onClick={() => openDialog("suspend")}
              >
                Suspender usuario
              </button>
            )}

            <button
              type="button"
              className="btn-danger"
              onClick={() => openDialog("delete")}
            >
              Eliminar usuario
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
      <ConfirmDialog
        isOpen={dialog.isOpen}
        title={dialog.type === "delete" ? "Eliminar usuario" : "Suspender usuario"}
        message={
          dialog.type === "delete"
            ? `¿Estás seguro de que deseas eliminar la cuenta de ${user.nombre}? Esta acción no se puede deshacer.`
            : `¿Estás seguro de que deseas suspender la cuenta de ${user.nombre}?`
        }
        confirmText={dialog.type === "delete" ? "Sí, eliminar" : "Sí, suspender"}
        cancelText="Cancelar"
        variant="danger"
        loading={actionLoading}
        onConfirm={handleConfirmAction}
        onCancel={closeDialog}
      />
    </div>
  );
}

export default UserDetail;
