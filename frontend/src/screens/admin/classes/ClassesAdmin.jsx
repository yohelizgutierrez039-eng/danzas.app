import React, { useMemo, useState } from "react";
import {
  Search,
  Plus,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Users,
  CalendarDays,
  Clock,
  MapPin,
  Monitor,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const classesData = [
  {
    id: 1,
    name: "Salsa intermedio",
    instructor: "Carlos Gómez",
    academy: "Ritmo & Sabor",
    modality: "Presencial",
    schedule: "Lun - Mié - Vie",
    time: "7:00 PM - 8:30 PM",
    location: "Medellín, Antioquia",
    students: 12,
    capacity: 20,
    status: "Activo",
    color: "purple",
  },
  {
    id: 2,
    name: "Bachata principiantes",
    instructor: "Carlos Gómez",
    academy: "Urban Dance Studio",
    modality: "Presencial",
    schedule: "Mar - Jue",
    time: "6:00 PM - 7:30 PM",
    location: "Bogotá, Cundinamarca",
    students: 18,
    capacity: 20,
    status: "Activo",
    color: "green",
  },
  {
    id: 3,
    name: "Hip Hop avanzado",
    instructor: "Valentina Ruiz",
    academy: "Urban Dance Studio",
    modality: "Presencial",
    schedule: "Sábados",
    time: "10:00 AM - 12:00 PM",
    location: "Cali, Valle del Cauca",
    students: 5,
    capacity: 15,
    status: "Activo",
    color: "blue",
  },
  {
    id: 4,
    name: "Ballet clásico",
    instructor: "Andrea López",
    academy: "Ballet Arte",
    modality: "Presencial",
    schedule: "Lun - Mié",
    time: "4:00 PM - 5:30 PM",
    location: "Medellín, Antioquia",
    students: 14,
    capacity: 15,
    status: "Finalizada",
    color: "pink",
  },
  {
    id: 5,
    name: "Contemporáneo",
    instructor: "Laura Pérez",
    academy: "Pasión Latina",
    modality: "Virtual",
    schedule: "Viernes",
    time: "7:00 PM - 8:30 PM",
    location: "Online",
    students: 9,
    capacity: 20,
    status: "Pausada",
    color: "orange",
  },
];

const tabs = [
  { key: "Todas", label: "Todas" },
  { key: "Presenciales", label: "Presenciales" },
  { key: "Virtuales", label: "Virtuales" },
];

function StatusBadge({ status }) {
  const styles = {
    Activo: "bg-emerald-50 text-emerald-600 border-emerald-200",
    Finalizada: "bg-red-50 text-red-500 border-red-200",
    Pausada: "bg-amber-50 text-amber-600 border-amber-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[status] || "bg-gray-50 text-gray-600 border-gray-200"
      }`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function ModalityBadge({ modality }) {
  const isVirtual = modality === "Virtual";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        isVirtual
          ? "bg-blue-50 text-blue-600"
          : "bg-purple-50 text-purple-600"
      }`}
    >
      {isVirtual ? <Monitor size={12} /> : <MapPin size={12} />}
      {modality}
    </span>
  );
}

