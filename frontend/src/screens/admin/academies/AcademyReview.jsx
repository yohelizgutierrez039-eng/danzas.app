import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmDialog from "../../../components/common/ConfirmDialog/ConfirmDialog";
import Loading from "../../../components/common/Loading/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage/ErrorMessage";
import api from "../../../api/api";
import useAcademies from "../../../hooks/useAcademies";
import {
  ETIQUETAS_ESTADO_SOLICITUD,
  formatearFechaSolicitud,
} from "../../../utils/solicitudAcademia";
import "./AcademyReview.css";

function AcademyReview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    academy,
    loading,
    error: loadError,
    fetchAcademyRequest,
  } = useAcademies();

  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [dialog, setDialog] = useState({
    isOpen: false,
    type: null,
  });

  useEffect(() => {
    fetchAcademyRequest(id).catch(() => {});
  }, [id, fetchAcademyRequest]);

  const openDialog = (type) => {
    setDialog({
      isOpen: true,
      type,
    });
  };

  const closeDialog = () => {
    if (actionLoading) return;

    setDialog({
      isOpen: false,
      type: null,
    });
  };

  const handleAction = async () => {
    if (!academy) return;

    try {
      setActionLoading(true);
      setError("");

      /*
       * Conexión con el backend:
       *
       * Aprobar:
       * POST /admin/academy-requests/{id}/approve
       *
       * Rechazar:
       * POST /admin/academy-requests/{id}/reject
       */

      if (dialog.type === "approve") {
        await api(`/admin/academy-requests/${id}/approve`, {
          method: "POST",
        });
      }

      if (dialog.type === "reject") {
        await api(`/admin/academy-requests/${id}/reject`, {
          method: "POST",
        });
      }

      closeDialog();
      navigate("/admin/academias");
    } catch (err) {
      setError(err.message || "No fue posible completar la acción.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Cargando solicitud..." />;
  }

  if (!academy) {
    return (
      <div className="academy-review">
        <ErrorMessage
          message={loadError || "No se encontró la solicitud de la academia."}
          type="error"
        />
      </div>
    );
  }

  const isPending = academy.status === "pendiente";

  return (
    <div className="academy-review">
      <div className="academy-review-header">
        <div>
          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/admin/academias")}
          >
            ← Volver a solicitudes
          </button>

          <span className="academy-review-subtitle">Revisión de solicitud</span>

          <h1>{academy.academyName}</h1>

          <p>
            Revisa la información proporcionada antes de tomar una decisión.
          </p>
        </div>

        <span className={`review-status review-status--${academy.status}`}>
          {ETIQUETAS_ESTADO_SOLICITUD[academy.status] ?? academy.status}
        </span>
      </div>

      {error && (
        <ErrorMessage
          message={error}
          type="error"
          onClose={() => setError("")}
        />
      )}

      <div className="academy-review-grid">
        <section className="review-card">
          <div className="review-card-header">
            <h2>Información de la academia</h2>
          </div>

          <div className="review-info-grid">
            <div className="review-info">
              <span>Nombre</span>
              <strong>{academy.academyName}</strong>
            </div>

            <div className="review-info">
              <span>Ciudad</span>
              <strong>{academy.city}</strong>
            </div>
          </div>
        </section>

        <section className="review-card">
          <div className="review-card-header">
            <h2>Información del responsable</h2>
          </div>

          <div className="review-info-list">
            <div className="review-info">
              <span>Nombre</span>
              <strong>{academy.instructorName}</strong>
            </div>

            <div className="review-info">
              <span>Correo electrónico</span>
              <strong>{academy.email}</strong>
            </div>

            {!isPending && (
              <div className="review-info">
                <span>Fecha de revisión</span>
                <strong>{formatearFechaSolicitud(academy.reviewedAt)}</strong>
              </div>
            )}
          </div>
        </section>
      </div>

      {isPending && (
        <div className="academy-review-actions">
          <button
            type="button"
            className="reject-button"
            onClick={() => openDialog("reject")}
            disabled={actionLoading}
          >
            Rechazar
          </button>

          <button
            type="button"
            className="approve-button"
            onClick={() => openDialog("approve")}
            disabled={actionLoading}
          >
            Aprobar
          </button>
        </div>
      )}

      <ConfirmDialog
        isOpen={dialog.isOpen}
        onClose={closeDialog}
        onConfirm={handleAction}
        title={
          dialog.type === "approve" ? "Aprobar solicitud" : "Rechazar solicitud"
        }
        message={
          dialog.type === "approve"
            ? "¿Estás seguro de que deseas aprobar esta solicitud de academia?"
            : "¿Estás seguro de que deseas rechazar esta solicitud de academia?"
        }
        confirmText={dialog.type === "approve" ? "Sí, aprobar" : "Sí, rechazar"}
        cancelText="Cancelar"
        type={dialog.type === "approve" ? "success" : "danger"}
        loading={actionLoading}
      />
    </div>
  );
}

export default AcademyReview;
