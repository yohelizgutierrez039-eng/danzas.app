// src/screens/admin/classes/ClassesAdmin.jsx

import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiCalendar,
  FiClock,
  FiUsers,
  FiCheckCircle,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
  FiMapPin,
  FiMonitor,
} from "react-icons/fi";

import Button from "../../../components/common/Button/Button";
import SearchBar from "../../../components/common/SearchBar/SearchBar";
import Select from "../../../components/common/Select/Select";
import EmptyState from "../../../components/common/EmptyState/EmptyState";
import StatCard from "../../../components/dashboard/StatCard";
import ClassCard from "../../../components/classes/ClassCard";
import ClassStatusBadge from "../../../components/classes/ClassStatusBadge";

import "./ClassesAdmin.css";

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

/*
 * Datos temporales mientras se conecta el backend.
 *
 * Próxima conexión:
 * const data = await api("/admin/classes");
 *
 * Forma alineada al modelo Prisma `Clase`:
 * { id, tipoBaile, ciudad, modalidad, precio, cupoMaximo, cupoDisponible,
 *   estado, instructor: { nombre }, horarios: [{ diaSemana, horaInicio, horaFin }] }
 */
const MOCK_CLASSES = [
  {
    id: 1,
    tipoBaile: "Salsa intermedio",
    academia: "Ritmo & Sabor",
    ciudad: "Medellín, Antioquia",
    modalidad: "Presencial",
    precio: 60000,
    cupoMaximo: 20,
    cupoDisponible: 8,
    estado: "activa",
    instructor: { nombre: "Carlos Gómez" },
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
  },
  {
    id: 2,
    tipoBaile: "Bachata principiantes",
    academia: "Urban Dance Studio",
    ciudad: "Bogotá, Cundinamarca",
    modalidad: "Presencial",
    precio: 55000,
    cupoMaximo: 20,
    cupoDisponible: 2,
    estado: "activa",
    instructor: { nombre: "Carlos Gómez" },
    horarios: [
      {
        diaSemana: 2,
        horaInicio: "2026-01-06T18:00:00",
        horaFin: "2026-01-06T19:30:00",
      },
      {
        diaSemana: 4,
        horaInicio: "2026-01-06T18:00:00",
        horaFin: "2026-01-06T19:30:00",
      },
    ],
  },
  {
    id: 3,
    tipoBaile: "Hip Hop avanzado",
    academia: "Urban Dance Studio",
    ciudad: "Cali, Valle del Cauca",
    modalidad: "Presencial",
    precio: 65000,
    cupoMaximo: 15,
    cupoDisponible: 10,
    estado: "activa",
    instructor: { nombre: "Valentina Ruiz" },
    horarios: [
      {
        diaSemana: 6,
        horaInicio: "2026-01-10T10:00:00",
        horaFin: "2026-01-10T12:00:00",
      },
    ],
  },
  {
    id: 4,
    tipoBaile: "Ballet clásico",
    academia: "Ballet Arte",
    ciudad: "Medellín, Antioquia",
    modalidad: "Presencial",
    precio: 70000,
    cupoMaximo: 15,
    cupoDisponible: 1,
    estado: "finalizada",
    instructor: { nombre: "Andrea López" },
    horarios: [
      {
        diaSemana: 1,
        horaInicio: "2026-01-05T16:00:00",
        horaFin: "2026-01-05T17:30:00",
      },
      {
        diaSemana: 3,
        horaInicio: "2026-01-05T16:00:00",
        horaFin: "2026-01-05T17:30:00",
      },
    ],
  },
  {
    id: 5,
    tipoBaile: "Contemporáneo",
    academia: "Pasión Latina",
    ciudad: "Medellín, Antioquia",
    modalidad: "Presencial",
    precio: 58000,
    cupoMaximo: 20,
    cupoDisponible: 11,
    estado: "cancelada",
    instructor: { nombre: "Laura Pérez" },
    horarios: [
      {
        diaSemana: 5,
        horaInicio: "2026-01-09T19:00:00",
        horaFin: "2026-01-09T20:30:00",
      },
    ],
  },
];

const ESTADO_OPTIONS = [
  { value: "todas", label: "Todas" },
  { value: "activa", label: "Activa" },
  { value: "cancelada", label: "Cancelada" },
  { value: "finalizada", label: "Finalizada" },
];

function formatearHora(iso) {
  return new Date(iso).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatearPrecio(precio) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(precio);
}

function formatearHorario(horarios) {
  if (!horarios?.length) return "Sin horario";

  const dias = horarios.map((h) => DIAS_SEMANA[h.diaSemana]).join(" - ");
  const primero = horarios[0];

  return {
    dias,
    hora: `${formatearHora(primero.horaInicio)} - ${formatearHora(
      primero.horaFin,
    )}`,
  };
}

