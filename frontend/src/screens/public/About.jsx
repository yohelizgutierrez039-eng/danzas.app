import React from "react";
import { useNavigate } from "react-router-dom";
import "./About.css";

function About() {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero-container">
          <div className="about-hero-content">
            <span className="about-badge">CONOCE DANZAS.APP</span>

            <h1>
              Conectamos personas
              <span> a través de la danza</span>
            </h1>

            <p>
              Danzas.app es una plataforma web creada para facilitar la búsqueda
              y consulta de clases de danza, conectando estudiantes con
              academias e instructores.
            </p>
          </div>

          <div className="about-hero-visual">
            <div className="about-dance-card">
              <span className="about-dance-icon">♫</span>
              <strong>Danzas.app</strong>
              <p>Encuentra tu ritmo</p>
            </div>
          </div>
        </div>
      </section>

      {/* QUIÉNES SOMOS */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-section-heading">
            <span>¿QUIÉNES SOMOS?</span>
            <h2>Una plataforma pensada para los amantes de la danza</h2>
          </div>

          <div className="about-intro-grid">
            <div className="about-intro-text">
              <p>
                Danzas.app nace como una propuesta para facilitar el acceso a
                información sobre academias y clases de danza.
              </p>

              <p>
                A través de la plataforma, los usuarios pueden explorar
                diferentes opciones y conocer información importante antes de
                elegir una clase.
              </p>

              <p>
                El proyecto contempla diferentes tipos de usuarios, permitiendo
                que cada uno tenga acceso a las funciones correspondientes a su
                rol.
              </p>
            </div>

            <div className="about-intro-card">
              <div className="about-card-icon">♪</div>
              <h3>Tu ritmo, tu elección</h3>
              <p>
                Explora diferentes opciones de danza y encuentra una clase que
                se adapte a tus intereses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* QUÉ OFRECEMOS */}
      <section className="about-section about-section-light">
        <div className="about-container">
          <div className="about-section-heading centered">
            <span>¿QUÉ PUEDES HACER?</span>
            <h2>Todo en un solo lugar</h2>
            <p>
              Danzas.app organiza la información para hacer más sencilla la
              búsqueda y gestión de las clases de danza.
            </p>
          </div>

          <div className="about-features">
            <article className="about-feature">
              <div className="about-feature-icon">⌕</div>
              <h3>Explorar clases</h3>
              <p>
                Busca clases de danza y utiliza filtros como tipo de danza,
                ciudad y modalidad.
              </p>
            </article>

            <article className="about-feature">
              <div className="about-feature-icon">♬</div>
              <h3>Conocer academias</h3>
              <p>Consulta información de academias y las clases que ofrecen.</p>
            </article>

            <article className="about-feature">
              <div className="about-feature-icon">▣</div>
              <h3>Inscribirse</h3>
              <p>
                Los usuarios registrados pueden avanzar en el proceso de
                inscripción a una clase.
              </p>
            </article>

            <article className="about-feature">
              <div className="about-feature-icon">$</div>
              <h3>Gestionar pagos</h3>
              <p>
                El proyecto contempla el proceso de pago asociado a las
                inscripciones.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-section-heading centered">
            <span>PARA DIFERENTES USUARIOS</span>
            <h2>Una plataforma con diferentes roles</h2>
            <p>
              Cada usuario cuenta con funciones de acuerdo con su participación
              dentro de Danzas.app.
            </p>
          </div>

          <div className="about-roles">
            <article className="about-role-card">
              <div className="about-role-icon">♙</div>
              <h3>Estudiante</h3>
              <p>
                Puede explorar clases, realizar inscripciones, consultar sus
                clases, asistencia, pagos y notificaciones.
              </p>
            </article>

            <article className="about-role-card">
              <div className="about-role-icon">♙</div>
              <h3>Padre de familia</h3>
              <p>
                Puede gestionar información relacionada con sus hijos,
                inscripciones, asistencia, pagos y notificaciones.
              </p>
            </article>

            <article className="about-role-card">
              <div className="about-role-icon">♫</div>
              <h3>Instructor</h3>
              <p>
                Puede gestionar sus clases, estudiantes, asistencia, calendario,
                pagos, reportes y notificaciones.
              </p>
            </article>

            <article className="about-role-card">
              <div className="about-role-icon">⚙</div>
              <h3>Administrador</h3>
              <p>
                Se encarga de la gestión de usuarios, academias, clases, pagos,
                reportes y notificaciones.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* OBJETIVO */}
      <section className="about-purpose">
        <div className="about-container">
          <div className="about-purpose-content">
            <div className="about-purpose-icon">♫</div>

            <div>
              <span>NUESTRO PROPÓSITO</span>

              <h2>Hacer que encontrar una clase de danza sea más sencillo</h2>

              <p>
                Queremos ofrecer una experiencia web organizada y accesible
                donde estudiantes, padres de familia, instructores y
                administradores puedan interactuar con las funciones que
                corresponden a cada uno.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="about-container">
          <h2>¿Listo para encontrar tu ritmo?</h2>

          <p>
            Explora las clases disponibles y descubre nuevas posibilidades a
            través de la danza.
          </p>

          <button type="button" onClick={() => navigate("/clases")}>
            Explorar clases
            <span>→</span>
          </button>
        </div>
      </section>

    </div>
  );
}

export default About;
