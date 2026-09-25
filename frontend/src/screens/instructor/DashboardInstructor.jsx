import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Loading from "../../components/common/Loading/Loading";
import ErrorMessage from "../../components/common/ErrorMessage/ErrorMessage";
import StatCard from "../../components/dashboard/StatCard";
import QuickActions from "../../components/dashboard/QuickActions";
import RecentActivity from "../../components/dashboard/RecentActivity";

import "./DashboardInstructor.css";

function DashboardInstructor() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    activeClasses: 0,
    enrolledStudents: 0,
    nextSession: "",
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
         * const classesData = await classesService.getMine();
         * const enrollmentsData = await enrollmentsService.getByInstructor();
         */

        // Datos de demostración temporales
        setStats({
          activeClasses: 5,
          enrolledStudents: 47,
          nextSession: "Hoy · 5:00 PM",
        });

        setRecentActivity([
          {
            id: 1,
            icon: "📝",
            text: "Nueva inscripción en Salsa Básica",
            date: new Date().toISOString(),
          },
          {
            id: 2,
            icon: "✓",
            text: "Asistencia registrada para Bachata Inicial",
            date: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          },
          {
            id: 3,
            icon: "💃",
            text: "Se actualizó el horario de Salsa Intermedia",
            date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          },
        ]);
      } catch (err) {
        setError(
          err.message || "No se pudo cargar el dashboard del instructor.",
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
      id: "my-classes",
      label: "Mis clases",
      icon: "💃",
      onClick: () => navigate("/instructor/clases"),
    },
    {
      id: "new-class",
      label: "Nueva clase",
      icon: "➕",
      onClick: () => navigate("/instructor/clases/nueva"),
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-instructor-page">
        <Loading />
      </div>
    );
  }

  return (
    <div className="dashboard-instructor-page">
      <div className="dashboard-instructor-container">
        <header className="dashboard-instructor-header">
          <div>
            <span className="dashboard-instructor-subtitle">
              Panel del instructor
            </span>

            <h1>Dashboard</h1>

            <p>
              Bienvenido a Danzas.app. Desde aquí puedes gestionar tus clases
              y hacer seguimiento a tus estudiantes.
            </p>
          </div>
        </header>

        {error && (
          <div className="dashboard-instructor-error">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Estadísticas */}
        <section className="instructor-stats">
          <StatCard
            icon="💃"
            label="Clases activas"
            value={stats.activeClasses}
          />

          <StatCard
            icon="👥"
            label="Estudiantes inscritos"
            value={stats.enrolledStudents}
          />

          <StatCard
            icon="🕐"
            label="Próxima sesión"
            value={stats.nextSession}
          />
        </section>

        {/* Accesos rápidos y actividad reciente */}
        <section className="instructor-content-grid">
          <div className="instructor-panel">
            <div className="instructor-panel-header">
              <h2>Accesos rápidos</h2>
              <p>Gestiona tus clases desde un solo lugar.</p>
            </div>

            <QuickActions actions={quickActions} />
          </div>

          <div className="instructor-panel">
            <div className="instructor-panel-header">
              <h2>Actividad reciente</h2>
              <p>Últimos movimientos en tus clases.</p>
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

export default DashboardInstructor;
