import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Loading from "../../components/Loading/Loading";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import api from "../../services/api";

import "./DashboardParent.css";

function DashboardParent() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    totalChildren: 0,
    activeEnrollments: 0,
    attendance: 0,
    pendingPayments: 0,
  });

  const [children, setChildren] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        /*
         * Cuando el backend esté conectado se podrán obtener
         * los dependientes y sus inscripciones desde los endpoints
         * correspondientes.
         *
         * Ejemplo:
         *
         * const childrenData = await api("/users/me/dependents");
         * const enrollmentData = await api("/users/me/enrollments");
         */

        // Datos de demostración temporales
        const demoChildren = [
          {
            id: 1,
            nombre: "Sofía Rodríguez",
            edad: 12,
            clases: 2,
            asistencia: 90,
            estado: "activo",
          },
          {
            id: 2,
            nombre: "Daniel Rodríguez",
            edad: 9,
            clases: 1,
            asistencia: 85,
            estado: "activo",
          },
        ];

        setChildren(demoChildren);

        setStats({
          totalChildren: demoChildren.length,
          activeEnrollments: demoChildren.reduce(
            (total, child) => total + child.clases,
            0,
          ),
          attendance: Math.round(
            demoChildren.reduce((total, child) => total + child.asistencia, 0) /
              demoChildren.length,
          ),
          pendingPayments: 1,
        });
      } catch (err) {
        setError(err.message || "No se pudo cargar el dashboard del padre.");
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
      title: "Mis hijos",
      description: "Consulta y administra los dependientes registrados.",
      icon: "👨‍👩‍👧",
      path: "/padre/hijos",
    },
    {
      title: "Explorar clases",
      description: "Encuentra clases para tus hijos.",
      icon: "🔎",
      path: "/padre/explorar-clases",
    },
    {
      title: "Inscripciones",
      description: "Consulta las inscripciones de tus hijos.",
      icon: "📝",
      path: "/padre/inscripciones",
    },
    {
      title: "Asistencia",
      description: "Consulta la asistencia de tus hijos.",
      icon: "✓",
      path: "/padre/asistencia",
    },
    {
      title: "Pagos",
      description: "Consulta pagos y estados de las inscripciones.",
      icon: "💳",
      path: "/padre/pagos",
    },
    {
      title: "Notificaciones",
      description: "Revisa avisos y novedades importantes.",
      icon: "🔔",
      path: "/padre/notificaciones",
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-parent-page">
        <Loading />
      </div>
    );
  }

  return (
    <div className="dashboard-parent-page">
      <div className="dashboard-parent-container">
        <header className="dashboard-parent-header">
          <div>
            <span className="dashboard-parent-subtitle">
              Panel del padre de familia
            </span>

            <h1>Dashboard</h1>

            <p>
              Bienvenido a Danzas.app. Desde aquí puedes acompañar y consultar
              la experiencia de tus hijos en sus clases.
            </p>
          </div>
        </header>

        {error && (
          <div className="dashboard-parent-error">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Estadísticas */}
        <section className="parent-stats">
          <div className="parent-stat-card">
            <div className="parent-stat-icon">👨‍👩‍👧</div>

            <div>
              <span className="parent-stat-number">{stats.totalChildren}</span>

              <span className="parent-stat-label">Hijos registrados</span>
            </div>
          </div>

          <div className="parent-stat-card">
            <div className="parent-stat-icon">📝</div>

            <div>
              <span className="parent-stat-number">
                {stats.activeEnrollments}
              </span>

              <span className="parent-stat-label">Inscripciones activas</span>
            </div>
          </div>

          <div className="parent-stat-card">
            <div className="parent-stat-icon">✓</div>

            <div>
              <span className="parent-stat-number">{stats.attendance}%</span>

              <span className="parent-stat-label">Asistencia general</span>
            </div>
          </div>

          <div className="parent-stat-card">
            <div className="parent-stat-icon">💳</div>

            <div>
              <span className="parent-stat-number">
                {stats.pendingPayments}
              </span>

              <span className="parent-stat-label">Pagos pendientes</span>
            </div>
          </div>
        </section>

        {/* Hijos */}
        <section className="parent-section">
          <div className="parent-section-header">
            <div>
              <h2>Mis hijos</h2>

              <p>Consulta rápidamente el estado de sus actividades.</p>
            </div>

            <button
              type="button"
              className="section-link-button"
              onClick={() => navigate("/padre/hijos")}
            >
              Ver todos →
            </button>
          </div>

          {children.length === 0 ? (
            <div className="no-children">
              <span>👨‍👩‍👧</span>

              <h3>No tienes hijos registrados</h3>

              <p>
                Agrega un dependiente para poder gestionar sus inscripciones.
              </p>

              <button type="button" onClick={() => navigate("/padre/hijos")}>
                Gestionar hijos
              </button>
            </div>
          ) : (
            <div className="children-grid">
              {children.map((child) => (
                <article className="child-card" key={child.id}>
                  <div className="child-avatar">
                    {child.nombre
                      ?.split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((word) => word[0])
                      .join("")
                      .toUpperCase()}
                  </div>

                  <div className="child-content">
                    <h3>{child.nombre}</h3>

                    <p>{child.edad} años</p>

                    <div className="child-details">
                      <span>
                        📝 {child.clases}{" "}
                        {child.clases === 1 ? "clase activa" : "clases activas"}
                      </span>

                      <span>✓ {child.asistencia}% de asistencia</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="child-button"
                    onClick={() => navigate("/padre/inscripciones")}
                  >
                    Ver
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Asistencia */}
        <section className="parent-progress-section">
          <div className="parent-progress-content">
            <div className="parent-progress-icon">📈</div>

            <div className="parent-progress-info">
              <h2>Asistencia de tus hijos</h2>

              <p>Consulta el progreso general de asistencia a las clases.</p>

              <div className="attendance-progress">
                <div className="attendance-progress-top">
                  <span>Asistencia general</span>

                  <strong>{stats.attendance}%</strong>
                </div>

                <div className="attendance-bar">
                  <div
                    className="attendance-progress-value"
                    style={{
                      width: `${stats.attendance}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Acciones rápidas */}
        <section className="parent-section">
          <div className="parent-section-header">
            <div>
              <h2>Acciones rápidas</h2>

              <p>Accede rápidamente a las funciones principales.</p>
            </div>
          </div>

          <div className="parent-actions-grid">
            {quickActions.map((action) => (
              <button
                type="button"
                className="parent-action-card"
                key={action.path}
                onClick={() => navigate(action.path)}
              >
                <div className="parent-action-icon">{action.icon}</div>

                <div className="parent-action-content">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>

                <span className="parent-action-arrow">→</span>
              </button>
            ))}
          </div>
        </section>

        {/* Mensaje final */}
        <section className="parent-welcome">
          <div className="parent-welcome-icon">💃</div>

          <div>
            <h2>Acompaña el aprendizaje de tus hijos</h2>

            <p>
              Desde Danzas.app puedes consultar sus clases, inscripciones,
              asistencia y pagos en un solo lugar.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default DashboardParent;
