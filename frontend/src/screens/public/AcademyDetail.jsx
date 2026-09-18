import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AcademyDetail.css";

function AcademyDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  /*
    Datos de demostración.
    Posteriormente se reemplazarán por la información
    obtenida desde el backend utilizando el id de la URL.
  */
  const academy = {
    id: id || 1,
    name: "Academia Ritmo Caribe",
    city: "Barranquilla",
    address: "Carrera 45 # 72-18",
    phone: "300 456 7890",
    email: "ritmocaribe@danzas.app",
    description:
      "Academia dedicada a la enseñanza de diferentes estilos de danza para niños, jóvenes y adultos. Nuestro objetivo es brindar un espacio donde las personas puedan aprender, practicar y disfrutar de la danza.",
    danceTypes: ["Salsa", "Bachata", "Danza urbana"],
    instructor: "Carlos Martínez",
    classes: [
      {
        id: 101,
        name: "Salsa Básica",
        type: "Salsa",
        modality: "Presencial",
        schedule: "Lunes y miércoles · 6:00 PM",
        duration: "1 hora",
        price: "$80.000",
        available: 8,
      },
      {
        id: 102,
        name: "Bachata Inicial",
        type: "Bachata",
        modality: "Presencial",
        schedule: "Martes y jueves · 5:00 PM",
        duration: "1 hora",
        price: "$75.000",
        available: 5,
      },
      {
        id: 103,
        name: "Danza Urbana",
        type: "Danza urbana",
        modality: "Virtual",
        schedule: "Sábados · 10:00 AM",
        duration: "1 hora",
        price: "$60.000",
        available: 12,
      },
    ],
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegister = () => {
    navigate("/registro");
  };

  const handleClassDetail = (classId) => {
    navigate(`/clases/${classId}`);
  };

  return (
    <div className="academy-detail-page">
      {/* CONTENIDO */}

      <main className="academy-detail-content">
        {/* VOLVER */}

        <button
          type="button"
          className="academy-detail-back"
          onClick={() => navigate("/academias")}
        >
          ← Volver a academias
        </button>

        {/* PRESENTACIÓN */}

        <section className="academy-detail-hero">
          <div className="academy-detail-hero-icon">♫</div>

          <div className="academy-detail-hero-info">
            <span className="academy-detail-eyebrow">ACADEMIA DE DANZA</span>

            <h1>{academy.name}</h1>

            <div className="academy-detail-location">
              <span>📍</span>
              {academy.city}
            </div>

            <p>{academy.description}</p>

            <div className="academy-detail-tags">
              {academy.danceTypes.map((dance) => (
                <span key={dance}>{dance}</span>
              ))}
            </div>
          </div>
        </section>

        {/* INFORMACIÓN */}

        <section className="academy-detail-info-section">
          <div className="academy-detail-info-card">
            <div className="academy-detail-section-title">
              <div className="academy-detail-section-icon">⌂</div>

              <div>
                <h2>Información de la academia</h2>
                <p>Conoce los datos principales de la academia.</p>
              </div>
            </div>

            <div className="academy-detail-info-grid">
              <div className="academy-detail-info-item">
                <span>Dirección</span>
                <strong>{academy.address}</strong>
              </div>

              <div className="academy-detail-info-item">
                <span>Ciudad</span>
                <strong>{academy.city}</strong>
              </div>

              <div className="academy-detail-info-item">
                <span>Teléfono</span>
                <strong>{academy.phone}</strong>
              </div>

              <div className="academy-detail-info-item">
                <span>Correo electrónico</span>
                <strong>{academy.email}</strong>
              </div>

              <div className="academy-detail-info-item">
                <span>Instructor</span>
                <strong>{academy.instructor}</strong>
              </div>

              <div className="academy-detail-info-item">
                <span>Clases disponibles</span>
                <strong>{academy.classes.length}</strong>
              </div>
            </div>
          </div>

          {/* TIPOS DE BAILE */}

          <div className="academy-detail-dance-card">
            <div className="academy-detail-section-title">
              <div className="academy-detail-section-icon">♫</div>

              <div>
                <h2>Tipos de baile</h2>
                <p>Estilos disponibles en esta academia.</p>
              </div>
            </div>

            <div className="academy-detail-dance-list">
              {academy.danceTypes.map((dance) => (
                <div className="academy-detail-dance-item" key={dance}>
                  <span>✓</span>
                  {dance}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CLASES */}

        <section className="academy-detail-classes">
          <div className="academy-detail-classes-header">
            <div>
              <span className="academy-detail-eyebrow">CLASES DISPONIBLES</span>

              <h2>Encuentra una clase para ti</h2>

              <p>
                Consulta los horarios, modalidad, precios y cupos disponibles.
              </p>
            </div>

            <span className="academy-detail-class-count">
              {academy.classes.length} clases
            </span>
          </div>

          <div className="academy-detail-class-list">
            {academy.classes.map((danceClass) => (
              <article
                className="academy-detail-class-card"
                key={danceClass.id}
              >
                <div className="academy-detail-class-icon">♫</div>

                <div className="academy-detail-class-main">
                  <div className="academy-detail-class-title">
                    <div>
                      <h3>{danceClass.name}</h3>

                      <span>{danceClass.type}</span>
                    </div>

                    <span className="academy-detail-modality">
                      {danceClass.modality}
                    </span>
                  </div>

                  <div className="academy-detail-class-data">
                    <div>
                      <span>Horario</span>
                      <strong>{danceClass.schedule}</strong>
                    </div>

                    <div>
                      <span>Duración</span>
                      <strong>{danceClass.duration}</strong>
                    </div>

                    <div>
                      <span>Cupos</span>
                      <strong>{danceClass.available} disponibles</strong>
                    </div>

                    <div>
                      <span>Precio</span>
                      <strong className="academy-detail-price">
                        {danceClass.price}
                      </strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="academy-detail-class-button"
                  onClick={() => handleClassDetail(danceClass.id)}
                >
                  Ver clase
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* AVISO PARA INVITADOS */}

        <section className="academy-detail-login-notice">
          <div className="academy-detail-notice-icon">♫</div>

          <div className="academy-detail-notice-text">
            <h2>¿Quieres inscribirte en una clase?</h2>

            <p>
              Inicia sesión o crea una cuenta para continuar con tu inscripción
              y pago.
            </p>
          </div>

          <div className="academy-detail-notice-actions">
            <button
              type="button"
              className="academy-detail-notice-login"
              onClick={handleLogin}
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              className="academy-detail-notice-register"
              onClick={handleRegister}
            >
              Crear cuenta
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AcademyDetail;
