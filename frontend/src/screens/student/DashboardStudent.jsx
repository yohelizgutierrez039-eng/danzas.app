import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Loading from "../../components/common/Loading/Loading";
import ErrorMessage from "../../components/common/ErrorMessage/ErrorMessage";

import "./DashboardStudent.css";

function DashboardStudent() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    totalEnrollments: 0,
    activeClasses: 0,
    attendance: 0,
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
         * const data = await api("/users/me/enrollments");
         *
         * const enrollments = Array.isArray(data)
         *   ? data
         *   : data?.enrollments || data?.data || [];
         *
         * Aquí se podrán calcular las estadísticas y
         * próximas clases con la información real.
         */

        // Datos de demostración temporales
        const demoEnrollments = [
          {
            id: 1,
            claseId: 1,
            clase: "Salsa Básica",
            tipo: "Salsa",
            academia: "Academia Ritmo Caribe",
            horario: "Lunes y miércoles - 5:00 PM",
            modalidad: "Presencial",
            estado: "activa",
          },
          {
            id: 2,
            claseId: 2,
            clase: "Bachata Inicial",
            tipo: "Bachata",
            academia: "Academia Ritmo Caribe",
            horario: "Martes y jueves - 6:00 PM",
            modalidad: "Presencial",
            estado: "activa",
          },
        ];

        setStats({
          totalEnrollments: demoEnrollments.length,
          activeClasses: demoEnrollments.filter(
            (item) => item.estado === "activa",
          ).length,
          attendance: 85,
          pendingPayments: 1,
        });

        setUpcomingClasses(demoEnrollments);
      } catch (err) {
        setError(
          err.message || "No se pudo cargar el dashboard del estudiante.",
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
      title: "Explorar clases",
      description: "Encuentra nuevas clases y academias de baile.",
      icon: "🔎",
      path: "/clases",
    },
    {
      title: "Mis inscripciones",
      description: "Consulta las clases en las que estás inscrito.",
      icon: "📝",
      path: "/estudiante/inscripciones",
    },
    {
      title: "Mis clases",
      description: "Accede a la información de tus clases.",
      icon: "💃",
      path: "/estudiante/clases",
    },
    {
      title: "Asistencia",
      description: "Consulta tu registro de asistencia.",
      icon: "✓",
      path: "/estudiante/asistencia",
    },
    {
      title: "Pagos",
      description: "Consulta tus pagos y estados de inscripción.",
      icon: "💳",
      path: "/estudiante/pagos",
    },
    {
      title: "Notificaciones",
      description: "Revisa tus avisos y novedades.",
      icon: "🔔",
      path: "/estudiante/notificaciones",
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-student-page">
        <Loading />
      </div>
    );
  }

  return (
    <div className="dashboard-student-page">
      <div className="dashboard-student-container">
        <header className="dashboard-student-header">
          <div>
            <span className="dashboard-student-subtitle">
              Panel del estudiante
            </span>

            <h1>Mi Dashboard</h1>

            <p>
              Bienvenido a Danzas.app. Aquí puedes consultar tus clases,
              inscripciones y progreso.
            </p>
          </div>
        </header>

        {error && (
          <div className="dashboard-student-error">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Estadísticas */}
        <section className="student-stats">
          <div className="student-stat-card">
            <div className="student-stat-icon">📝</div>

            <div>
              <span className="student-stat-number">
                {stats.totalEnrollments}
              </span>

              <span className="student-stat-label">Inscripciones</span>
            </div>
          </div>

          <div className="student-stat-card">
            <div className="student-stat-icon">💃</div>

            <div>
              <span className="student-stat-number">{stats.activeClasses}</span>

              <span className="student-stat-label">Clases activas</span>
            </div>
          </div>

          <div className="student-stat-card">
            <div className="student-stat-icon">✓</div>

            <div>
              <span className="student-stat-number">{stats.attendance}%</span>

              <span className="student-stat-label">Asistencia</span>
            </div>
          </div>

          <div className="student-stat-card">
            <div className="student-stat-icon">💳</div>

            <div>
              <span className="student-stat-number">
                {stats.pendingPayments}
              </span>

              <span className="student-stat-label">Pagos pendientes</span>
            </div>
          </div>
        </section>

        {/* Próximas clases */}
        <section className="student-section">
          <div className="student-section-header">
            <div>
              <h2>Mis próximas clases</h2>

              <p>Estas son las clases en las que estás inscrito.</p>
            </div>

            <button
              type="button"
              className="section-link-button"
              onClick={() => navigate("/estudiante/inscripciones")}
            >
              Ver todas →
            </button>
          </div>

          {upcomingClasses.length === 0 ? (
            <div className="no-classes">
              <span>💃</span>

              <h3>Aún no tienes clases inscritas</h3>

              <p>
                Explora las clases disponibles y encuentra una que te guste.
              </p>

              <button type="button" onClick={() => navigate("/clases")}>
                Explorar clases
              </button>
            </div>
          ) : (
            <div className="upcoming-student-classes">
              {upcomingClasses.map((classItem) => (
                <article className="student-class-card" key={classItem.id}>
                  <div className="student-class-icon">💃</div>

                  <div className="student-class-content">
                    <span className="student-class-type">{classItem.tipo}</span>

                    <h3>{classItem.clase}</h3>

                    <p className="student-academy">🏫 {classItem.academia}</p>

                    <div className="student-class-details">
                      <span>📅 {classItem.horario}</span>
                      <span>📍 {classItem.modalidad}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="view-student-class-button"
                    onClick={() =>
                      navigate(`/estudiante/clases/${classItem.claseId}`)
                    }
                  >
                    Ver clase
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Progreso */}
        <section className="student-progress-section">
          <div className="student-progress-content">
            <div className="student-progress-icon">📈</div>

            <div className="student-progress-info">
              <h2>Tu asistencia</h2>

              <p>
                Mantén una asistencia constante para aprovechar al máximo tus
                clases.
              </p>

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
        <section className="student-section">
          <div className="student-section-header">
            <div>
              <h2>Acciones rápidas</h2>

              <p>Accede rápidamente a las funciones principales.</p>
            </div>
          </div>

          <div className="student-actions-grid">
            {quickActions.map((action) => (
              <button
                type="button"
                className="student-action-card"
                key={action.path}
                onClick={() => navigate(action.path)}
              >
                <div className="student-action-icon">{action.icon}</div>

                <div className="student-action-content">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>

                <span className="student-action-arrow">→</span>
              </button>
            ))}
          </div>
        </section>

        {/* Mensaje final */}
        <section className="student-welcome">
          <div className="student-welcome-icon">💃</div>

          <div>
            <h2>¡Sigue aprendiendo y disfrutando del baile!</h2>

            <p>
              Explora nuevas clases, mantén tus inscripciones al día y disfruta
              de tu experiencia en Danzas.app.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default DashboardStudent;