export default function ClassesAdmin() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Todas");
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState(null);

  const filteredClasses = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    return classesData.filter((item) => {
      const matchesTab =
        activeTab === "Todas" ||
        (activeTab === "Presenciales" && item.modality === "Presencial") ||
        (activeTab === "Virtuales" && item.modality === "Virtual");

      const matchesSearch =
        !normalizedSearch ||
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.instructor.toLowerCase().includes(normalizedSearch) ||
        item.academy.toLowerCase().includes(normalizedSearch);

      return matchesTab && matchesSearch;
    });
  }, [activeTab, search]);

  return (
    <div className="min-h-screen bg-[#faf9fd] text-slate-800">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm text-slate-400">
            <Link to="/admin" className="hover:text-purple-600">
              Dashboard
            </Link>
            <span>/</span>
            <span>Clases</span>
          </div>

          <h1 className="text-2xl font-bold text-[#351274] md:text-3xl">
            Gestión de clases
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Administra las clases, horarios, instructores y estados.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/classes/create")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6524e8] to-[#a929e9] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-200 transition hover:scale-[1.02]"
        >
          <Plus size={18} />
          Nueva clase
        </button>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total clases"
          value="1,256"
          description="+15% este mes"
          icon={<CalendarDays size={21} />}
          color="purple"
        />

        <SummaryCard
          title="Clases activas"
          value="1,120"
          description="89% del total"
          icon={<Clock size={21} />}
          color="green"
        />

        <SummaryCard
          title="Presenciales"
          value="982"
          description="78% de las clases"
          icon={<MapPin size={21} />}
          color="blue"
        />

        <SummaryCard
          title="Virtuales"
          value="274"
          description="22% de las clases"
          icon={<Monitor size={21} />}
          color="pink"
        />
      </div>

      {/* Main card */}
      <div className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm">
        {/* Filters */}
        <div className="border-b border-slate-100 p-4 md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Tabs */}
            <div className="flex w-full gap-1 overflow-x-auto rounded-xl bg-slate-50 p-1 lg:w-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
                    activeTab === tab.key
                      ? "bg-gradient-to-r from-[#6524e8] to-[#8b2be2] text-white shadow-sm"
                      : "text-slate-500 hover:text-purple-600"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full lg:max-w-sm">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar clase..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              />
            </div>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[950px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Clase
                </th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Instructor
                </th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Horario
                </th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Modalidad
                </th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Inscritos
                </th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Estado
                </th>
                <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                  Acción
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredClasses.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-100 transition hover:bg-purple-50/30"
                >
                  <td className="px-5 py-4">
                    <div>
                      <Link
                        to={`/admin/classes/${item.id}`}
                        className="font-semibold text-slate-800 hover:text-purple-600"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-xs text-slate-400">
                        {item.academy}
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 text-xs font-bold text-purple-700">
                        {item.instructor
                          .split(" ")
                          .map((name) => name[0])
                          .join("")
                          .slice(0, 2)}
                      </div>

                      <span className="text-sm font-medium text-slate-700">
                        {item.instructor}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-slate-700">
                      {item.schedule}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {item.time}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <ModalityBadge modality={item.modality} />
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-purple-500" />
                      <span className="text-sm font-semibold text-slate-700">
                        {item.students}
                      </span>
                      <span className="text-xs text-slate-400">
                        / {item.capacity}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={item.status} />
                  </td>

                  <td className="relative px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenu(openMenu === item.id ? null : item.id)
                      }
                      className="rounded-lg p-2 text-slate-400 hover:bg-purple-50 hover:text-purple-600"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {openMenu === item.id && (
                      <ActionMenu
                        id={item.id}
                        onClose={() => setOpenMenu(null)}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="divide-y divide-slate-100 md:hidden">
          {filteredClasses.map((item) => (
            <div key={item.id} className="p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <Link
                    to={`/admin/classes/${item.id}`}
                    className="font-semibold text-slate-800"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-1 text-xs text-slate-400">
                    {item.academy}
                  </p>
                </div>

                <StatusBadge status={item.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <InfoItem
                  icon={<Users size={14} />}
                  label="Instructor"
                  value={item.instructor}
                />

                <InfoItem
                  icon={<CalendarDays size={14} />}
                  label="Horario"
                  value={item.time}
                />

                <InfoItem
                  icon={<MapPin size={14} />}
                  label="Modalidad"
                  value={item.modality}
                />

                <InfoItem
                  icon={<Users size={14} />}
                  label="Inscritos"
                  value={`${item.students}/${item.capacity}`}
                />
              </div>

              <button
                type="button"
                onClick={() => navigate(`/admin/classes/${item.id}`)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-purple-200 py-2.5 text-sm font-semibold text-purple-600"
              >
                <Eye size={16} />
                Ver detalle
              </button>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredClasses.length === 0 && (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-50 text-purple-500">
              <Search size={24} />
            </div>
            <h3 className="font-semibold text-slate-700">
              No encontramos clases
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Intenta cambiar los filtros o el término de búsqueda.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Mostrando{" "}
            <strong className="text-slate-700">
              {filteredClasses.length}
            </strong>{" "}
            clases
          </span>

          <div className="flex items-center gap-1">
            <button className="rounded-lg border border-purple-200 px-3 py-1.5 text-purple-600">
              1
            </button>
            <button className="rounded-lg px-3 py-1.5 hover:bg-purple-50">
              2
            </button>
            <button className="rounded-lg px-3 py-1.5 hover:bg-purple-50">
              3
            </button>
            <span className="px-1">...</span>
            <button className="rounded-lg px-3 py-1.5 hover:bg-purple-50">
              8
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, description, icon, color }) {
  const colors = {
    purple: "bg-purple-50 text-purple-600",
    green: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    pink: "bg-pink-50 text-pink-600",
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors[color]}`}
        >
          {icon}
        </div>
      </div>

      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
      <p className="mt-1 text-xs font-medium text-emerald-500">
        {description}
      </p>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-2.5">
      <div className="mb-1 flex items-center gap-1 text-slate-400">
        {icon}
        <span>{label}</span>
      </div>
      <p className="font-medium text-slate-700">{value}</p>
    </div>
  );
}

function ActionMenu({ id, onClose }) {
  return (
    <div className="absolute right-5 top-12 z-20 w-44 rounded-xl border border-slate-100 bg-white p-1.5 text-left shadow-xl">
      <Link
        to={`/admin/classes/${id}`}
        onClick={onClose}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-purple-50 hover:text-purple-600"
      >
        <Eye size={15} />
        Ver detalle
      </Link>

      <Link
        to={`/admin/classes/${id}/edit`}
        onClick={onClose}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-purple-50 hover:text-purple-600"
      >
        <Pencil size={15} />
        Editar clase
      </Link>

      <button
        type="button"
        onClick={onClose}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50"
      >
        <Trash2 size={15} />
        Eliminar
      </button>
    </div>
  );
}
