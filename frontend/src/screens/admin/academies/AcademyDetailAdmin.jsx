import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../../components/common/Loading/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage/ErrorMessage";
import useAcademies from "../../../hooks/useAcademies";
import { formatearFechaSolicitud } from "../../../utils/solicitudAcademia";
import "./AcademyDetailAdmin.css";

function AcademyDetailAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { academy, loading, error, fetchAcademy } = useAcademies();

  useEffect(() => {
    fetchAcademy(id).catch(() => {});
  }, [id, fetchAcademy]);

  if (loading) {
    return <Loading text="Cargando academia..." />;
  }

  if (!academy || academy.status !== "aprobada") {
    return (
      <div className="academy-detail-admin">
        <ErrorMessage
          message={
            error ||
            (academy
              ? "La solicitud todavía no corresponde a una academia aprobada."
              : "No se encontró la academia.")
          }
          type="error"
        />
      </div>
    );
  }

  return (
    <div className="academy-detail-admin">
      <div className="academy-detail-admin-header">
        <div>
          <button
            type="button"
            className="academy-detail-back"
            onClick={() => navigate("/admin/academias")}
          >
            ← Volver a academias
          </button>

          <span className="academy-detail-subtitle">Academia aprobada</span>

          <h1>{academy.academyName}</h1>

          <p>Consulta la información y el estado actual de la academia.</p>
        </div>

        <span className="academy-approved-status">✓ Aprobada</span>
      </div>

      <div className="academy-detail-admin-grid">
        {/* Información general */}
        <section className="academy-detail-admin-card academy-detail-main-card">
          <div className="academy-detail-card-header">
            <div className="academy-detail-icon">
              {academy.academyName.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2>Información general</h2>
              <span>Datos registrados de la academia</span>
            </div>
          </div>

          <div className="academy-detail-info-grid">
            <div>
              <span>Nombre de la academia</span>
              <strong>{academy.academyName}</strong>
            </div>

            <div>
              <span>Ciudad</span>
              <strong>{academy.city}</strong>
            </div>
          </div>
        </section>

        {/* Responsable */}
        <section className="academy-detail-admin-card">
          <div className="academy-detail-card-title">
            <h2>Responsable</h2>
          </div>

          <div className="academy-detail-responsible">
            <div className="academy-detail-avatar">
              {academy.instructorName.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{academy.instructorName}</strong>
              <span>Instructor</span>
            </div>
          </div>

          <div className="academy-detail-contact">
            <div>
              <span>Correo electrónico</span>
              <strong>{academy.email}</strong>
            </div>
          </div>
        </section>

        {/* Estado */}
        <section className="academy-detail-admin-card">
          <div className="academy-detail-card-title">
            <h2>Estado de la academia</h2>
          </div>

          <div className="academy-detail-status-box">
            <div className="academy-detail-status-icon">✓</div>

            <div>
              <strong>Academia aprobada</strong>
              <span>La academia puede publicar y gestionar sus clases.</span>
            </div>
          </div>

          <div className="academy-detail-approved-date">
            <span>Fecha de aprobación</span>
            <strong>{formatearFechaSolicitud(academy.reviewedAt)}</strong>
          </div>
        </section>
      </div>

      <div className="academy-detail-admin-actions">
        <button
          type="button"
          className="academy-detail-secondary-button"
          onClick={() => navigate("/admin/academias")}
        >
          Volver al listado
        </button>

        <button
          type="button"
          className="academy-detail-primary-button"
          onClick={() => navigate(`/academias/${academy.id}`)}
        >
          Ver academia pública
        </button>
      </div>
    </div>
  );
}

export default AcademyDetailAdmin;
