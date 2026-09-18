import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Loading from "../../components/Loading/Loading";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import api from "../../services/api";

import "./ClassDetailInstructor.css";

function ClassDetailInstructor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadClass = async () => {
      try {
        setLoading(true);
        setError("");

        /*
         * Cuando el backend esté conectado:
         * const data = await api(`/classes/${id}`);
         * setClassData(data);
         */

        // Datos de ejemplo mientras se conecta el backend
        const demoClass = {
          id,
          nombre: "Salsa Básica",
          tipo: "Salsa",
          descripcion:
            "Clase dirigida a personas que desean aprender los pasos básicos de salsa, mejorar su coordinación y comenzar a desarrollar habilidades de baile.",
          ciudad: "Guamal",
          modalidad: "Presencial",
          direccion: "Academia Ritmo Caribe",
          fechaInicio: "15 de septiembre de 2026",
          fechaFin: "15 de diciembre de 2026",
          horario: "Lunes y miércoles - 5:00 PM",
          duracion: "1 hora",
          cupos: 20,
          inscritos: 12,
          precio: 50000,
          requisitos:
            "Ropa cómoda, zapatos adecuados para bailar y disposición para aprender.",
          estado: "published",
          academia: "Academia Ritmo Caribe",
        };

        setTimeout(() => {
          setClassData(demoClass);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError(
          err.message || "No se pudo cargar la información de la clase.",
        );
        setLoading(false);
      }
    };

    loadClass();
  }, [id]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setError("");

      await api(`/classes/${id}`, {
        method: "DELETE",
      });

      navigate("/instructor/clases");
    } catch (err) {
      setError(err.message || "No se pudo eliminar la clase.");
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleEdit = () => {
    navigate(`/instructor/clases/${id}/editar`);
  };

  const handleBack = () => {
    navigate("/instructor/clases");
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "published":
        return "Publicada";
      case "draft":
        return "Borrador";
      case "inactive":
        return "Inactiva";
      default:
        return status || "Sin estado";
    }
  };

  if (loading) {
    return (
      <div className="class-detail-instructor-page">
        <Loading />
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="class-detail-instructor-page">
        <div className="detail-error">
          <h2>No se encontró la clase</h2>
          <button type="button" className="btn-primary" onClick={handleBack}>
            Volver a mis clases
          </button>
        </div>
      </div>
    );
  }

  const availablePlaces =
    Number(classData.cupos || 0) - Number(classData.inscritos || 0);

  const occupancy =
    classData.cupos > 0
      ? Math.round((classData.inscritos / classData.cupos) * 100)
      : 0;

  return (
    <div className="class-detail-instructor-page">
      <div className="class-detail-container">
        {/* Encabezado */}
        <div className="detail-header">
          <div>
            <button type="button" className="back-button" onClick={handleBack}>
              ← Volver a mis clases
            </button>

            <div className="title-row">
              <div>
                <span className="detail-subtitle">{classData.academia}</span>

                <h1>{classData.nombre}</h1>

                <div className="title-meta">
                  <span>{classData.tipo}</span>
                  <span>•</span>
                  <span>{classData.ciudad}</span>
                  <span>•</span>
                  <span>{classData.modalidad}</span>
                </div>
              </div>

              <span className={`status-badge status-${classData.estado}`}>
                {getStatusLabel(classData.estado)}
              </span>
            </div>
          </div>

          <div className="detail-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleEdit}
            >
              ✏️ Editar
            </button>

            <button
              type="button"
              className="btn-danger"
              onClick={() => setShowDeleteDialog(true)}
            >
              🗑️ Eliminar
            </button>
          </div>
        </div>

        {error && (
          <div className="detail-error-message">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Resumen */}
        <div className="class-summary">
          <div className="summary-card">
            <span className="summary-icon">👥</span>

            <div>
              <strong>
                {classData.inscritos}/{classData.cupos}
              </strong>
              <span>Estudiantes inscritos</span>
            </div>
          </div>

          <div className="summary-card">
            <span className="summary-icon">🪑</span>

            <div>
              <strong>{availablePlaces}</strong>
              <span>Cupos disponibles</span>
            </div>
          </div>

          <div className="summary-card">
            <span className="summary-icon">📊</span>

            <div>
              <strong>{occupancy}%</strong>
              <span>Ocupación</span>
            </div>
          </div>

          <div className="summary-card">
            <span className="summary-icon">💰</span>

            <div>
              <strong>
                ${Number(classData.precio).toLocaleString("es-CO")}
              </strong>
              <span>Precio</span>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="detail-grid">
          {/* Información principal */}
          <section className="detail-card">
            <div className="card-header">
              <h2>Información de la clase</h2>
            </div>

            <div className="info-content">
              <div className="info-item">
                <span className="info-label">Descripción</span>
                <p>{classData.descripcion}</p>
              </div>

              <div className="info-item">
                <span className="info-label">Tipo de danza</span>
                <span>{classData.tipo}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Modalidad</span>
                <span>{classData.modalidad}</span>
              </div>

              {classData.modalidad === "Presencial" && (
                <div className="info-item">
                  <span className="info-label">Dirección</span>
                  <span>{classData.direccion}</span>
                </div>
              )}

              <div className="info-item">
                <span className="info-label">Ciudad</span>
                <span>{classData.ciudad}</span>
              </div>
            </div>
          </section>

          {/* Horarios */}
          <section className="detail-card">
            <div className="card-header">
              <h2>Fecha y horario</h2>
            </div>

            <div className="info-content">
              <div className="info-item">
                <span className="info-label">Fecha de inicio</span>
                <span>{classData.fechaInicio}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Fecha de finalización</span>
                <span>{classData.fechaFin}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Horario</span>
                <span>{classData.horario}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Duración</span>
                <span>{classData.duracion}</span>
              </div>
            </div>
          </section>

          {/* Requisitos */}
          <section className="detail-card">
            <div className="card-header">
              <h2>Requisitos</h2>
            </div>

            <div className="card-body">
              <p>
                {classData.requisitos ||
                  "No se especificaron requisitos para esta clase."}
              </p>
            </div>
          </section>

          {/* Inscripciones */}
          <section className="detail-card">
            <div className="card-header">
              <div>
                <h2>Estudiantes</h2>
                <p>Consulta y gestiona los estudiantes inscritos.</p>
              </div>
            </div>

            <div className="students-summary">
              <div>
                <strong>{classData.inscritos}</strong>
                <span>Inscritos</span>
              </div>

              <div>
                <strong>{availablePlaces}</strong>
                <span>Disponibles</span>
              </div>
            </div>

            <button
              type="button"
              className="btn-primary full-width"
              onClick={() => navigate(`/instructor/estudiantes?class_id=${id}`)}
            >
              Ver estudiantes
            </button>
          </section>

          {/* Asistencia */}
          <section className="detail-card">
            <div className="card-header">
              <div>
                <h2>Asistencia</h2>
                <p>Registra y consulta la asistencia de los estudiantes.</p>
              </div>
            </div>

            <button
              type="button"
              className="btn-primary full-width"
              onClick={() => navigate(`/instructor/asistencia?class_id=${id}`)}
            >
              Gestionar asistencia
            </button>
          </section>

          {/* Pagos */}
          <section className="detail-card">
            <div className="card-header">
              <div>
                <h2>Pagos</h2>
                <p>
                  Consulta la información relacionada con los pagos de esta
                  clase.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn-primary full-width"
              onClick={() => navigate(`/instructor/pagos?class_id=${id}`)}
            >
              Ver pagos
            </button>
          </section>
        </div>

        {/* Botones inferiores */}
        <div className="bottom-actions">
          <button type="button" className="btn-secondary" onClick={handleBack}>
            Volver a mis clases
          </button>

          <button type="button" className="btn-primary" onClick={handleEdit}>
            Editar clase
          </button>
        </div>
      </div>

      {/* Confirmación de eliminación */}
      {showDeleteDialog && (
        <ConfirmDialog
          title="Eliminar clase"
          message={`¿Estás seguro de que deseas eliminar "${classData.nombre}"? Esta acción no se puede deshacer.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
          loading={deleting}
        />
      )}
    </div>
  );
}

export default ClassDetailInstructor;
