import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchClasses } from "../../services/classes.service";
import "./Home.css";

const DANCE_TYPES = [
  "Salsa",
  "Bachata",
  "Danza urbana",
  "Contemporánea",
  "Folclor",
];

const CITIES = [
  "Barranquilla",
  "Bogotá",
  "Cali",
  "Cartagena",
  "Medellín",
  "Santa Marta",
];

const STEPS = [
  {
    icon: "⌕",
    title: "Busca",
    description: "Filtra las clases por tipo de baile y por ciudad.",
  },
  {
    icon: "▣",
    title: "Elige",
    description: "Revisa horario, precio y cupos disponibles de cada clase.",
  },
  {
    icon: "✓",
    title: "Reserva y paga",
    description:
      "Confirma tu inscripción y completa el pago dentro de la plataforma.",
  },
  {
    icon: "♬",
    title: "Baila",
    description: "Consulta tus clases e inscripciones desde tu cuenta.",
  },
];

const BENEFITS = [
  {
    icon: "◷",
    title: "Cupos en tiempo real",
    description:
      "Ves cuántos lugares quedan en cada clase antes de reservar, sin sorpresas.",
  },
  {
    icon: "↺",
    title: "Cancelación con reembolso",
    description:
      "Si cancelas con 2 horas o más de anticipación, el pago se te reembolsa.",
  },
  {
    icon: "♙",
    title: "Para toda la familia",
    description:
      "Los padres pueden registrar a sus hijos e inscribirlos en las clases.",
  },
  {
    icon: "✔",
    title: "Academias verificadas",
    description:
      "Un administrador revisa cada solicitud antes de que se puedan publicar clases.",
  },
];

const WEEK_DAYS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

// Las horas llegan como ISO en UTC (por ejemplo 1970-01-01T18:00:00.000Z) y
// representan la hora local de la clase, sin zona horaria.
const toClock = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
};

const formatSchedule = (schedule) => {
  if (!schedule) {
    return null;
  }

  const start = toClock(schedule.horaInicio);
  const end = toClock(schedule.horaFin);
  const day = WEEK_DAYS[schedule.diaSemana];

  if (!day || !start || !end) {
    return null;
  }

  return `${day} ${start} - ${end}`;
};

const formatPrice = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return null;
  }

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
};

