// src/screens/admin/classes/ClassDetailAdmin.jsx

import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiEdit2,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiMonitor,
  FiUsers,
  FiHome,
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiMail,
  FiPhone,
  FiEye,
} from "react-icons/fi";

import Button from "../../../components/common/Button/Button";
import Badge from "../../../components/common/Badge/Badge";
import StatCard from "../../../components/dashboard/StatCard";
import ClassStatusBadge from "../../../components/classes/ClassStatusBadge";

import "./ClassDetailAdmin.css";

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const STUDENT_STATUS_CONFIG = {
  confirmada: { variant: "success", label: "Confirmada" },
  en_espera: { variant: "warning", label: "En espera" },
  cancelada: { variant: "danger", label: "Cancelada" },
};

/*
 * Datos temporales mientras se conecta el backend.
 *
 * Próxima conexión:
 * const data = await api(`/admin/classes/${id}`);
 *
 * Forma alineada al modelo Prisma `Clase`, con campos adicionales de
 * despliegue (descripcion, requisitos, academia como string plano).
 */
const MOCK_CLASS_DETAIL = {
  id: 1,
  tipoBaile: "Salsa intermedio",
  descripcion:
    "Clase enfocada en técnica, musicalidad y combinación de pasos. Mejora tu estilo y disfruta de la salsa.",
  requisitos: "Conocimientos básicos de salsa.",
  academia: "Ritmo & Sabor",
  ciudad: "Medellín, Antioquia",
  modalidad: "Presencial",
  nivel: "Intermedio",
  precio: 60000,
  cupoMaximo: 20,
  cupoDisponible: 8,
  estado: "activa",
  fechaInicio: "2026-08-12T00:00:00",
  instructor: {
    nombre: "Carlos Gómez",
    rol: "Instructor profesional",
    email: "carlos@danzas.app",
    telefono: "+57 300 123 4567",
    calificacion: 4.9,
    resenas: 120,
  },
  horarios: [
    {
      diaSemana: 1,
      horaInicio: "2026-01-05T19:00:00",
      horaFin: "2026-01-05T20:30:00",
    },
    {
      diaSemana: 3,
      horaInicio: "2026-01-05T19:00:00",
      horaFin: "2026-01-05T20:30:00",
    },
    {
      diaSemana: 5,
      horaInicio: "2026-01-05T19:00:00",
      horaFin: "2026-01-05T20:30:00",
    },
  ],
};

const MOCK_STUDENTS = [
  { id: 1, nombre: "Ana Torres", correo: "ana@correo.com", estado: "confirmada" },
  { id: 2, nombre: "Juan Pérez", correo: "juan@correo.com", estado: "confirmada" },
  {
    id: 3,
    nombre: "Sofía Ramírez",
    correo: "sofia@correo.com",
    estado: "en_espera",
  },
  {
    id: 4,
    nombre: "Miguel Rojas",
    correo: "miguel@correo.com",
    estado: "cancelada",
  },
];

function formatearHora(iso) {
  return new Date(iso).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatearFechaCorta(iso) {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
  });
}

function formatearFechaLarga(iso) {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatearPrecio(precio) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(precio);
}

function formatearDuracion(horaInicio, horaFin) {
  const minutos =
    (new Date(horaFin).getTime() - new Date(horaInicio).getTime()) / 60000;

  const horas = Math.floor(minutos / 60);
  const restoMinutos = minutos % 60;

  if (horas === 0) return `${restoMinutos}m`;
  if (restoMinutos === 0) return `${horas}h`;

  return `${horas}h ${restoMinutos}m`;
}

