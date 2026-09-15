import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../../../components/Loading/Loading";
import EmptyState from "../../../components/EmptyState/EmptyState";
import ErrorMessage from "../../../components/ErrorMessage/ErrorMessage";
import "./AcademiesAdmin.css";

function AcademiesAdmin() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * Próxima conexión con el backend:
       *
       * const data = await api("/admin/academy-requests");
       * setRequests(data);
       */

      // Datos temporales mientras se conecta el backend.
      const demoRequests = [
        {
          id: 1,
          academyName: "Academia Ritmo Caribe",
          instructorName: "Carlos Rodríguez",
          email: "carlos@ritmocaribe.com",
          city: "Barranquilla",
          danceTypes: ["Salsa", "Bachata"],
          submittedAt: "10/09/2026",
          status: "pending",
        },
        {
          id: 2,
          academyName: "Danza Latina",
          instructorName: "María González",
          email: "maria@danzalatina.com",
          city: "Cartagena",
          danceTypes: ["Salsa", "Cumbia"],
          submittedAt: "11/09/2026",
          status: "pending",
        },
        {
          id: 3,
          academyName: "Movimiento Dance",
          instructorName: "Andrés Pérez",
          email: "andres@movimientodance.com",
          city: "Santa Marta",
          danceTypes: ["Urbano", "Contemporáneo"],
          submittedAt: "12/09/2026",
          status: "pending",
        },
      ];

      setRequests(demoRequests);
    } catch (err) {
      setError(err.message || "No fue posible cargar las solicitudes.");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (id) => {
    navigate(`/admin/academias/${id}/revisar`);
  };

  if (loading) {
    return <Loading text="Cargando solicitudes..." />;
  }

  return (
    <div className="academies-admin">
      <div className="academies-admin-header">
        <div>
          <span className="academies-admin-subtitle">Administración</span>

          <h1>Solicitudes de academias</h1>

          <p>
            Revisa las solicitudes de registro enviadas por las academias antes
            de aprobarlas.
          </p>
        </div>

        <div className="academies-admin-count">
          <strong>{requests.length}</strong>
          <span>Solicitudes pendientes</span>
        </div>
      </div>

      {error && (
        <ErrorMessage
          message={error}
          type="error"
          onClose={() => setError("")}
        />
      )}

      {requests.length === 0 ? (
        <EmptyState
          title="No hay solicitudes pendientes"
          message="Actualmente no existen solicitudes de academias para revisar."
        />
      ) : (
        <div className="academies-admin-table-container">
          <table className="academies-admin-table">
            <thead>
              <tr>
                <th>Academia</th>
                <th>Instructor</th>
                <th>Ciudad</th>
                <th>Tipos de danza</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>
                    <div className="academy-name">
                      <div className="academy-icon">
                        {request.academyName.charAt(0)}
                      </div>

                      <div>
                        <strong>{request.academyName}</strong>
                        <span>{request.email}</span>
                      </div>
                    </div>
                  </td>

                  <td>{request.instructorName}</td>

                  <td>{request.city}</td>

                  <td>
                    <div className="dance-tags">
                      {request.danceTypes.map((dance) => (
                        <span key={dance}>{dance}</span>
                      ))}
                    </div>
                  </td>

                  <td>{request.submittedAt}</td>

                  <td>
                    <span className="status-pending">Pendiente</span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="review-button"
                      onClick={() => handleReview(request.id)}
                    >
                      Revisar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AcademiesAdmin;
