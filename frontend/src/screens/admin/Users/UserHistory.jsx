import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Loading from "../../../components/Loading/Loading";
import ErrorMessage from "../../../components/ErrorMessage/ErrorMessage";
import EmptyState from "../../../components/EmptyState/EmptyState";
import api from "../../../services/api";

import "./UserHistory.css";

function UserHistory() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        setError("");

        /*
         * Backend:
         * const data = await api(`/users/${id}/enrollments`);
         *
         * Este endpoint sí está contemplado en el proyecto.
         */

        /*
        const data = await api(`/users/${id}/enrollments`);

        const result = Array.isArray(data)
          ? data
          : data?.enrollments || data?.data || [];

        setHistory(result);
        */

        // Datos de demostración temporales
        const demoUsers = {
          1: {
            id: 1,
            nombre: "María González",
            correo: "maria@email.com",
          },
          2: {
            id: 2,
            nombre: "Carlos Rodríguez",
            correo: "carlos@email.com",
          },
          3: {
            id: 3,
            nombre: "Laura Martínez",
            correo: "laura@email.com",
          },
          4: {
            id: 4,
            nombre: "Andrés Pérez",
            correo: "andres@email.com",
          },
        };

        const demoHistory = {
          1: [
            {
              id: 101,
              tipo: "inscripcion",
              titulo: "Inscripción a Salsa Básica",
              descripcion:
                "Se realizó una inscripción a la clase Salsa Básica.",
              fecha: "2026-08-20",
              estado: "activa",
              clase: "Salsa Básica",
              academia: "Academia Ritmo Caribe",
            },
            {
              id: 102,
              tipo: "pago",
              titulo: "Pago de inscripción",
              descripcion: "Pago correspondiente a Salsa Básica.",
              fecha: "2026-08-20",
              estado: "completado",
              valor: 50000,
              clase: "Salsa Básica",
            },
            {
              id: 103,
              tipo: "asistencia",
              titulo: "Asistencia registrada",
              descripcion: "Asistencia registrada en Salsa Básica.",
              fecha: "2026-08-25",
              estado: "presente",
              clase: "Salsa Básica",
            },
            {
              id: 104,
              tipo: "inscripcion",
              titulo: "Inscripción a Bachata Inicial",
              descripcion:
                "Se realizó una inscripción a la clase Bachata Inicial.",
              fecha: "2026-08-28",
              estado: "activa",
              clase: "Bachata Inicial",
              academia: "Academia Ritmo Caribe",
            },
          ],

          2: [
            {
              id: 201,
              tipo: "clase",
              titulo: "Clase creada",
              descripcion: "El instructor creó la clase Salsa Básica.",
              fecha: "2026-08-10",
              estado: "completado",
              clase: "Salsa Básica",
            },
            {
              id: 202,
              tipo: "clase",
              titulo: "Clase actualizada",
              descripcion: "Se modificó la información de la clase.",
              fecha: "2026-08-18",
              estado: "completado",
              clase: "Salsa Básica",
            },
            {
              id: 203,
              tipo: "clase",
              titulo: "Clase publicada",
              descripcion: "La clase fue publicada en Danzas.app.",
              fecha: "2026-08-19",
              estado: "completado",
              clase: "Salsa Básica",
            },
          ],

          3: [
            {
              id: 301,
              tipo: "inscripcion",
              titulo: "Inscripción de dependiente",
              descripcion: "Se realizó una inscripción para un menor.",
              fecha: "2026-08-22",
              estado: "activa",
              clase: "Danza Urbana",
              academia: "Academia Ritmo Caribe",
            },
            {
              id: 302,
              tipo: "pago",
              titulo: "Pago realizado",
              descripcion: "Pago correspondiente a la inscripción.",
              fecha: "2026-08-22",
              estado: "completado",
              valor: 45000,
              clase: "Danza Urbana",
            },
          ],

          4: [],
        };

        const selectedUser = demoUsers[id];

        if (!selectedUser) {
          setError("No se encontró el usuario solicitado.");
          return;
        }

        setUser(selectedUser);
        setHistory(demoHistory[id] || []);
      } catch (err) {
        setError(err.message || "No se pudo cargar el historial del usuario.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [id]);

  const getTypeLabel = (type) => {
    switch (type) {
      case "inscripcion":
        return "Inscripción";
      case "pago":
        return "Pago";
      case "asistencia":
        return "Asistencia";
      case "clase":
        return "Clase";
      default:
        return type || "Actividad";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "activa":
        return "Activa";
      case "completado":
        return "Completado";
      case "presente":
        return "Presente";
      case "cancelada":
        return "Cancelada";
      case "pendiente":
        return "Pendiente";
      default:
        return status || "Sin estado";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "inscripcion":
        return "📝";
      case "pago":
        return "💳";
      case "asistencia":
        return "✓";
      case "clase":
        return "💃";
      default:
        return "•";
    }
  };

  const formatDate = (date) => {
    if (!date) return "Fecha no disponible";

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return null;

    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const filteredHistory = history.filter((item) => {
    return !typeFilter || item.tipo === typeFilter;
  });

  const totalPayments = history
    .filter((item) => item.tipo === "pago" && item.valor)
    .reduce((total, item) => total + Number(item.valor), 0);

  const totalEnrollments = history.filter(
    (item) => item.tipo === "inscripcion",
  ).length;

  const totalAttendances = history.filter(
    (item) => item.tipo === "asistencia",
  ).length;

  if (loading) {
    return (
      <div className="user-history-page">
        <Loading />
      </div>
    );
  }

  return (
    <div className="user-history-page">
      <div className="user-history-container">
        <div className="user-history-header">
          <div>
            <span className="user-history-subtitle">
              Administración de usuarios
            </span>

            <h1>Historial del usuario</h1>

            {user && (
              <p>
                Consulta la actividad registrada de{" "}
                <strong>{user.nombre}</strong>.
              </p>
            )}
          </div>

          <button
            type="button"
            className="back-button"
            onClick={() => navigate(`/admin/usuarios/${id}`)}
          >
            ← Volver
          </button>
        </div>

        {error && (
          <div className="user-history-error">
            <ErrorMessage message={error} />
          </div>
        )}

        {user && (
          <div className="user-history-profile">
            <div className="history-avatar">
              {user.nombre
                ?.split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((word) => word[0])
                .join("")
                .toUpperCase()}
            </div>

            <div>
              <h2>{user.nombre}</h2>
              <p>{user.correo}</p>
              <span>ID de usuario: {user.id}</span>
            </div>
          </div>
        )}

        <div className="history-summary">
          <div className="history-summary-card">
            <span className="summary-number">{history.length}</span>
            <span className="summary-label">Actividades</span>
          </div>

          <div className="history-summary-card">
            <span className="summary-number">{totalEnrollments}</span>
            <span className="summary-label">Inscripciones</span>
          </div>

          <div className="history-summary-card">
            <span className="summary-number">{totalAttendances}</span>
            <span className="summary-label">Asistencias</span>
          </div>

          <div className="history-summary-card">
            <span className="summary-number">
              {formatCurrency(totalPayments) || "$0"}
            </span>
            <span className="summary-label">Pagos registrados</span>
          </div>
        </div>

        <section className="history-section">
          <div className="history-section-header">
            <div>
              <h2>Actividad</h2>
              <p>
                {filteredHistory.length} actividad
                {filteredHistory.length !== 1 ? "es" : ""} encontrada
                {filteredHistory.length !== 1 ? "s" : ""}
              </p>
            </div>

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="">Todas las actividades</option>
              <option value="inscripcion">Inscripciones</option>
              <option value="pago">Pagos</option>
              <option value="asistencia">Asistencias</option>
              <option value="clase">Clases</option>
            </select>
          </div>

          {filteredHistory.length === 0 ? (
            <EmptyState
              title="No hay actividades registradas"
              message="Este usuario todavía no tiene actividades que coincidan con el filtro seleccionado."
            />
          ) : (
            <div className="history-list">
              {filteredHistory.map((item) => (
                <article className="history-item" key={item.id}>
                  <div className="history-icon">{getTypeIcon(item.tipo)}</div>

                  <div className="history-content">
                    <div className="history-item-top">
                      <div>
                        <span className="history-type">
                          {getTypeLabel(item.tipo)}
                        </span>

                        <h3>{item.titulo}</h3>
                      </div>

                      <span
                        className={`history-status history-status-${item.estado}`}
                      >
                        {getStatusLabel(item.estado)}
                      </span>
                    </div>

                    <p className="history-description">{item.descripcion}</p>

                    <div className="history-meta">
                      <span>📅 {formatDate(item.fecha)}</span>

                      {item.clase && <span>💃 {item.clase}</span>}

                      {item.academia && <span>🏫 {item.academia}</span>}

                      {item.valor !== undefined && (
                        <span>💰 {formatCurrency(item.valor)}</span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default UserHistory;
