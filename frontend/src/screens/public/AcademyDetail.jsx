import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AcademyDetail.css";

function AcademyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Datos de ejemplo.
  // Posteriormente serán obtenidos desde el backend utilizando el id.
  const academy = {
    id,
    name: "Academia Ritmo Caribe",
    city: "Barranquilla",
    description:
      "Academia dedicada a la enseñanza de diferentes estilos de danza, creando espacios para aprender, practicar y disfrutar del baile.",
    image:
      "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&w=1400&q=80",
    classes: [
      {
        id: 1,
        name: "Salsa Básica",
        type: "Salsa",
        modality: "Presencial",
        schedule: "Lunes y miércoles · 5:00 PM",
        price: "$80.000",
        available: 8,
      },
      {
        id: 2,
        name: "Bachata Inicial",
        type: "Bachata",
        modality: "Presencial",
        schedule: "Martes y jueves · 6:00 PM",
        price: "$75.000",
        available: 5,
      },
      {
        id: 3,
        name: "Danza Urbana",
        type: "Danza urbana",
        modality: "Virtual",
        schedule: "Sábados · 10:00 AM",
        price: "$60.000",
        available: 12,
      },
    ],
  };

  const handleViewClass = (classId) => {
    navigate(`/clases/${classId}`);
  };

  return (
    <div className="academy-detail-page">
      {/* Botón volver */}
      <div className="academy-detail-top">
        <button
          type="button"
          className="academy-detail-back"
          onClick={() => navigate("/academias")}
        >
          ← Volver a academias
        </button>
      </div>

      {/* Información principal */}
      <section className="academy-detail-hero">
        <div className="academy-detail-hero-image">
          <img src={academy.image} alt={academy.name} />
        </div>

        <div className="academy-detail-hero-content">
          <span className="academy-detail-tag">ACADEMIA DE DANZA</span>

          <h1>{academy.name}</h1>

          <div className="academy-detail-location">
            <span>📍</span>
            <span>{academy.city}, Colombia</span>
          </div>

          <p>{academy.description}</p>

          <div className="academy-detail-stats">
            <div className="academy-detail-stat">
              <strong>{academy.classes.length}</strong>
              <span>Clases disponibles</span>
            </div>

            <div className="academy-detail-stat">
              <strong>2</strong>
              <span>Modalidades</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido */}
      <main className="academy-detail-container">
        {/* Sobre la academia */}
        <section className="academy-detail-about">
          <div>
            <span className="academy-detail-section-label">
              CONOCE LA ACADEMIA
            </span>

            <h2>Sobre {academy.name}</h2>

            <p>
              Encuentra diferentes opciones de clases de danza disponibles en
              esta academia. Puedes consultar la información de cada clase antes
              de decidir cuál se adapta mejor a lo que estás buscando.
            </p>
          </div>
        </section>

        {/* Clases */}
        <section className="academy-detail-classes">
          <div className="academy-detail-section-header">
            <div>
              <span className="academy-detail-section-label">
                CLASES DISPONIBLES
              </span>

              <h2>Explora las clases</h2>

              <p>
                Conoce los horarios, modalidades, precios y cupos disponibles.
              </p>
            </div>

            <span className="academy-detail-class-count">
              {academy.classes.length} clases
            </span>
          </div>

          <div className="academy-detail-class-list">
            {academy.classes.map((classItem) => (
              <article className="academy-detail-class-card" key={classItem.id}>
                <div className="academy-detail-class-icon">♫</div>

                <div className="academy-detail-class-main">
                  <div className="academy-detail-class-title">
                    <h3>{classItem.name}</h3>

                    <span className="academy-detail-type">
                      {classItem.type}
                    </span>
                  </div>

                  <div className="academy-detail-class-data">
                    <span>
                      <strong>Modalidad</strong>
                      {classItem.modality}
                    </span>

                    <span>
                      <strong>Horario</strong>
                      {classItem.schedule}
                    </span>

                    <span>
                      <strong>Cupos</strong>
                      {classItem.available} disponibles
                    </span>
                  </div>
                </div>

                <div className="academy-detail-class-action">
                  <strong>{classItem.price}</strong>

                  <span>por clase</span>

                  <button
                    type="button"
                    onClick={() => handleViewClass(classItem.id)}
                  >
                    Ver clase →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Información para invitado */}
        <section className="academy-detail-notice">
          <div className="academy-detail-notice-icon">ℹ</div>

          <div>
            <h3>¿Quieres inscribirte?</h3>

            <p>
              Puedes consultar las clases como invitado. Para realizar una
              inscripción y efectuar el pago debes iniciar sesión o crear una
              cuenta.
            </p>

            <div className="academy-detail-notice-actions">
              <button
                type="button"
                className="academy-detail-login-button"
                onClick={() => navigate("/login")}
              >
                Iniciar sesión
              </button>

              <button
                type="button"
                className="academy-detail-register-button"
                onClick={() => navigate("/registro")}
              >
                Crear cuenta
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AcademyDetail;
