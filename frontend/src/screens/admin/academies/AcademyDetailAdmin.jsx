import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../../components/Loading/Loading";
import ErrorMessage from "../../../components/ErrorMessage/ErrorMessage";
import api from "../../../api/api";
import "./AcademyDetailAdmin.css";

function AcademyDetailAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [academy, setAcademy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAcademy();
  }, [id]);

  const loadAcademy = async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * Cuando esté disponible el endpoint del backend:
       *
       * const data = await api(`/admin/academies/${id}`);
       * setAcademy(data);
       */

      // Datos temporales para visualizar la pantalla.
      setAcademy({
        id,
        academyName: "Academia Ritmo Caribe",
        instructorName: "Carlos Rodríguez",
        email: "carlos@ritmocaribe.com",
        phone: "300 123 4567",
        city: "Barranquilla",
        address: "Carrera 45 # 80-20",
        description:
          "Academia dedicada a la enseñanza de diferentes estilos de danza.",
        danceTypes: ["Salsa", "Bachata", "Cumbia"],
        modality: "Presencial",
        approvedAt: "13/09/2026",
        status: "approved",
        totalClasses: 8,
        activeStudents: 32,
      });
    } catch (err) {
      setError(
        err.message || "No fue posible cargar la información de la academia.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Cargando academia..." />;
  }

  if (!academy) {
    return (
      <div className="academy-detail-admin">
        <ErrorMessage message="No se encontró la academia." type="error" />
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

      {error && (
        <ErrorMessage
          message={error}
          type="error"
          onClose={() => setError("")}
        />
      )}

      <div className="academy-detail-admin-grid">
        {/* Información general */}
        <section className="academy-detail-admin-card academy-detail-main-card">
          <div className="academy-detail-card-header">
            <div className="academy-detail-icon">
              {academy.academyName.charAt(0)}
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

            <div>
              <span>Dirección</span>
              <strong>{academy.address}</strong>
            </div>

            <div>
              <span>Modalidad</span>
              <strong>{academy.modality}</strong>
            </div>
          </div>

          <div className="academy-detail-description">
            <span>Descripción</span>
            <p>{academy.description}</p>
          </div>

          <div className="academy-detail-dances">
            <span>Tipos de danza</span>

            <div className="academy-detail-tags">
              {academy.danceTypes.map((dance) => (
                <span key={dance}>{dance}</span>
              ))}
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
              {academy.instructorName.charAt(0)}
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

            <div>
              <span>Teléfono</span>
              <strong>{academy.phone}</strong>
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
            <strong>{academy.approvedAt}</strong>
          </div>
        </section>

        {/* Resumen */}
        <section className="academy-detail-admin-card academy-detail-summary-card">
          <div className="academy-detail-card-title">
            <h2>Resumen</h2>
          </div>

          <div className="academy-detail-summary">
            <div>
              <strong>{academy.totalClasses}</strong>
              <span>Clases publicadas</span>
            </div>

            <div>
              <strong>{academy.activeStudents}</strong>
              <span>Estudiantes activos</span>
            </div>
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
