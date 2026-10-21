import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "../../components/common/Modal/Modal";
import Loading from "../../components/common/Loading/Loading";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import useAuth from "../../hooks/useAuth";
import { getClassById } from "../../services/classes.service";
import { formatearHorario } from "../../utils/formatDate";
import { formatearPrecio } from "../../utils/formatCurrency";
import "./ClassDetail.css";

// Flujo de inscripción según el rol con sesión iniciada.
const ENROLLMENT_ROUTES = {
  estudiante: (classId) => `/estudiante/clases/${classId}/inscribir`,
  padre: (classId) => `/padre/clases/${classId}/inscribir`,
};

function ClassDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();

  const [danceClass, setDanceClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadClass = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await getClassById(id);

        if (isActive) {
          setDanceClass(result);
        }
      } catch (loadError) {
        if (isActive) {
          setError(
            loadError.status === 404
              ? "Clase no encontrada."
              : loadError.message || "No se pudo cargar la clase.",
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadClass();

    return () => {
      isActive = false;
    };
  }, [id]);

  const handleLogin = () => {
    setShowLoginModal(false);
    navigate("/login");
  };

  const handleRegister = () => {
    setShowLoginModal(false);
    navigate("/registro");
  };

  if (loading) {
    return <Loading text="Cargando clase..." fullScreen />;
  }

  if (error || !danceClass) {
    return (
      <div className="class-detail-page">
        <main className="class-detail-content">
          <EmptyState
            icon="⚠"
            title={error || "Clase no encontrada."}
            actionText="Volver a clases"
            onAction={() => navigate("/clases")}
          />
        </main>
      </div>
    );
  }

  const modalidad =
    danceClass.modalidad === "virtual" ? "Virtual" : "Presencial";
  const isClassActive = danceClass.estado === "activa";
  const hasSpots = danceClass.cupoDisponible > 0;
  const enrollmentRoute = ENROLLMENT_ROUTES[user?.rol];
  const canEnroll = !isAuthenticated || Boolean(enrollmentRoute);
  const enrollDisabled = !isClassActive || !hasSpots || !canEnroll;

  const handleEnroll = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    navigate(enrollmentRoute(danceClass.id));
  };

  const getEnrollLabel = () => {
    if (!isClassActive) return "Clase no disponible";
    if (!hasSpots) return "Sin cupos disponibles";
    if (!canEnroll) return "Solo para estudiantes y padres";

    return "Inscribirme";
  };

  return (
    <div className="class-detail-page">
      {/* =========================
          CONTENIDO
      ========================= */}

      <main className="class-detail-content">
        {/* VOLVER */}

        <button
          type="button"
          className="class-detail-back"
          onClick={() => navigate("/clases")}
        >
          ← Volver a clases
        </button>

        {/* =========================
            PRESENTACIÓN
        ========================= */}

        <section className="class-detail-hero">
          <div className="class-detail-hero-icon">♫</div>

          <div className="class-detail-hero-info">
            <span className="class-detail-eyebrow">DETALLE DE LA CLASE</span>

            <h1>Clase de {danceClass.tipoBaile}</h1>

            <div className="class-detail-hero-meta">
              <span>♫ {danceClass.tipoBaile}</span>

              <span>📍 {danceClass.ciudad}</span>

              <span>{modalidad}</span>
            </div>
          </div>
        </section>

        {/* =========================
            INFORMACIÓN PRINCIPAL
        ========================= */}

        <section className="class-detail-main-grid">
          {/* INFORMACIÓN DE LA CLASE */}

          <div className="class-detail-card">
            <div className="class-detail-section-title">
              <div className="class-detail-section-icon">◷</div>

              <div>
                <h2>Información de la clase</h2>

                <p>Consulta los datos y horarios disponibles.</p>
              </div>
            </div>

            <div className="class-detail-info-grid">
              <div className="class-detail-info-item">
                <span>Tipo de baile</span>

                <strong>{danceClass.tipoBaile}</strong>
              </div>

              <div className="class-detail-info-item">
                <span>Modalidad</span>

                <strong>{modalidad}</strong>
              </div>

              <div className="class-detail-info-item">
                <span>Ciudad</span>

                <strong>{danceClass.ciudad}</strong>
              </div>

              <div className="class-detail-info-item class-detail-info-wide">
                <span>Horario</span>

                {danceClass.horarios.map((horario) => (
                  <strong key={horario.id}>{formatearHorario(horario)}</strong>
                ))}
              </div>
            </div>
          </div>

          {/* PRECIO Y CUPO */}

          <div className="class-detail-price-card">
            <span className="class-detail-price-label">PRECIO DE LA CLASE</span>

            <strong className="class-detail-price">
              {formatearPrecio(danceClass.precio)}
            </strong>

            <div className="class-detail-price-divider"></div>

            <div className="class-detail-availability">
              <span className="class-detail-availability-icon">✓</span>

              <div>
                <small>CUPOS DISPONIBLES</small>

                <strong>
                  {danceClass.cupoDisponible} de {danceClass.cupoMaximo} cupos
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="class-detail-enroll-button"
              onClick={handleEnroll}
              disabled={enrollDisabled}
            >
              {getEnrollLabel()}
            </button>

            <small className="class-detail-payment-note">
              El pago se realizará de forma segura después de crear la
              inscripción.
            </small>
          </div>
        </section>

        {/* =========================
            INSTRUCTOR
        ========================= */}

        <section className="class-detail-card class-detail-instructor">
          <div className="class-detail-section-title">
            <div className="class-detail-section-icon">♙</div>

            <div>
              <h2>Instructor</h2>

              <p>Información del instructor de la clase.</p>
            </div>
          </div>

          <div className="class-detail-profile">
            <div className="class-detail-profile-avatar">
              {danceClass.instructor.nombre.charAt(0)}
            </div>

            <div className="class-detail-profile-info">
              <strong>{danceClass.instructor.nombre}</strong>

              <span>Instructor de danza</span>
            </div>
          </div>
        </section>

        {/* =========================
            AVISO DE INSCRIPCIÓN
        ========================= */}

        <section className="class-detail-notice">
          <div className="class-detail-notice-icon">♫</div>

          <div className="class-detail-notice-text">
            <h2>¿Listo para comenzar?</h2>

            <p>
              Inscríbete en esta clase para reservar tu cupo y continuar con el
              proceso de pago.
            </p>
          </div>

          <button
            type="button"
            className="class-detail-notice-button"
            onClick={handleEnroll}
            disabled={enrollDisabled}
          >
            Inscribirme
          </button>
        </section>
      </main>

      {/* =========================
          LOGIN MODAL
      ========================= */}

      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Inicia sesión para continuar"
        size="small"
      >
        <div className="class-detail-login-modal">
          <div className="class-detail-login-modal-icon">♫</div>

          <h3>Necesitas una cuenta</h3>

          <p>
            Para inscribirte en una clase y realizar el pago debes iniciar
            sesión o crear una cuenta en Danzas.app.
          </p>

          <div className="class-detail-login-modal-actions">
            <button
              type="button"
              className="class-detail-modal-login"
              onClick={handleLogin}
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              className="class-detail-modal-register"
              onClick={handleRegister}
            >
              Crear cuenta
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ClassDetail;
