import React from "react";
import {
  ArrowLeft,
  Pencil,
  CalendarDays,
  Clock,
  MapPin,
  Monitor,
  Users,
  UserRound,
  Building2,
  DollarSign,
  CheckCircle2,
  PauseCircle,
  XCircle,
  MoreVertical,
  Mail,
  Phone,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

const classDetail = {
  id: 1,
  name: "Salsa intermedio",
  description:
    "Clase enfocada en técnica, musicalidad y combinación de pasos. Mejora tu estilo y disfruta de la salsa.",
  academy: "Ritmo & Sabor",
  instructor: {
    name: "Carlos Gómez",
    role: "Instructor profesional",
    email: "carlos@danzas.app",
    phone: "+57 300 123 4567",
    rating: "4.9",
    reviews: 120,
  },
  schedule: {
    days: "Lunes, Miércoles y Viernes",
    time: "7:00 PM - 8:30 PM",
    duration: "1 hora 30 minutos",
    startDate: "12 de agosto de 2026",
  },
  location: "Medellín, Antioquia",
  modality: "Presencial",
  level: "Intermedio",
  price: "$60.000",
  currency: "COP",
  students: 12,
  capacity: 20,
  status: "Activo",
  requirements: "Conocimientos básicos de salsa.",
  createdAt: "05 de agosto de 2026",
};

const students = [
  {
    id: 1,
    name: "Ana Torres",
    email: "ana@correo.com",
    status: "Confirmada",
  },
  {
    id: 2,
    name: "Juan Pérez",
    email: "juan@correo.com",
    status: "Confirmada",
  },
  {
    id: 3,
    name: "Sofía Ramírez",
    email: "sofia@correo.com",
    status: "En espera",
  },
  {
    id: 4,
    name: "Miguel Rojas",
    email: "miguel@correo.com",
    status: "Cancelada",
  },
];

export default function ClassDetailAdmin() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-[#faf9fd] text-slate-800">
      {/* Breadcrumb / header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate("/admin/classes")}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-purple-600"
        >
          <ArrowLeft size={17} />
          Volver a clases
        </button>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-400">
              <Link to="/admin" className="hover:text-purple-600">
                Dashboard
              </Link>
              <span>/</span>
              <Link to="/admin/classes" className="hover:text-purple-600">
                Clases
              </Link>
              <span>/</span>
              <span>Detalle</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-[#351274] md:text-3xl">
                {classDetail.name}
              </h1>

              <StatusBadge status={classDetail.status} />
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Información general y administración de la clase.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate(`/admin/classes/${id}/edit`)}
              className="inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-sm font-semibold text-purple-600 shadow-sm transition hover:bg-purple-50"
            >
              <Pencil size={17} />
              Editar
            </button>

            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-50"
            >
              <MoreVertical size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Top summary */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Users size={21} />}
          label="Estudiantes inscritos"
          value={`${classDetail.students}/${classDetail.capacity}`}
          description={`${classDetail.capacity - classDetail.students} cupos disponibles`}
          color="purple"
        />

        <StatCard
          icon={<DollarSign size={21} />}
          label="Precio por clase"
          value={classDetail.price}
          description={classDetail.currency}
          color="green"
        />

        <StatCard
          icon={<CalendarDays size={21} />}
          label="Inicio"
          value="12 Ago"
          description="2026"
          color="blue"
        />

        <StatCard
          icon={<Clock size={21} />}
          label="Duración"
          value="1h 30m"
          description="Por sesión"
          color="pink"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Main information */}
        <div className="space-y-6 xl:col-span-2">
          {/* Class information */}
          <section className="rounded-2xl border border-purple-100 bg-white shadow-sm">
            <SectionHeader
              title="Información de la clase"
              subtitle="Datos generales de la clase"
            />

            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
              <InfoCard
                icon={<CalendarDays size={19} />}
                label="Horario"
                value={classDetail.schedule.days}
                secondary={classDetail.schedule.time}
              />

              <InfoCard
                icon={
                  classDetail.modality === "Virtual" ? (
                    <Monitor size={19} />
                  ) : (
                    <MapPin size={19} />
                  )
                }
                label="Modalidad"
                value={classDetail.modality}
                secondary={classDetail.location}
              />

              <InfoCard
                icon={<Building2 size={19} />}
                label="Academia"
                value={classDetail.academy}
                secondary="Academia asociada"
              />

              <InfoCard
                icon={<UserRound size={19} />}
                label="Nivel"
                value={classDetail.level}
                secondary="Nivel de experiencia"
              />
            </div>

            <div className="border-t border-slate-100 p-5">
              <h3 className="mb-2 text-sm font-bold text-slate-700">
                Descripción
              </h3>

              <p className="text-sm leading-6 text-slate-500">
                {classDetail.description}
              </p>
            </div>

            <div className="border-t border-slate-100 p-5">
              <h3 className="mb-2 text-sm font-bold text-slate-700">
                Requisitos
              </h3>

              <div className="rounded-xl bg-purple-50 px-4 py-3 text-sm text-purple-700">
                {classDetail.requirements}
              </div>
            </div>
          </section>

          {/* Students */}
          <section className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm">
            <SectionHeader
              title="Estudiantes inscritos"
              subtitle={`${classDetail.students} estudiantes registrados`}
              action={
                <Link
                  to={`/admin/classes/${id}/students`}
                  className="text-sm font-semibold text-purple-600 hover:text-purple-700"
                >
                  Ver todos
                </Link>
              }
            />

            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Estudiante
                    </th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Correo
                    </th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Estado
                    </th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Acción
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={student.name} />

                          <span className="text-sm font-semibold text-slate-700">
                            {student.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {student.email}
                      </td>

                      <td className="px-5 py-4">
                        <StudentStatus status={student.status} />
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          className="text-sm font-semibold text-purple-600 hover:text-purple-800"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-6">
          {/* Instructor */}
          <section className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
            <h2 className="mb-5 text-base font-bold text-slate-800">
              Instructor
            </h2>

            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-200 to-pink-200 text-lg font-bold text-purple-700">
                CG
              </div>

              <div>
                <h3 className="font-bold text-slate-800">
                  {classDetail.instructor.name}
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  {classDetail.instructor.role}
                </p>

                <div className="mt-1 flex items-center gap-1 text-xs">
                  <span className="font-semibold text-amber-500">
                    ★ {classDetail.instructor.rating}
                  </span>
                  <span className="text-slate-400">
                    ({classDetail.instructor.reviews} reseñas)
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-4">
              <ContactItem
                icon={<Mail size={15} />}
                value={classDetail.instructor.email}
              />

              <ContactItem
                icon={<Phone size={15} />}
                value={classDetail.instructor.phone}
              />
            </div>

            <Link
              to={`/admin/instructors/${classDetail.instructor.name}`}
              className="mt-5 block w-full rounded-xl border border-purple-200 py-2.5 text-center text-sm font-semibold text-purple-600 transition hover:bg-purple-50"
            >
              Ver perfil del instructor
            </Link>
          </section>

          {/* Schedule */}
          <section className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
            <h2 className="mb-5 text-base font-bold text-slate-800">
              Horario
            </h2>

            <div className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-purple-600">
                <CalendarDays size={18} />
                <span className="text-sm font-semibold">
                  {classDetail.schedule.days}
                </span>
              </div>

              <div className="mb-2 flex items-center gap-2 text-slate-700">
                <Clock size={17} />
                <span className="font-bold">
                  {classDetail.schedule.time}
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Inicio: {classDetail.schedule.startDate}
              </p>
            </div>
          </section>

          {/* Capacity */}
          <section className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">
                Capacidad
              </h2>

              <span className="text-sm font-bold text-purple-600">
                {classDetail.students}/{classDetail.capacity}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#6524e8] to-[#e52ca9]"
                style={{
                  width: `${
                    (classDetail.students / classDetail.capacity) * 100
                  }%`,
                }}
              />
            </div>

            <p className="mt-3 text-xs text-slate-400">
              {classDetail.capacity - classDetail.students} cupos disponibles
            </p>
          </section>

          {/* Admin actions */}
          <section className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-slate-800">
              Acciones
            </h2>

            <div className="space-y-2">
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-600 hover:bg-emerald-100"
              >
                <CheckCircle2 size={18} />
                Mantener activa
              </button>

              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-600 hover:bg-amber-100"
              >
                <PauseCircle size={18} />
                Pausar clase
              </button>

              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-100"
              >
                <XCircle size={18} />
                Cancelar clase
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Activo: "bg-emerald-50 text-emerald-600 border-emerald-200",
    Pausada: "bg-amber-50 text-amber-600 border-amber-200",
    Cancelada: "bg-red-50 text-red-500 border-red-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[status] || "bg-slate-50 text-slate-500 border-slate-200"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function StudentStatus({ status }) {
  const styles = {
    Confirmada: "bg-emerald-50 text-emerald-600",
    "En espera": "bg-amber-50 text-amber-600",
    Cancelada: "bg-red-50 text-red-500",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[status] || "bg-slate-50 text-slate-500"
      }`}
    >
      {status}
    </span>
  );
}

function StatCard({ icon, label, value, description, color }) {
  const colors = {
    purple: "bg-purple-50 text-purple-600",
    green: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    pink: "bg-pink-50 text-pink-600",
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${colors[color]}`}
      >
        {icon}
      </div>

      <p className="text-sm text-slate-500">{label}</p>

      <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>

      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </div>
  );
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
      <div>
        <h2 className="font-bold text-slate-800">{title}</h2>

        {subtitle && (
          <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
        )}
      </div>

      {action}
    </div>
  );
}

function InfoCard({ icon, label, value, secondary }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
      <div className="mb-3 flex items-center gap-2 text-purple-600">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="text-sm font-bold text-slate-700">{value}</p>

      {secondary && (
        <p className="mt-1 text-xs text-slate-400">{secondary}</p>
      )}
    </div>
  );
}

function Avatar({ name }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 text-xs font-bold text-purple-700">
      {initials}
    </div>
  );
}

function ContactItem({ icon, value }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-500">
      <span className="text-purple-500">{icon}</span>
      <span>{value}</span>
    </div>
  );
}
