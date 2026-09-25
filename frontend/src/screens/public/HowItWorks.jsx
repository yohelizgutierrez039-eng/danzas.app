import { useNavigate } from "react-router-dom";
import "./HowItWorks.css";

function HowItWorks() {
  const navigate = useNavigate();

  const steps = [
    {
      number: "01",
      icon: "⌕",
      title: "Explora las clases",
      description:
        "Busca las clases de danza disponibles y encuentra opciones según tus intereses.",
    },
    {
      number: "02",
      icon: "⚙",
      title: "Aplica filtros",
      description:
        "Utiliza filtros como tipo de danza, ciudad y modalidad para encontrar una clase adecuada.",
    },
    {
      number: "03",
      icon: "▣",
      title: "Conoce la clase",
      description:
        "Consulta los detalles de la clase, incluyendo academia, instructor, horario, modalidad, precio y cupos disponibles.",
    },
    {
      number: "04",
      icon: "✓",
      title: "Realiza tu inscripción",
      description:
        "Cuando encuentres una clase que te interese, puedes iniciar el proceso de inscripción.",
    },
    {
      number: "05",
      icon: "$",
      title: "Realiza el pago",
      description:
        "Continúa con el proceso de pago correspondiente a la inscripción de la clase.",
    },
    {
      number: "06",
      icon: "♬",
      title: "Disfruta tu clase",
      description:
        "Después de completar el proceso, podrás consultar la información de tu inscripción y tus clases.",
    },
  ];

  const roles = [
    {
      icon: "♙",
      title: "Estudiante",
      description:
        "Explora clases, realiza inscripciones y consulta sus clases, asistencia, pagos y notificaciones.",
    },
    {
      icon: "♙",
      title: "Padre de familia",
      description:
        "Puede gestionar la información relacionada con sus hijos, inscripciones, asistencia, pagos y notificaciones.",
    },
    {
      icon: "♫",
      title: "Instructor",
      description:
        "Gestiona sus clases y puede consultar estudiantes, asistencia, calendario, pagos, reportes y notificaciones.",
    },
    {
      icon: "⚙",
      title: "Administrador",
      description:
        "Administra usuarios, academias, clases, pagos, reportes y notificaciones.",
    },
  ];

  return (
    <div className="how-it-works-page">
      {/* HERO */}
      <section className="how-hero">
        <div className="how-hero-container">
          <div className="how-hero-content">
            <span className="how-badge">¿CÓMO FUNCIONA DANZAS.APP?</span>

            <h1>
              Encuentra tu clase
              <span> de danza paso a paso</span>
            </h1>

            <p>
              Danzas.app facilita la búsqueda de clases de danza. Explora las
              opciones disponibles, conoce sus detalles y realiza tu inscripción
              de manera sencilla.
            </p>

            <div className="how-hero-actions">
              <button
                type="button"
                className="how-primary-button"
                onClick={() => navigate("/clases")}
              >
                Explorar clases
                <span>→</span>
              </button>

              <button
                type="button"
                className="how-secondary-button"
                onClick={() => navigate("/academias")}
              >
                Ver academias
              </button>
            </div>
          </div>

          <div className="how-hero-visual">
            <div className="how-hero-circle">
              <span>♫</span>
            </div>

            <div className="how-floating-card how-floating-card-one">
              <span>⌕</span>
              <div>
                <strong>Explora</strong>
                <small>Encuentra tu clase</small>
              </div>
            </div>

            <div className="how-floating-card how-floating-card-two">
              <span>✓</span>
              <div>
                <strong>Inscríbete</strong>
                <small>Elige tu opción</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PASOS */}
      <section className="how-section">
        <div className="how-container">
          <div className="how-section-heading">
            <span>EL PROCESO</span>

            <h2>¿Cómo encontrar una clase?</h2>

            <p>
              Sigue estos pasos para utilizar las principales funciones del
              proceso público de Danzas.app.
            </p>
          </div>

          <div className="how-steps">
            {steps.map((step) => (
              <article className="how-step-card" key={step.number}>
                <div className="how-step-top">
                  <span className="how-step-number">{step.number}</span>

                  <div className="how-step-icon">{step.icon}</div>
                </div>

                <h3>{step.title}</h3>

                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* BÚSQUEDA */}
      <section className="how-search-section">
        <div className="how-container">
          <div className="how-search-content">
            <div className="how-search-visual">
              <div className="how-search-window">
                <div className="how-window-header">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <div className="how-search-bar">
                  <span>⌕</span>
                  <span>Buscar clases de danza...</span>
                </div>

                <div className="how-filter-row">
                  <div>Tipo de danza</div>
                  <div>Ciudad</div>
                  <div>Modalidad</div>
                </div>

                <div className="how-result-card">
                  <div className="how-result-image">♫</div>

                  <div className="how-result-info">
                    <strong>Salsa Básica</strong>
                    <span>Academia de danza</span>
                    <small>Presencial · Barranquilla</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="how-search-text">
              <span>ENCUENTRA LO QUE BUSCAS</span>

              <h2>Busca y filtra las clases según tus preferencias</h2>

              <p>
                La plataforma permite consultar las clases disponibles y
                utilizar filtros para facilitar la búsqueda.
              </p>

              <ul>
                <li>
                  <span>✓</span>
                  Tipo de danza
                </li>

                <li>
                  <span>✓</span>
                  Ciudad
                </li>

                <li>
                  <span>✓</span>
                  Modalidad
                </li>
              </ul>

              <button type="button" onClick={() => navigate("/clases")}>
                Buscar clases
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* INFORMACIÓN DE LA CLASE */}
      <section className="how-section">
        <div className="how-container">
          <div className="how-section-heading centered">
            <span>ANTES DE INSCRIBIRTE</span>

            <h2>Conoce todos los detalles</h2>

            <p>
              Puedes consultar la información de una clase antes de decidir si
              deseas realizar el proceso de inscripción.
            </p>
          </div>

          <div className="how-info-grid">
            <div className="how-info-item">
              <span className="how-info-icon">♫</span>
              <div>
                <h3>Tipo de danza</h3>
                <p>Conoce qué estilo de danza se ofrece.</p>
              </div>
            </div>

            <div className="how-info-item">
              <span className="how-info-icon">⌂</span>
              <div>
                <h3>Ubicación</h3>
                <p>Consulta la ciudad y la información de la academia.</p>
              </div>
            </div>

            <div className="how-info-item">
              <span className="how-info-icon">◷</span>
              <div>
                <h3>Horario</h3>
                <p>Revisa los días y horarios establecidos para la clase.</p>
              </div>
            </div>

            <div className="how-info-item">
              <span className="how-info-icon">▣</span>
              <div>
                <h3>Cupos disponibles</h3>
                <p>Consulta la disponibilidad de la clase.</p>
              </div>
            </div>

            <div className="how-info-item">
              <span className="how-info-icon">$</span>
              <div>
                <h3>Precio</h3>
                <p>Revisa el valor correspondiente a la clase.</p>
              </div>
            </div>

            <div className="how-info-item">
              <span className="how-info-icon">♙</span>
              <div>
                <h3>Instructor</h3>
                <p>Conoce quién está a cargo de la clase.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section className="how-roles-section">
        <div className="how-container">
          <div className="how-section-heading centered">
            <span>SEGÚN TU ROL</span>

            <h2>Danzas.app funciona para diferentes usuarios</h2>

            <p>
              Las funciones disponibles cambian de acuerdo con el tipo de
              usuario que utiliza la plataforma.
            </p>
          </div>

          <div className="how-roles-grid">
            {roles.map((role) => (
              <article className="how-role-card" key={role.title}>
                <div className="how-role-icon">{role.icon}</div>

                <h3>{role.title}</h3>

                <p>{role.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="how-cta">
        <div className="how-container">
          <div className="how-cta-content">
            <div>
              <span>COMIENZA AHORA</span>

              <h2>Encuentra una clase que vaya contigo</h2>

              <p>
                Explora las opciones disponibles en Danzas.app y descubre nuevas
                formas de disfrutar la danza.
              </p>
            </div>

            <button type="button" onClick={() => navigate("/clases")}>
              Explorar clases
              <span>→</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}

export default HowItWorks;
