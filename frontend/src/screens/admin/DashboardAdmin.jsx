import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Loading from "../../components/common/Loading/Loading";
import ErrorMessage from "../../components/common/ErrorMessage/ErrorMessage";
import StatCard from "../../components/dashboard/StatCard";
import QuickActions from "../../components/dashboard/QuickActions";
import RecentActivity from "../../components/dashboard/RecentActivity";

import "./DashboardAdmin.css";

function DashboardAdmin() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    pendingAcademies: 0,
    activeUsers: 0,
    activeClasses: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        /*
         * Cuando el backend esté conectado se podrán obtener las
         * métricas reales desde los endpoints correspondientes.
         *
         * Ejemplo:
         *
         * const academiesData = await academiesService.getPendingReview();
         * const usersData = await usersService.getActiveCount();
         */

        // Datos de demostración temporales
        setStats({
          pendingAcademies: 4,
          activeUsers: 128,
          activeClasses: 32,
        });

        setRecentActivity([
          {
            id: 1,
            icon: "🏫",
            text: "Academia Ritmo Caribe solicitó revisión",
            date: new Date().toISOString(),
          },
          {
            id: 2,
            icon: "👤",
            text: "Nuevo usuario registrado: Laura Gómez",
            date: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          },
          {
            id: 3,
            icon: "💃",
            text: "Se publicó la clase Salsa Intermedia",
            date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
        ]);
      } catch (err) {
        setError(
          err.message || "No se pudo cargar el dashboard del administrador.",
        );
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 400);
      }
    };

    loadDashboard();
  }, []);

  const quickActions = [
    {
      id: "review-academies",
      label: "Revisar academias",
      icon: "🏫",
      onClick: () => navigate("/admin/academias"),
    },
    {
      id: "manage-users",
      label: "Gestionar usuarios",
      icon: "👤",
      onClick: () => navigate("/admin/usuarios"),
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-admin-page">
        <Loading />
      </div>
    );
  }

  return (
    <div className="dashboard-admin-page">
      <div className="dashboard-admin-container">
        <header className="dashboard-admin-header">
          <div>
            <span className="dashboard-admin-subtitle">
              Panel de administración
            </span>

            <h1>Dashboard</h1>

            <p>
              Bienvenido a Danzas.app. Desde aquí puedes supervisar las
              academias, usuarios y clases de la plataforma.
            </p>
          </div>
        </header>

        {error && (
          <div className="dashboard-admin-error">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Estadísticas */}
        <section className="admin-stats">
          <StatCard
            icon="🏫"
            label="Academias pendientes de revisión"
            value={stats.pendingAcademies}
          />

          <StatCard
            icon="👤"
            label="Usuarios activos"
            value={stats.activeUsers}
          />

          <StatCard
            icon="💃"
            label="Clases activas"
            value={stats.activeClasses}
          />
        </section>

        {/* Accesos rápidos y actividad reciente */}
        <section className="admin-content-grid">
          <div className="admin-panel">
            <div className="admin-panel-header">
              <h2>Accesos rápidos</h2>
              <p>Gestiona las áreas principales de la plataforma.</p>
            </div>

            <QuickActions actions={quickActions} />
          </div>

          <div className="admin-panel">
            <div className="admin-panel-header">
              <h2>Actividad reciente</h2>
              <p>Últimos movimientos registrados en la plataforma.</p>
            </div>

            <RecentActivity
              items={recentActivity}
              emptyMessage="Sin actividad reciente."
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export default DashboardAdmin;
