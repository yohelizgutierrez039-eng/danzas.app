import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Loading from "../../components/Loading/Loading";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import api from "../../services/api";

import "./DashboardInstructor.css";

function DashboardInstructor() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    totalClasses: 0,
    publishedClasses: 0,
    totalStudents: 0,
    pendingPayments: 0,
  });

  const [upcomingClasses, setUpcomingClasses] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        /*
         * Cuando el backend esté conectado:
         *
         * const data = await api("/classes/my-classes");
         *
         * const classes = Array.isArray(data)
         *   ? data
         *   : data?.classes || data?.data || [];
         *
         * setUpcomingClasses(...);
         * setStats(...);
         */

        // Datos de demostración temporales
        const demoClasses = [
          {
            id: 1,
            nombre: "Salsa Básica",
            tipo: "Salsa",
            modalidad: "Presencial",
            horario: "Lunes y miércoles - 5:00 PM",
            inscritos: 12,
            cupos: 20,
            estado: "published",
          },
          {
            id: 2,
            nombre: "Bachata Inicial",
            tipo: "Bachata",
            modalidad: "Presencial",
            horario: "Martes y jueves - 6:00 PM",
            inscritos: 8,
            cupos: 15,
            estado: "published",
          },
          {
            id: 3,
            nombre: "Danza Urbana",
            tipo: "Urbana",
            modalidad: "Virtual",
            horario: "Sábado - 10:00 AM",
            inscritos: 0,
            cupos: 15,
            estado: "draft",
          },
        ];

        setUpcomingClasses(demoClasses.slice(0, 2));

        setStats({
          totalClasses: demoClasses.length,
          publishedClasses: demoClasses.filter(
            (item) => item.estado === "published",
          ).length,
          totalStudents: demoClasses.reduce(
            (total, item) => total + item.inscritos,
            0,
          ),
          pendingPayments: 3,
        });
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
      title: "Mis clases",
      description: "Consulta y administra las clases que has creado.",
      icon: "💃",
      path: "/instructor/clases",
    },
    {
      title: "Nueva clase",
      description: "Crea y publica una nueva clase de baile.",
      icon: "➕",
      path: "/instructor/clases/nueva",
    },
    {
      title: "Estudiantes",
      description: "Consulta los estudiantes inscritos en tus clases.",
      icon: "👥",
      path: "/instructor/estudiantes",
    },
    {
      title: "Asistencia",
      description: "Registra y consulta la asistencia de tus estudiantes.",
      icon: "✓",
      path: "/instructor/asistencia",
    },
    {
      title: "Calendario",
      description: "Consulta los horarios de tus clases.",
      icon: "📅",
      path: "/instructor/calendario",
    },
    {
      title: "Reportes",
      description: "Consulta información y estadísticas de tus clases.",
      icon: "📊",
      path: "/instructor/reportes",
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
              Bienvenido a tu espacio de instructor en Danzas.app. Aquí puedes
              administrar tus clases y estudiantes.
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
          <div className="instructor-stat-card">
            <div className="instructor-stat-icon">💃</div>

            <div>
              <span className="instructor-stat-number">
                {stats.totalClasses}
              </span>

              <span className="instructor-stat-label">Mis clases</span>
            </div>
          </div>

          <div className="instructor-stat-card">
            <div className="instructor-stat-icon">✓</div>

            <div>
              <span className="instructor-stat-number">
                {stats.publishedClasses}
              </span>

              <span className="instructor-stat-label">Clases publicadas</span>
            </div>
          </div>

          <div className="instructor-stat-card">
            <div className="instructor-stat-icon">👥</div>

            <div>
              <span className="instructor-stat-number">
                {stats.totalStudents}
              </span>

              <span className="instructor-stat-label">
                Estudiantes inscritos
              </span>
            </div>
          </div>

          <div className="instructor-stat-card">
            <div className="instructor-stat-icon">💳</div>

            <div>
              <span className="instructor-stat-number">
                {stats.pendingPayments}
              </span>

              <span className="instructor-stat-label">Pagos pendientes</span>
            </div>
          </div>
        </section>

        {/* Próximas clases */}
        <section className="instructor-section">
          <div className="instructor-section-header">
            <div>
              <h2>Mis próximas clases</h2>
              <p>Resumen de las clases que tienes disponibles.</p>
            </div>

            <button
              type="button"
              className="section-link-button"
              onClick={() => navigate("/instructor/clases")}
            >
              Ver todas →
            </button>
          </div>

          <div className="upcoming-classes">
            {upcomingClasses.map((classItem) => (
              <article className="upcoming-class-card" key={classItem.id}>
                <div className="upcoming-class-icon">💃</div>

                <div className="upcoming-class-content">
                  <span className="class-type">{classItem.tipo}</span>

                  <h3>{classItem.nombre}</h3>

                  <div className="class-details">
                    <span>📅 {classItem.horario}</span>
                    <span>📍 {classItem.modalidad}</span>
                  </div>

                  <div className="class-capacity">
                    <span>
                      {classItem.inscritos} / {classItem.cupos} estudiantes
                    </span>

                    <div className="capacity-bar">
                      <div
                        className="capacity-progress"
                        style={{
                          width: `${
                            classItem.cupos > 0
                              ? Math.min(
                                  (classItem.inscritos / classItem.cupos) * 100,
                                  100,
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="view-class-button"
                  onClick={() => navigate(`/instructor/clases/${classItem.id}`)}
                >
                  Ver
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* Acciones rápidas */}
        <section className="instructor-section">
          <div className="instructor-section-header">
            <div>
              <h2>Acciones rápidas</h2>

              <p>Accede rápidamente a las funciones principales.</p>
            </div>
          </div>

          <div className="instructor-actions-grid">
            {quickActions.map((action) => (
              <button
                type="button"
                className="instructor-action-card"
                key={action.path}
                onClick={() => navigate(action.path)}
              >
                <div className="instructor-action-icon">{action.icon}</div>

                <div className="instructor-action-content">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>

                <span className="instructor-action-arrow">→</span>
              </button>
            ))}
          </div>
        </section>

        {/* Mensaje */}
        <section className="instructor-welcome">
          <div className="instructor-welcome-icon">💃</div>

          <div>
            <h2>¡Sigue compartiendo tu pasión por el baile!</h2>

            <p>
              Mantén tus clases actualizadas, registra la asistencia y acompaña
              a tus estudiantes durante su aprendizaje.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default DashboardInstructor;