function iniciales(nombre) {
  return nombre
    .split(" ")
    .map((parte) => parte[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function StudentStatusBadge({ estado }) {
  const config = STUDENT_STATUS_CONFIG[estado] ?? STUDENT_STATUS_CONFIG.cancelada;

  return (
    <Badge variant={config.variant} size="small">
      {config.label}
    </Badge>
  );
}

export default function ClassDetailAdmin() {
  const navigate = useNavigate();
  const { id } = useParams();

  // En la app real, buscar la clase por `id` vía fetch. Por ahora se usa
  // siempre el mock, manteniendo el `id` de la ruta disponible para el enlace
  // de edición.
  const clase = { ...MOCK_CLASS_DETAIL, id: id ?? MOCK_CLASS_DETAIL.id };
  const primerHorario = clase.horarios[0];
  const inscritos = clase.cupoMaximo - clase.cupoDisponible;
  const porcentajeOcupacion = Math.round((inscritos / clase.cupoMaximo) * 100);

  return (
    <div className="class-detail-admin">
      {/* Breadcrumb / header */}
      <div className="class-detail-admin__top">
        <button
          type="button"
          onClick={() => navigate("/admin/classes")}
          className="class-detail-admin__back"
        >
          <FiArrowLeft size={17} />
          Volver a clases
        </button>

        <div className="class-detail-admin__header">
          <div>
            <div className="class-detail-admin__breadcrumb">
              <Link to="/admin">Dashboard</Link>
              <span>/</span>
              <Link to="/admin/classes">Clases</Link>
              <span>/</span>
              <span>Detalle</span>
            </div>

            <div className="class-detail-admin__title-row">
              <h1 className="class-detail-admin__title">{clase.tipoBaile}</h1>
              <ClassStatusBadge estado={clase.estado} />
            </div>

            <p className="class-detail-admin__subtitle">
              Información general y administración de la clase.
            </p>
          </div>

          <div className="class-detail-admin__actions">
            <Button
              variant="outline"
              icon={<FiEdit2 size={16} />}
              onClick={() => navigate(`/admin/classes/${clase.id}/edit`)}
            >
              Editar
            </Button>
          </div>
        </div>
      </div>

      {/* Top summary */}
      <div className="grid-cards class-detail-admin__stats">
        <StatCard
          icon={<FiUsers size={20} />}
          label="Estudiantes inscritos"
          value={`${inscritos}/${clase.cupoMaximo}`}
        />

        <StatCard
          icon={<FiDollarSign size={20} />}
          label="Precio por clase"
          value={formatearPrecio(clase.precio)}
        />

        <StatCard
          icon={<FiCalendar size={20} />}
          label="Inicio"
          value={formatearFechaCorta(clase.fechaInicio)}
        />

        <StatCard
          icon={<FiClock size={20} />}
          label="Duración"
          value={formatearDuracion(
            primerHorario.horaInicio,
            primerHorario.horaFin,
          )}
        />
      </div>

      <div className="class-detail-admin__layout">
        {/* Main information */}
        <div className="class-detail-admin__main">
          {/* Class information */}
          <section className="class-detail-admin__card">
            <div className="class-detail-admin__card-header">
              <h2>Información de la clase</h2>
              <span>Datos generales de la clase</span>
            </div>

            <div className="class-detail-admin__info-grid">
              <div className="class-detail-admin__info-item">
                <div className="class-detail-admin__info-label">
                  <FiCalendar size={17} />
                  Horario
                </div>
                <p className="class-detail-admin__info-value">
                  {clase.horarios.map((h) => DIAS_SEMANA[h.diaSemana]).join(", ")}
                </p>
                <p className="class-detail-admin__info-secondary">
                  {formatearHora(primerHorario.horaInicio)} -{" "}
                  {formatearHora(primerHorario.horaFin)}
                </p>
              </div>

              <div className="class-detail-admin__info-item">
                <div className="class-detail-admin__info-label">
                  {clase.modalidad === "Virtual" ? (
                    <FiMonitor size={17} />
                  ) : (
                    <FiMapPin size={17} />
                  )}
                  Modalidad
                </div>
                <p className="class-detail-admin__info-value">
                  {clase.modalidad}
                </p>
                <p className="class-detail-admin__info-secondary">
                  {clase.ciudad}
                </p>
              </div>

              <div className="class-detail-admin__info-item">
                <div className="class-detail-admin__info-label">
                  <FiHome size={17} />
                  Academia
                </div>
                <p className="class-detail-admin__info-value">
                  {clase.academia}
                </p>
                <p className="class-detail-admin__info-secondary">
                  Academia asociada
                </p>
              </div>

              <div className="class-detail-admin__info-item">
                <div className="class-detail-admin__info-label">
                  <FiUsers size={17} />
                  Nivel
                </div>
                <p className="class-detail-admin__info-value">{clase.nivel}</p>
                <p className="class-detail-admin__info-secondary">
                  Nivel de experiencia
                </p>
              </div>
            </div>

            <div className="class-detail-admin__section">
              <h3>Descripción</h3>
              <p>{clase.descripcion}</p>
            </div>

            <div className="class-detail-admin__section">
              <h3>Requisitos</h3>
              <div className="class-detail-admin__requirements-box">
                {clase.requisitos}
              </div>
            </div>
          </section>

          {/* Students */}
          <section className="class-detail-admin__card class-detail-admin__card--flush">
            <div className="class-detail-admin__card-header">
              <div>
                <h2>Estudiantes inscritos</h2>
                <span>{MOCK_STUDENTS.length} estudiantes registrados</span>
              </div>

              <Link
                to={`/admin/classes/${clase.id}/students`}
                className="class-detail-admin__see-all"
              >
                Ver todos
              </Link>
            </div>

            <div className="class-detail-admin__table-wrapper">
              <table className="class-detail-admin__table">
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th>Correo</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {MOCK_STUDENTS.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <div className="class-detail-admin__student-cell">
                          <span className="class-detail-admin__avatar">
                            {iniciales(student.nombre)}
                          </span>
                          <span>{student.nombre}</span>
                        </div>
                      </td>

                      <td className="class-detail-admin__muted">
                        {student.correo}
                      </td>

                      <td>
                        <StudentStatusBadge estado={student.estado} />
                      </td>

                      <td>
                        <Button
                          variant="ghost"
                          size="small"
                          icon={<FiEye size={14} />}
                        >
                          Ver
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right sidebar */}
        <aside className="class-detail-admin__sidebar">
          {/* Instructor */}
          <section className="class-detail-admin__card">
            <h2 className="class-detail-admin__card-title">Instructor</h2>

            <div className="class-detail-admin__instructor">
              <span className="class-detail-admin__instructor-avatar">
                {iniciales(clase.instructor.nombre)}
              </span>

              <div>
                <h3 className="class-detail-admin__instructor-name">
                  {clase.instructor.nombre}
                </h3>
                <p className="class-detail-admin__instructor-role">
                  {clase.instructor.rol}
                </p>

                <div className="class-detail-admin__instructor-rating">
                  <span>★ {clase.instructor.calificacion}</span>
                  <span className="class-detail-admin__muted">
                    ({clase.instructor.resenas} reseñas)
                  </span>
                </div>
              </div>
            </div>

            <div className="class-detail-admin__contact">
              <div className="class-detail-admin__contact-item">
                <FiMail size={15} />
                <span>{clase.instructor.email}</span>
              </div>

              <div className="class-detail-admin__contact-item">
                <FiPhone size={15} />
                <span>{clase.instructor.telefono}</span>
              </div>
            </div>

            <Link
              to={`/admin/instructors/${encodeURIComponent(clase.instructor.nombre)}`}
              className="class-detail-admin__profile-link"
            >
              Ver perfil del instructor
            </Link>
          </section>

          {/* Schedule */}
          <section className="class-detail-admin__card">
            <h2 className="class-detail-admin__card-title">Horario</h2>

            <div className="class-detail-admin__schedule-box">
              <div className="class-detail-admin__schedule-days">
                <FiCalendar size={17} />
                <span>
                  {clase.horarios
                    .map((h) => DIAS_SEMANA[h.diaSemana])
                    .join(", ")}
                </span>
              </div>

              <div className="class-detail-admin__schedule-time">
                <FiClock size={16} />
                <strong>
                  {formatearHora(primerHorario.horaInicio)} -{" "}
                  {formatearHora(primerHorario.horaFin)}
                </strong>
              </div>

              <p className="class-detail-admin__schedule-start">
                Inicio: {formatearFechaLarga(clase.fechaInicio)}
              </p>
            </div>
          </section>

          {/* Capacity */}
          <section className="class-detail-admin__card">
            <div className="class-detail-admin__capacity-header">
              <h2 className="class-detail-admin__card-title">Capacidad</h2>
              <span>
                {inscritos}/{clase.cupoMaximo}
              </span>
            </div>

            <div className="class-detail-admin__capacity-track">
              <div
                className="class-detail-admin__capacity-bar"
                style={{ width: `${porcentajeOcupacion}%` }}
              />
            </div>

            <p className="class-detail-admin__capacity-note">
              {clase.cupoDisponible} cupos disponibles
            </p>
          </section>

          {/* Admin actions */}
          <section className="class-detail-admin__card">
            <h2 className="class-detail-admin__card-title">Acciones</h2>

            <div className="class-detail-admin__action-buttons">
              <Button
                variant="success"
                fullWidth
                icon={<FiCheckCircle size={18} />}
              >
                Mantener activa
              </Button>

              <Button variant="danger" fullWidth icon={<FiXCircle size={18} />}>
                Cancelar clase
              </Button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