function Home() {
  const navigate = useNavigate();

  const [danceType, setDanceType] = useState("");
  const [city, setCity] = useState("");

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isActive = true;

    const fetchClasses = async () => {
      try {
        const result = await searchClasses();

        if (isActive) {
          setClasses(Array.isArray(result) ? result : []);
        }
      } catch {
        if (isActive) {
          setError(true);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchClasses();

    return () => {
      isActive = false;
    };
  }, []);

  const availableClasses = classes.filter(
    (danceClass) =>
      danceClass.estado === "activa" && Number(danceClass.cupoDisponible) > 0,
  );
  const featuredClasses = availableClasses.slice(0, 6);
  const citiesCount = new Set(
    availableClasses.map((danceClass) => danceClass.ciudad),
  ).size;

  const goToClasses = (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.tipo) {
      params.set("tipo", filters.tipo);
    }

    if (filters.ciudad) {
      params.set("ciudad", filters.ciudad);
    }

    const query = params.toString();

    navigate(query ? `/clases?${query}` : "/clases");
  };

  const handleSearch = (event) => {
    event.preventDefault();
    goToClasses({ tipo: danceType, ciudad: city });
  };

  return (
    <div className="home-page">
      {/* HERO */}
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="home-container home-hero-grid">
          <div className="home-hero-content">
            <span className="home-badge">CLASES DE DANZA PRESENCIALES</span>

            <h1 id="home-hero-title">
              Encuentra tu próxima
              <span> clase de danza</span>
            </h1>

            <p>
              Compara las clases de academias e instructores de tu ciudad,
              reserva tu cupo y paga en línea, todo en un solo lugar.
            </p>

            {!loading && !error && availableClasses.length > 0 && (
              <ul className="home-hero-stats" aria-label="Datos de la plataforma">
                <li>
                  <strong>{availableClasses.length}</strong>
                  <span>
                    {availableClasses.length === 1
                      ? "clase disponible"
                      : "clases disponibles"}
                  </span>
                </li>
                <li>
                  <strong>{citiesCount}</strong>
                  <span>{citiesCount === 1 ? "ciudad" : "ciudades"}</span>
                </li>
              </ul>
            )}
          </div>

          <div className="home-hero-visual" aria-hidden="true">
            <div className="home-hero-circle">
              <span>♫</span>
            </div>

            <div className="home-floating-card home-floating-card-one">
              <span>◷</span>
              <div>
                <strong>Cupos en tiempo real</strong>
                <small>Reserva antes de que se llenen</small>
              </div>
            </div>

            <div className="home-floating-card home-floating-card-two">
              <span>↺</span>
              <div>
                <strong>Reembolso claro</strong>
                <small>Cancelando con 2 horas o más</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BUSCADOR */}
      <section className="home-search-section" aria-label="Buscar clases">
        <div className="home-container">
          <form className="home-search" onSubmit={handleSearch}>
            <div className="home-search-field">
              <label htmlFor="home-dance-type">Tipo de baile</label>
              <select
                id="home-dance-type"
                value={danceType}
                onChange={(event) => setDanceType(event.target.value)}
              >
                <option value="">Todos los tipos</option>
                {DANCE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="home-search-field">
              <label htmlFor="home-city">Ciudad</label>
              <select
                id="home-city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
              >
                <option value="">Todas las ciudades</option>
                {CITIES.map((cityName) => (
                  <option key={cityName} value={cityName}>
                    {cityName}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="home-search-button">
              Buscar clases
              <span aria-hidden="true">→</span>
            </button>
          </form>

          <div className="home-styles">
            <span>Estilos populares:</span>
            {DANCE_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className="home-chip"
                onClick={() => goToClasses({ tipo: type })}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CLASES DISPONIBLES */}
      <section className="home-section" aria-labelledby="home-featured-title">
        <div className="home-container">
          <div className="home-section-header">
            <div>
              <h2 id="home-featured-title">Clases disponibles ahora</h2>
              <p>Un vistazo a lo que puedes reservar hoy mismo.</p>
            </div>

            <button
              type="button"
              className="home-link-button"
              onClick={() => goToClasses()}
            >
              Ver todas las clases <span aria-hidden="true">→</span>
            </button>
          </div>

          {loading && (
            <div className="home-class-grid" aria-busy="true">
              {[1, 2, 3].map((item) => (
                <div key={item} className="home-class-skeleton" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="home-notice" role="status">
              <p>No pudimos cargar las clases en este momento.</p>
              <button
                type="button"
                className="home-link-button"
                onClick={() => goToClasses()}
              >
                Ir al explorador de clases <span aria-hidden="true">→</span>
              </button>
            </div>
          )}

          {!loading && !error && featuredClasses.length === 0 && (
            <div className="home-notice" role="status">
              <p>
                Todavía no hay clases publicadas. ¡Pronto habrá novedades!
              </p>
            </div>
          )}

          {!loading && !error && featuredClasses.length > 0 && (
            <div className="home-class-grid">
              {featuredClasses.map((danceClass) => {
                const schedule = formatSchedule(danceClass.horarios?.[0]);
                const price = formatPrice(danceClass.precio);
                const spots = Number(danceClass.cupoDisponible);

                return (
                  <article className="home-class-card" key={danceClass.id}>
                    <div className="home-class-top">
                      <span className="home-class-icon" aria-hidden="true">
                        ♫
                      </span>
                      <span
                        className={
                          spots <= 3
                            ? "home-spots home-spots-low"
                            : "home-spots"
                        }
                      >
                        {spots <= 3
                          ? `¡Últimos ${spots} cupos!`
                          : `${spots} cupos`}
                      </span>
                    </div>

                    <h3>{danceClass.tipoBaile}</h3>

                    <ul className="home-class-meta">
                      <li>
                        <span aria-hidden="true">⌖</span>
                        {danceClass.ciudad}
                      </li>
                      {schedule && (
                        <li>
                          <span aria-hidden="true">◷</span>
                          {schedule}
                        </li>
                      )}
                    </ul>

                    <div className="home-class-footer">
                      <strong>{price ?? ""}</strong>
                      <button
                        type="button"
                        className="home-link-button"
                        onClick={() => navigate(`/clases/${danceClass.id}`)}
                        aria-label={`Ver detalle de la clase de ${danceClass.tipoBaile} en ${danceClass.ciudad}`}
                      >
                        Ver detalle <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section
        className="home-section home-section-muted"
        aria-labelledby="home-steps-title"
      >
        <div className="home-container">
          <div className="home-section-header home-section-header-center">
            <div>
              <h2 id="home-steps-title">Reservar es muy sencillo</h2>
              <p>Cuatro pasos y tu cupo queda asegurado.</p>
            </div>
          </div>

          <ol className="home-steps">
            {STEPS.map((step, index) => (
              <li className="home-step" key={step.title}>
                <div className="home-step-top">
                  <span className="home-step-number">{index + 1}</span>
                  <span className="home-step-icon" aria-hidden="true">
                    {step.icon}
                  </span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>

          <div className="home-center">
            <button
              type="button"
              className="home-link-button"
              onClick={() => navigate("/como-funciona")}
            >
              Ver la guía completa <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="home-section" aria-labelledby="home-benefits-title">
        <div className="home-container">
          <div className="home-section-header home-section-header-center">
            <div>
              <h2 id="home-benefits-title">Pensado para que bailes tranquilo</h2>
              <p>Reglas claras para estudiantes, familias e instructores.</p>
            </div>
          </div>

          <div className="home-benefits">
            {BENEFITS.map((benefit) => (
              <article className="home-benefit" key={benefit.title}>
                <span className="home-benefit-icon" aria-hidden="true">
                  {benefit.icon}
                </span>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PARA QUIÉN ES */}
      <section
        className="home-section home-section-muted"
        aria-labelledby="home-audience-title"
      >
        <div className="home-container">
          <div className="home-section-header home-section-header-center">
            <div>
              <h2 id="home-audience-title">Una plataforma, dos formas de usarla</h2>
              <p>Elige cómo quieres empezar.</p>
            </div>
          </div>

          <div className="home-audience">
            <article className="home-audience-card">
              <span className="home-audience-icon" aria-hidden="true">
                ♙
              </span>
              <h3>Estudiantes y familias</h3>
              <p>
                Crea tu cuenta, explora clases de tu ciudad y reserva tu cupo en
                minutos. Si eres padre o madre, también puedes inscribir a tus
                hijos.
              </p>
              <button
                type="button"
                className="home-primary-button"
                onClick={() => navigate("/registro")}
              >
                Crear mi cuenta
              </button>
            </article>

            <article className="home-audience-card home-audience-card-dark">
              <span className="home-audience-icon" aria-hidden="true">
                ♫
              </span>
              <h3>Instructores y academias</h3>
              <p>
                Publica tus clases, organiza tus horarios y recibe
                inscripciones. Tu solicitud la revisa un administrador antes de
                publicar.
              </p>
              <button
                type="button"
                className="home-secondary-button"
                onClick={() => navigate("/registro")}
              >
                Quiero enseñar
              </button>
            </article>
          </div>
        </div>
      </section>

      {/* CIERRE */}
      <section className="home-cta" aria-labelledby="home-cta-title">
        <div className="home-container home-cta-content">
          <h2 id="home-cta-title">¿Listo para bailar?</h2>
          <p>Encuentra la clase que va con tu ritmo y reserva hoy.</p>

          <div className="home-cta-actions">
            <button
              type="button"
              className="home-secondary-button"
              onClick={() => goToClasses()}
            >
              Explorar clases
            </button>
            <button
              type="button"
              className="home-cta-outline"
              onClick={() => navigate("/registro")}
            >
              Crear cuenta
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
