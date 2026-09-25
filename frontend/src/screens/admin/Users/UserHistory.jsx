// src/screens/admin/Users/UserHistory.jsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Loading from "../../../components/common/Loading/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage/ErrorMessage";
import EmptyState from "../../../components/common/EmptyState/EmptyState";
import Select from "../../../components/common/Select/Select";
import { getUserById } from "../../../services/users.service";
import { getEnrollmentHistory } from "../../../services/enrollments.service";

import "./UserHistory.css";

// Estados reales de una Inscripción (ver backend/prisma/schema.prisma).
const STATUS_OPTIONS = [
  { value: "pendiente_pago", label: "Pendientes de pago" },
  { value: "confirmada", label: "Confirmadas" },
  { value: "cancelada", label: "Canceladas" },
];

function UserHistory() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const [userData, historyData] = await Promise.all([
          getUserById(id),
          getEnrollmentHistory(id),
        ]);

        const resolvedUser = userData?.user || userData?.data || userData;

        const resolvedHistory = Array.isArray(historyData)
          ? historyData
          : historyData?.enrollments || historyData?.data || [];

        if (!resolvedUser) {
          setError("No se encontró el usuario solicitado.");
          return;
        }

        setUser(resolvedUser);
        setHistory(resolvedHistory);
      } catch (err) {
        setError(
          err.message || "No se pudo cargar el historial del usuario.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [id]);

  const getStatusLabel = (status) => {
    switch (status) {
      case "pendiente_pago":
        return "Pendiente de pago";
      case "confirmada":
        return "Confirmada";
      case "cancelada":
        return "Cancelada";
      default:
        return status || "Sin estado";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmada":
        return "✓";
      case "cancelada":
        return "✕";
      case "pendiente_pago":
        return "💳";
      default:
        return "•";
    }
  };

  const formatDate = (date) => {
    if (!date) return "Fecha no disponible";

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

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return null;

    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const filteredHistory = history.filter((item) => {
    return !statusFilter || item.estado === statusFilter;
  });

  const totalConfirmed = history.filter(
    (item) => item.estado === "confirmada",
  ).length;

  const totalCancelled = history.filter(
    (item) => item.estado === "cancelada",
  ).length;

  const totalPaid = history
    .filter((item) => item.pago?.estado === "aprobado")
    .reduce((total, item) => total + Number(item.pago?.monto || 0), 0);

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
                Consulta las inscripciones registradas de{" "}
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
            <ErrorMessage message={error} onClose={() => setError("")} />
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
            <span className="summary-label">Inscripciones</span>
          </div>

          <div className="history-summary-card">
            <span className="summary-number">{totalConfirmed}</span>
            <span className="summary-label">Confirmadas</span>
          </div>

          <div className="history-summary-card">
            <span className="summary-number">{totalCancelled}</span>
            <span className="summary-label">Canceladas</span>
          </div>

          <div className="history-summary-card">
            <span className="summary-number">
              {formatCurrency(totalPaid) || "$0"}
            </span>
            <span className="summary-label">Pagos aprobados</span>
          </div>
        </div>

        <section className="history-section">
          <div className="history-section-header">
            <div>
              <h2>Inscripciones</h2>
              <p>
                {filteredHistory.length} inscripción
                {filteredHistory.length !== 1 ? "es" : ""} encontrada
                {filteredHistory.length !== 1 ? "s" : ""}
              </p>
            </div>

            <Select
              name="statusFilter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              options={STATUS_OPTIONS}
              placeholder="Todos los estados"
              fullWidth={false}
              className="history-filter-select"
            />
          </div>

          {filteredHistory.length === 0 ? (
            <EmptyState
              title="No hay inscripciones registradas"
              description="Este usuario todavía no tiene inscripciones que coincidan con el filtro seleccionado."
            />
          ) : (
            <div className="history-list">
              {filteredHistory.map((item) => (
                <article className="history-item" key={item.id}>
                  <div className="history-icon">
                    {getStatusIcon(item.estado)}
                  </div>

                  <div className="history-content">
                    <div className="history-item-top">
                      <div>
                        <span className="history-type">Inscripción</span>

                        <h3>
                          {item.clase?.tipoBaile
                            ? `Inscripción a ${item.clase.tipoBaile}`
                            : "Inscripción"}
                        </h3>
                      </div>

                      <span
                        className={`history-status history-status-${item.estado}`}
                      >
                        {getStatusLabel(item.estado)}
                      </span>
                    </div>

                    <div className="history-meta">
                      <span>📅 {formatDate(item.creadoEn)}</span>

                      {item.clase?.ciudad && <span>📍 {item.clase.ciudad}</span>}

                      {item.menor && <span>👤 {item.menor.nombre}</span>}

                      {item.pago?.monto !== undefined && (
                        <span>💰 {formatCurrency(item.pago.monto)}</span>
                      )}

                      {Array.isArray(item.asistencias) && (
                        <span>✓ {item.asistencias.length} asistencias</span>
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
