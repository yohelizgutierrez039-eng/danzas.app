import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../../../components/common/Loading/Loading";
import EmptyState from "../../../components/common/EmptyState/EmptyState";
import ErrorMessage from "../../../components/common/ErrorMessage/ErrorMessage";
import useAcademies from "../../../hooks/useAcademies";
import "./AcademiesAdmin.css";

function AcademiesAdmin() {
  const navigate = useNavigate();

  const { academies, loading, error, fetchAcademyRequests, clearError } =
    useAcademies();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount, not a cascading update
    fetchAcademyRequests().catch(() => {});
  }, [fetchAcademyRequests]);

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
          <strong>{academies.length}</strong>
          <span>Solicitudes pendientes</span>
        </div>
      </div>

      {error && (
        <ErrorMessage message={error} type="error" onClose={clearError} />
      )}

      {academies.length === 0 ? (
        <EmptyState
          title="No hay solicitudes pendientes"
          description="Actualmente no existen solicitudes de academias para revisar."
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
              {academies.map((request) => (
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