function iniciales(nombre) {
  return nombre
    .split(" ")
    .map((parte) => parte[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ClassesAdmin() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todas");
  const [openMenu, setOpenMenu] = useState(null);

  const filteredClasses = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    return MOCK_CLASSES.filter((clase) => {
      const matchesEstado =
        estadoFiltro === "todas" || clase.estado === estadoFiltro;

      const matchesSearch =
        !normalizedSearch ||
        clase.tipoBaile.toLowerCase().includes(normalizedSearch) ||
        clase.instructor.nombre.toLowerCase().includes(normalizedSearch) ||
        clase.academia.toLowerCase().includes(normalizedSearch);

      return matchesEstado && matchesSearch;
    });
  }, [search, estadoFiltro]);

  const stats = useMemo(() => {
    const total = MOCK_CLASSES.length;
    const activas = MOCK_CLASSES.filter((c) => c.estado === "activa").length;
    const inscritos = MOCK_CLASSES.reduce(
      (acc, c) => acc + (c.cupoMaximo - c.cupoDisponible),
      0,
    );
    const finalizadas = MOCK_CLASSES.filter(
      (c) => c.estado === "finalizada",
    ).length;

    return { total, activas, inscritos, finalizadas };
  }, []);

  return (
    <div className="classes-admin">
      {/* Header */}
      <div className="classes-admin__header">
        <div>
          <div className="classes-admin__breadcrumb">
            <Link to="/admin">Dashboard</Link>
            <span>/</span>
            <span>Clases</span>
          </div>

          <h1 className="classes-admin__title">Gestión de clases</h1>

          <p className="classes-admin__subtitle">
            Administra las clases, horarios, instructores y estados.
          </p>
        </div>

        <Button
          icon={<FiPlus size={18} />}
          onClick={() => navigate("/admin/classes/create")}
        >
          Nueva clase
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid-cards classes-admin__stats">
        <StatCard
          icon={<FiCalendar size={20} />}
          label="Total clases"
          value={stats.total}
        />

        <StatCard
          icon={<FiCheckCircle size={20} />}
          label="Clases activas"
          value={stats.activas}
        />

        <StatCard
          icon={<FiUsers size={20} />}
          label="Estudiantes inscritos"
          value={stats.inscritos}
        />

        <StatCard
          icon={<FiClock size={20} />}
          label="Clases finalizadas"
          value={stats.finalizadas}
        />
      </div>

      {/* Main panel */}
      <div className="classes-admin__panel">
        {/* Filters */}
        <div className="classes-admin__toolbar">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Buscar por clase, instructor o academia..."
            className="classes-admin__search"
          />

          <Select
            name="estado-filtro"
            value={estadoFiltro}
            onChange={(event) => setEstadoFiltro(event.target.value)}
            options={ESTADO_OPTIONS}
            placeholder=""
            fullWidth={false}
            className="classes-admin__filter-select"
          />
        </div>

        {filteredClasses.length === 0 ? (
          <EmptyState
            title="No encontramos clases"
            description="Intenta cambiar los filtros o el término de búsqueda."
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="classes-admin__table-wrapper">
              <table className="classes-admin__table">
                <thead>
                  <tr>
                    <th>Clase</th>
                    <th>Instructor</th>
                    <th>Horario</th>
                    <th>Modalidad</th>
                    <th>Inscritos</th>
                    <th>Estado</th>
                    <th className="classes-admin__actions-header">Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredClasses.map((clase) => {
                    const horario = formatearHorario(clase.horarios);
                    const inscritos = clase.cupoMaximo - clase.cupoDisponible;

                    return (
                      <tr key={clase.id}>
                        <td>
                          <Link
                            to={`/admin/classes/${clase.id}`}
                            className="classes-admin__class-link"
                          >
                            {clase.tipoBaile}
                          </Link>
                          <p className="classes-admin__class-academy">
                            {clase.academia}
                          </p>
                        </td>

                        <td>
                          <div className="classes-admin__instructor-cell">
                            <span className="classes-admin__avatar">
                              {iniciales(clase.instructor.nombre)}
                            </span>
                            <span>{clase.instructor.nombre}</span>
                          </div>
                        </td>

                        <td>
                          <p className="classes-admin__schedule-days">
                            {horario.dias}
                          </p>
                          <p className="classes-admin__schedule-time">
                            {horario.hora}
                          </p>
                        </td>

                        <td>
                          <span className="classes-admin__modality">
                            {clase.modalidad === "Virtual" ? (
                              <FiMonitor size={13} />
                            ) : (
                              <FiMapPin size={13} />
                            )}
                            {clase.modalidad}
                          </span>
                        </td>

                        <td>
                          <div className="classes-admin__capacity-cell">
                            <FiUsers size={15} />
                            <strong>{inscritos}</strong>
                            <span>/ {clase.cupoMaximo}</span>
                          </div>
                        </td>

                        <td>
                          <ClassStatusBadge estado={clase.estado} />
                        </td>

                        <td className="classes-admin__actions-cell">
                          <button
                            type="button"
                            className="classes-admin__menu-trigger"
                            onClick={() =>
                              setOpenMenu(
                                openMenu === clase.id ? null : clase.id,
                              )
                            }
                            aria-label="Abrir acciones"
                          >
                            <FiMoreVertical size={18} />
                          </button>

                          {openMenu === clase.id && (
                            <div className="classes-admin__menu">
                              <Link
                                to={`/admin/classes/${clase.id}`}
                                onClick={() => setOpenMenu(null)}
                                className="classes-admin__menu-item"
                              >
                                <FiEye size={15} />
                                Ver detalle
                              </Link>

                              <Link
                                to={`/admin/classes/${clase.id}/edit`}
                                onClick={() => setOpenMenu(null)}
                                className="classes-admin__menu-item"
                              >
                                <FiEdit2 size={15} />
                                Editar clase
                              </Link>

                              <button
                                type="button"
                                onClick={() => setOpenMenu(null)}
                                className="classes-admin__menu-item classes-admin__menu-item--danger"
                              >
                                <FiTrash2 size={15} />
                                Eliminar
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="grid-cards classes-admin__cards">
              {filteredClasses.map((clase) => (
                <ClassCard
                  key={clase.id}
                  clase={clase}
                  onViewDetails={(id) => navigate(`/admin/classes/${id}`)}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="classes-admin__footer">
              <span>
                Mostrando <strong>{filteredClasses.length}</strong> de{" "}
                {MOCK_CLASSES.length} clases
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
