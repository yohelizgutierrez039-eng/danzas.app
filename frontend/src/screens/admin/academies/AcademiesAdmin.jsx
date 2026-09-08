import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AcademyDetailAdmin.css";

function AcademyDetailAdmin() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [activeTab, setActiveTab] = useState("informacion");

  // Datos temporales.
  // Más adelante estos datos vendrán desde el backend.
  const [academy, setAcademy] = useState({
    id: id || 1,
    name: "Ritmo & Sabor",
    logo: "R",
    owner: "Carlos Gómez",
    email: "contacto@ritmoysabor.com",
    phone: "+57 300 456 7890",
    location: "Medellín, Antioquia",
    address: "Cra. 70 # 32-15",
    status: "Pendiente",
    registeredAt: "10 de agosto de 2026",
    students: 45,
    instructors: 6,
    classes: 12,
    rating: 4.8,
    description:
      "Academia especializada en ritmos latinos y urbanos. Ofrece formación para niños, jóvenes y adultos en diferentes niveles.",
    styles: ["Salsa", "Bachata", "Tango", "Ritmos latinos"],
    schedule: [
      {
        day: "Lunes",
        hours: "4:00 PM - 8:00 PM",
      },
      {
        day: "Miércoles",
        hours: "4:00 PM - 8:00 PM",
      },
      {
        day: "Viernes",
        hours: "3:00 PM - 9:00 PM",
      },
      {
        day: "Sábado",
        hours: "9:00 AM - 5:00 PM",
      },
    ],
    documents: [
      {
        name: "Documento de identidad",
        type: "PDF",
        status: "Verificado",
      },
      {
        name: "Registro de la academia",
        type: "PDF",
        status: "Verificado",
      },
      {
        name: "Certificado de funcionamiento",
        type: "PDF",
        status: "Pendiente",
      },
    ],
    activity: [
      {
        title: "Academia registrada",
        description: "La academia fue registrada en Danzas.app.",
        date: "10 Ago 2026 · 09:30 AM",
        type: "register",
      },
      {
        title: "Documentos cargados",
        description:
          "El administrador de la academia cargó los documentos de verificación.",
        date: "10 Ago 2026 · 10:15 AM",
        type: "document",
      },
      {
        title: "Información actualizada",
        description: "Se actualizó la información de contacto de la academia.",
        date: "11 Ago 2026 · 02:40 PM",
        type: "edit",
      },
    ],
  });

  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = () => {
    setAcademy((prev) => ({
      ...prev,
      status: "Aprobada",
    }));
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      return;
    }

    setAcademy((prev) => ({
      ...prev,
      status: "Rechazada",
    }));

    setShowRejectBox(false);
    setRejectReason("");
  };

  const handleChangeStatus = () => {
    setAcademy((prev) => ({
      ...prev,
      status: prev.status === "Aprobada" ? "Inactiva" : "Aprobada",
    }));
  };

  const getStatusClass = () => {
    switch (academy.status) {
      case "Aprobada":
        return "academy-detail-status approved";

      case "Pendiente":
        return "academy-detail-status pending";

      case "Rechazada":
        return "academy-detail-status rejected";

      case "Inactiva":
        return "academy-detail-status inactive";

      default:
        return "academy-detail-status";
    }
  };

  return (
    <section className="academy-detail-admin">
      {/* BREADCRUMB */}
      <div className="academy-detail-breadcrumb">
        <button type="button" onClick={() => navigate("/admin/academias")}>
          Academias
        </button>

        <span>/</span>

        <span>{academy.name}</span>
      </div>

      {/* ENCABEZADO */}
      <div className="academy-detail-header">
        <div className="academy-detail-title">
          <button
            type="button"
            className="academy-back-button"
            onClick={() => navigate("/admin/academias")}
          >
            ←
          </button>

          <div className="academy-detail-logo">{academy.logo}</div>

          <div>
            <div className="academy-detail-name-row">
              <h1>{academy.name}</h1>

              <span className={getStatusClass()}>
                <span className="detail-status-dot"></span>
                {academy.status}
              </span>
            </div>

            <p>
              {academy.location} · Registrada el {academy.registeredAt}
            </p>
          </div>
        </div>

        <div className="academy-detail-header-actions">
          <button
            type="button"
            className="detail-secondary-button"
            onClick={() => navigate(`/admin/academias/${academy.id}/editar`)}
          >
            ✎ Editar
          </button>

          <button
            type="button"
            className="detail-secondary-button"
            onClick={handleChangeStatus}
          >
            ◉ Cambiar estado
          </button>
        </div>
      </div>

      {/* ACCIONES DE APROBACIÓN */}
      {academy.status === "Pendiente" && (
        <div className="academy-review-banner">
          <div className="review-banner-icon">!</div>

          <div className="review-banner-content">
            <strong>Academia pendiente de revisión</strong>

            <p>
              Revisa la información y los documentos antes de aprobar o rechazar
              esta academia.
            </p>
          </div>

          <div className="review-banner-actions">
            <button
              type="button"
              className="approve-button"
              onClick={handleApprove}
            >
              ✓ Aprobar academia
            </button>

            <button
              type="button"
              className="reject-button"
              onClick={() => setShowRejectBox(true)}
            >
              × Rechazar
            </button>
          </div>
        </div>
      )}

      {/* TABS */}
      <div className="academy-detail-tabs">
        <button
          type="button"
          className={
            activeTab === "informacion"
              ? "academy-detail-tab active"
              : "academy-detail-tab"
          }
          onClick={() => setActiveTab("informacion")}
        >
          Información
        </button>

        <button
          type="button"
          className={
            activeTab === "documentos"
              ? "academy-detail-tab active"
              : "academy-detail-tab"
          }
          onClick={() => setActiveTab("documentos")}
        >
          Documentos
          <span className="tab-count">{academy.documents.length}</span>
        </button>

        <button
          type="button"
          className={
            activeTab === "historial"
              ? "academy-detail-tab active"
              : "academy-detail-tab"
          }
          onClick={() => setActiveTab("historial")}
        >
          Historial
        </button>
      </div>

      {/* CONTENIDO */}
      {activeTab === "informacion" && (
        <div className="academy-detail-grid">
          {/* INFORMACIÓN GENERAL */}
          <div className="academy-detail-card academy-general-card">
            <div className="detail-card-header">
              <div>
                <h2>Información de la academia</h2>
                <p>Datos generales registrados en la plataforma.</p>
              </div>

              <span className="detail-card-number">01</span>
            </div>

            <div className="academy-description">
              <span>Descripción</span>

              <p>{academy.description}</p>
            </div>

            <div className="detail-info-grid">
              <div className="detail-info-item">
                <span>Nombre de la academia</span>
                <strong>{academy.name}</strong>
              </div>

              <div className="detail-info-item">
                <span>Propietario</span>
                <strong>{academy.owner}</strong>
              </div>

              <div className="detail-info-item">
                <span>Correo electrónico</span>
                <strong>{academy.email}</strong>
              </div>

              <div className="detail-info-item">
                <span>Teléfono</span>
                <strong>{academy.phone}</strong>
              </div>

              <div className="detail-info-item">
                <span>Ciudad</span>
                <strong>{academy.location}</strong>
              </div>

              <div className="detail-info-item">
                <span>Dirección</span>
                <strong>{academy.address}</strong>
              </div>

              <div className="detail-info-item">
                <span>Fecha de registro</span>
                <strong>{academy.registeredAt}</strong>
              </div>

              <div className="detail-info-item">
                <span>Estado</span>
                <span className={getStatusClass()}>
                  <span className="detail-status-dot"></span>
                  {academy.status}
                </span>
              </div>
            </div>
          </div>

          {/* ESTADÍSTICAS */}
          <div className="academy-detail-card">
            <div className="detail-card-header">
              <div>
                <h2>Resumen</h2>
                <p>Actividad de la academia.</p>
              </div>
            </div>

            <div className="academy-summary-grid">
              <div className="academy-summary-item">
                <span className="summary-icon purple">♙</span>

                <div>
                  <small>Estudiantes</small>
                  <strong>{academy.students}</strong>
                </div>
              </div>

              <div className="academy-summary-item">
                <span className="summary-icon green">♙</span>

                <div>
                  <small>Instructores</small>
                  <strong>{academy.instructors}</strong>
                </div>
              </div>

              <div className="academy-summary-item">
                <span className="summary-icon orange">▣</span>

                <div>
                  <small>Clases</small>
                  <strong>{academy.classes}</strong>
                </div>
              </div>

              <div className="academy-summary-item">
                <span className="summary-icon pink">★</span>

                <div>
                  <small>Valoración</small>
                  <strong>{academy.rating}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* ESTILOS */}
          <div className="academy-detail-card">
            <div className="detail-card-header">
              <div>
                <h2>Estilos de baile</h2>
                <p>Especialidades de la academia.</p>
              </div>
            </div>

            <div className="academy-style-list">
              {academy.styles.map((style) => (
                <span key={style}>{style}</span>
              ))}
            </div>
          </div>

          {/* HORARIOS */}
          <div className="academy-detail-card">
            <div className="detail-card-header">
              <div>
                <h2>Horario de atención</h2>
                <p>Horarios registrados.</p>
              </div>
            </div>

            <div className="academy-schedule">
              {academy.schedule.map((item) => (
                <div className="academy-schedule-row" key={item.day}>
                  <span>{item.day}</span>
                  <strong>{item.hours}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENTOS */}
      {activeTab === "documentos" && (
        <div className="academy-detail-card academy-documents-card">
          <div className="detail-card-header">
            <div>
              <h2>Documentos de verificación</h2>
              <p>Documentos entregados por la academia para su validación.</p>
            </div>
          </div>

          <div className="academy-documents-list">
            {academy.documents.map((document) => (
              <div className="academy-document" key={document.name}>
                <div className="document-icon">PDF</div>

                <div className="document-info">
                  <strong>{document.name}</strong>
                  <small>Archivo {document.type}</small>
                </div>

                <span
                  className={
                    document.status === "Verificado"
                      ? "document-status verified"
                      : "document-status pending"
                  }
                >
                  {document.status}
                </span>

                <button type="button" className="document-view-button">
                  Ver documento
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HISTORIAL */}
      {activeTab === "historial" && (
        <div className="academy-detail-card academy-history-card">
          <div className="detail-card-header">
            <div>
              <h2>Historial de actividad</h2>
              <p>
                Registro de cambios y acciones realizadas sobre esta academia.
              </p>
            </div>
          </div>

          <div className="academy-timeline">
            {academy.activity.map((item, index) => (
              <div
                className="academy-timeline-item"
                key={`${item.title}-${index}`}
              >
                <div className={`timeline-icon ${item.type}`}>
                  {item.type === "register" && "＋"}
                  {item.type === "document" && "▤"}
                  {item.type === "edit" && "✎"}
                </div>

                <div className="timeline-content">
                  <strong>{item.title}</strong>

                  <p>{item.description}</p>

                  <small>{item.date}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CAJA DE RECHAZO */}
      {showRejectBox && (
        <div className="academy-reject-overlay">
          <div className="academy-reject-modal">
            <div className="reject-modal-icon">×</div>

            <h2>Rechazar academia</h2>

            <p>Indica el motivo por el cual la academia será rechazada.</p>

            <label htmlFor="rejectReason">Motivo del rechazo</label>

            <textarea
              id="rejectReason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Escribe el motivo..."
              rows="4"
            />

            <div className="reject-modal-actions">
              <button
                type="button"
                className="cancel-reject-button"
                onClick={() => {
                  setShowRejectBox(false);
                  setRejectReason("");
                }}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="confirm-reject-button"
                onClick={handleReject}
              >
                Rechazar academia
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AcademyDetailAdmin;
