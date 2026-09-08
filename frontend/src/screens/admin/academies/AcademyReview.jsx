import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AcademyReview.css";

function AcademyReview() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [activeDocument, setActiveDocument] = useState(null);
  const [reviewStatus, setReviewStatus] = useState("Pendiente");
  const [comment, setComment] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Datos temporales.
  // Más adelante estos datos vendrán desde el backend.
  const academy = {
    id: id || 1,
    name: "Ritmo & Sabor",
    logo: "R",
    owner: "Carlos Gómez",
    email: "contacto@ritmoysabor.com",
    phone: "+57 300 456 7890",
    location: "Medellín, Antioquia",
    address: "Cra. 70 # 32-15",
    registeredAt: "10 de agosto de 2026",
    description:
      "Academia especializada en ritmos latinos y urbanos, con formación para niños, jóvenes y adultos.",
    styles: ["Salsa", "Bachata", "Tango", "Ritmos latinos"],
  };

  const documents = [
    {
      id: 1,
      name: "Documento de identidad",
      description: "Documento de identidad del representante.",
      type: "PDF",
      size: "1.8 MB",
      status: "Verificado",
    },
    {
      id: 2,
      name: "Registro de la academia",
      description: "Documento que acredita el registro de la academia.",
      type: "PDF",
      size: "2.4 MB",
      status: "Verificado",
    },
    {
      id: 3,
      name: "Certificado de funcionamiento",
      description: "Certificación correspondiente al funcionamiento.",
      type: "PDF",
      size: "1.2 MB",
      status: "Pendiente",
    },
  ];

  const handleApprove = () => {
    setReviewStatus("Aprobada");
  };

  const handleReject = () => {
    if (!comment.trim()) {
      return;
    }

    setReviewStatus("Rechazada");
    setShowRejectModal(false);
  };

  const handleBack = () => {
    navigate(`/admin/academias/${academy.id}`);
  };

  return (
    <section className="academy-review">
      {/* =========================
          ENCABEZADO
      ========================= */}
      <div className="academy-review-breadcrumb">
        <button type="button" onClick={() => navigate("/admin/academias")}>
          Academias
        </button>

        <span>/</span>

        <button type="button" onClick={handleBack}>
          {academy.name}
        </button>

        <span>/</span>

        <span>Revisión</span>
      </div>

      <div className="academy-review-header">
        <div className="academy-review-title">
          <button
            type="button"
            className="review-back-button"
            onClick={handleBack}
          >
            ←
          </button>

          <div>
            <span className="review-section-label">
              VERIFICACIÓN DE ACADEMIA
            </span>

            <h1>Revisar academia</h1>

            <p>
              Verifica la información y los documentos antes de tomar una
              decisión.
            </p>
          </div>
        </div>

        <span
          className={`review-status ${reviewStatus
            .toLowerCase()
            .replace(" ", "-")}`}
        >
          <span className="review-status-dot"></span>
          {reviewStatus}
        </span>
      </div>

      {/* =========================
          AVISO
      ========================= */}
      {reviewStatus === "Pendiente" && (
        <div className="review-notice">
          <div className="review-notice-icon">!</div>

          <div>
            <strong>Academia pendiente de revisión</strong>

            <p>
              Revisa todos los datos proporcionados por la academia y valida los
              documentos antes de aprobar la solicitud.
            </p>
          </div>
        </div>
      )}

      {reviewStatus === "Aprobada" && (
        <div className="review-result success">
          <span>✓</span>

          <div>
            <strong>Academia aprobada</strong>
            <p>La academia ha sido aprobada correctamente.</p>
          </div>
        </div>
      )}

      {reviewStatus === "Rechazada" && (
        <div className="review-result rejected">
          <span>×</span>

          <div>
            <strong>Academia rechazada</strong>
            <p>La solicitud de esta academia ha sido rechazada.</p>
          </div>
        </div>
      )}

      {/* =========================
          CONTENIDO PRINCIPAL
      ========================= */}
      <div className="academy-review-layout">
        {/* COLUMNA PRINCIPAL */}
        <div className="academy-review-main">
          {/* INFORMACIÓN GENERAL */}
          <div className="review-card">
            <div className="review-card-header">
              <div>
                <span className="review-card-number">01</span>

                <div>
                  <h2>Información de la academia</h2>
                  <p>Datos proporcionados durante el registro.</p>
                </div>
              </div>
            </div>

            <div className="review-academy-profile">
              <div className="review-academy-logo">{academy.logo}</div>

              <div>
                <h3>{academy.name}</h3>

                <span>{academy.location}</span>

                <small>Registrada el {academy.registeredAt}</small>
              </div>
            </div>

            <div className="review-info-grid">
              <div>
                <span>Propietario</span>
                <strong>{academy.owner}</strong>
              </div>

              <div>
                <span>Correo electrónico</span>
                <strong>{academy.email}</strong>
              </div>

              <div>
                <span>Teléfono</span>
                <strong>{academy.phone}</strong>
              </div>

              <div>
                <span>Ciudad</span>
                <strong>{academy.location}</strong>
              </div>

              <div className="review-info-full">
                <span>Dirección</span>
                <strong>{academy.address}</strong>
              </div>

              <div className="review-info-full">
                <span>Descripción</span>
                <p>{academy.description}</p>
              </div>
            </div>

            <div className="review-styles">
              <span>Estilos de baile</span>

              <div>
                {academy.styles.map((style) => (
                  <small key={style}>{style}</small>
                ))}
              </div>
            </div>
          </div>

          {/* DOCUMENTOS */}
          <div className="review-card">
            <div className="review-card-heading">
              <div>
                <h2>Documentos de verificación</h2>
                <p>Revisa los documentos enviados por la academia.</p>
              </div>

              <span className="documents-count">
                {documents.length} documentos
              </span>
            </div>

            <div className="review-documents">
              {documents.map((document) => (
                <div className="review-document" key={document.id}>
                  <div className="review-document-icon">PDF</div>

                  <div className="review-document-info">
                    <strong>{document.name}</strong>

                    <p>{document.description}</p>

                    <small>
                      {document.type} · {document.size}
                    </small>
                  </div>

                  <span
                    className={
                      document.status === "Verificado"
                        ? "document-review-status verified"
                        : "document-review-status pending"
                    }
                  >
                    <span></span>
                    {document.status}
                  </span>

                  <button
                    type="button"
                    className="review-document-button"
                    onClick={() => setActiveDocument(document.id)}
                  >
                    Ver
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* COMENTARIOS */}
          <div className="review-card">
            <div className="review-card-heading">
              <div>
                <h2>Observaciones de revisión</h2>
                <p>Agrega una observación relacionada con la solicitud.</p>
              </div>
            </div>

            <textarea
              className="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Escribe aquí tus observaciones..."
              rows="5"
            />
          </div>
        </div>

        {/* COLUMNA LATERAL */}
        <aside className="academy-review-sidebar">
          {/* RESUMEN */}
          <div className="review-side-card">
            <div className="review-side-heading">
              <h2>Resumen de revisión</h2>
            </div>

            <div className="review-check">
              <div className="check-icon completed">✓</div>

              <div>
                <strong>Información general</strong>
                <span>Información completa</span>
              </div>
            </div>

            <div className="review-check">
              <div className="check-icon completed">✓</div>

              <div>
                <strong>Datos del propietario</strong>
                <span>Información registrada</span>
              </div>
            </div>

            <div className="review-check">
              <div
                className={
                  documents.some((doc) => doc.status === "Pendiente")
                    ? "check-icon waiting"
                    : "check-icon completed"
                }
              >
                {documents.some((doc) => doc.status === "Pendiente")
                  ? "!"
                  : "✓"}
              </div>

              <div>
                <strong>Documentos</strong>

                <span>
                  {
                    documents.filter((doc) => doc.status === "Verificado")
                      .length
                  }{" "}
                  de {documents.length} verificados
                </span>
              </div>
            </div>

            <div className="review-progress">
              <div className="review-progress-label">
                <span>Progreso</span>
                <strong>
                  {Math.round(
                    (documents.filter((doc) => doc.status === "Verificado")
                      .length /
                      documents.length) *
                      100,
                  )}
                  %
                </strong>
              </div>

              <div className="review-progress-bar">
                <span
                  style={{
                    width: `${
                      (documents.filter((doc) => doc.status === "Verificado")
                        .length /
                        documents.length) *
                      100
                    }%`,
                  }}
                ></span>
              </div>
            </div>
          </div>

          {/* ACCIONES */}
          <div className="review-side-card review-actions-card">
            <h2>Decisión</h2>

            <p>
              Selecciona una acción para finalizar la revisión de esta academia.
            </p>

            <button
              type="button"
              className="review-approve-button"
              disabled={reviewStatus !== "Pendiente"}
              onClick={handleApprove}
            >
              ✓ Aprobar academia
            </button>

            <button
              type="button"
              className="review-reject-button"
              disabled={reviewStatus !== "Pendiente"}
              onClick={() => setShowRejectModal(true)}
            >
              × Rechazar academia
            </button>

            <button
              type="button"
              className="review-cancel-button"
              onClick={handleBack}
            >
              Volver al detalle
            </button>
          </div>

          {/* AYUDA */}
          <div className="review-side-help">
            <div>?</div>

            <strong>¿Qué debes revisar?</strong>

            <p>
              Comprueba que la información de la academia sea correcta y que los
              documentos requeridos estén completos antes de aprobarla.
            </p>
          </div>
        </aside>
      </div>

      {/* =========================
          VISUALIZACIÓN DOCUMENTO
      ========================= */}
      {activeDocument && (
        <div className="document-modal-overlay">
          <div className="document-modal">
            <button
              type="button"
              className="document-modal-close"
              onClick={() => setActiveDocument(null)}
            >
              ×
            </button>

            <div className="document-preview-icon">PDF</div>

            <h2>
              {
                documents.find((document) => document.id === activeDocument)
                  ?.name
              }
            </h2>

            <p>Vista previa del documento de verificación.</p>

            <div className="document-preview">Vista previa del archivo</div>

            <button
              type="button"
              className="document-modal-button"
              onClick={() => setActiveDocument(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* =========================
          MODAL RECHAZO
      ========================= */}
      {showRejectModal && (
        <div className="document-modal-overlay">
          <div className="reject-review-modal">
            <div className="reject-review-icon">×</div>

            <h2>Rechazar academia</h2>

            <p>Es necesario indicar el motivo del rechazo para continuar.</p>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Escribe el motivo del rechazo..."
              rows="4"
            />

            <div className="reject-review-actions">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="reject-cancel"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleReject}
                className="reject-confirm"
              >
                Confirmar rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AcademyReview;
