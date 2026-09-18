import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Loading from "../../components/Loading/Loading";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import EmptyState from "../../components/EmptyState/EmptyState";

import api from "../../services/api";

import "./MyClasses.css";

function MyClasses() {
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoading(true);
        setError("");

        /*
         * Cuando el backend esté conectado:
         *
         * const data = await api("/classes/my-classes");
         * setClasses(data);
         */

        // Datos temporales para visualizar la pantalla
        await new Promise((resolve) => setTimeout(resolve, 500));

        setClasses([
          {
            id: 1,
            name: "Salsa Básica",
            danceType: "Salsa",
            academy: "Academia Ritmo Caribe",
            city: "Guamal",
            modality: "Presencial",
            schedule: "Lunes y miércoles - 5:00 PM",
            duration: "1 hora",
            price: 50000,
            enrolledStudents: 12,
            capacity: 20,
            status: "published",
          },
          {
            id: 2,
            name: "Bachata Inicial",
            danceType: "Bachata",
            academy: "Academia Ritmo Caribe",
            city: "Guamal",
            modality: "Presencial",
            schedule: "Martes y jueves - 6:00 PM",
            duration: "1 hora",
            price: 60000,
            enrolledStudents: 8,
            capacity: 15,
            status: "published",
          },
          {
            id: 3,
            name: "Danza Urbana",
            danceType: "Urbana",
            academy: "Academia Ritmo Caribe",
            city: "Guamal",
            modality: "Virtual",
            schedule: "Sábados - 10:00 AM",
            duration: "1 hora y 30 minutos",
            price: 45000,
            enrolledStudents: 0,
            capacity: 15,
            status: "draft",
          },
        ]);
      } catch (err) {
        setError(err.message || "No fue posible cargar tus clases.");
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusText = (status) => {
    switch (status) {
      case "published":
        return "Publicada";
      case "draft":
        return "Borrador";
      case "inactive":
        return "Inactiva";
      default:
        return "Sin estado";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "published":
        return "status-published";
      case "draft":
        return "status-draft";
      case "inactive":
        return "status-inactive";
      default:
        return "";
    }
  };

  const totalStudents = classes.reduce(
    (total, item) => total + Number(item.enrolledStudents || 0),
    0,
  );

  const publishedClasses = classes.filter(
    (item) => item.status === "published",
  ).length;

  if (loading) {
    return <Loading text="Cargando tus clases..." fullScreen />;
  }

  return (
    <div className="my-classes">
      <div className="my-classes-header">
        <div>
          <span className="page-badge">Instructor</span>

          <h1>Mis clases</h1>

          <p>
            Administra las clases que has creado y consulta la información de
            tus estudiantes.
          </p>
        </div>

        <button
          type="button"
          className="new-class-button"
          onClick={() => navigate("/instructor/clases/nueva")}
        >
          + Nueva clase
        </button>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError("")} />}

      <div className="classes-summary">
        <div className="summary-card">
          <div className="summary-icon">📚</div>

          <div>
            <strong>{classes.length}</strong>
            <span>Total de clases</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">✓</div>

          <div>
            <strong>{publishedClasses}</strong>
            <span>Clases publicadas</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">👥</div>

          <div>
            <strong>{totalStudents}</strong>
            <span>Estudiantes inscritos</span>
          </div>
        </div>
      </div>

      <section className="classes-section">
        <div className="section-title">
          <div>
            <h2>Clases creadas</h2>
            <p>Consulta, edita y administra tus clases.</p>
          </div>
        </div>

        {classes.length === 0 ? (
          <EmptyState
            title="No tienes clases todavía"
            message="Crea tu primera clase para comenzar a ofrecer tus clases de danza."
            icon="💃"
            action={
              <button
                type="button"
                className="empty-button"
                onClick={() => navigate("/instructor/clases/nueva")}
              >
                Crear nueva clase
              </button>
            }
          />
        ) : (
          <div className="classes-table-container">
            <table className="classes-table">
              <thead>
                <tr>
                  <th>Clase</th>
                  <th>Tipo</th>
                  <th>Modalidad</th>
                  <th>Horario</th>
                  <th>Estudiantes</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {classes.map((danceClass) => (
                  <tr key={danceClass.id}>
                    <td>
                      <div className="class-name-cell">
                        <strong>{danceClass.name}</strong>

                        <span>{danceClass.academy}</span>

                        <small>{danceClass.city}</small>
                      </div>
                    </td>

                    <td>{danceClass.danceType}</td>

                    <td>
                      <span className="modality-badge">
                        {danceClass.modality}
                      </span>
                    </td>

                    <td>
                      <div className="schedule-cell">
                        <strong>{danceClass.schedule}</strong>

                        <span>{danceClass.duration}</span>
                      </div>
                    </td>

                    <td>
                      <div className="students-cell">
                        <strong>{danceClass.enrolledStudents}</strong>

                        <span>/ {danceClass.capacity}</span>
                      </div>
                    </td>

                    <td>
                      <strong className="price">
                        {formatPrice(danceClass.price)}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          danceClass.status,
                        )}`}
                      >
                        {getStatusText(danceClass.status)}
                      </span>
                    </td>

                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/instructor/clases/${danceClass.id}`)
                          }
                        >
                          Ver
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/instructor/clases/${danceClass.id}/editar`,
                            )
                          }
                        >
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default MyClasses;
