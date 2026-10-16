/*
  Secciones del menú lateral que todavía no tienen pantalla. Cada una se
  registra como ruta provisoria con SectionComingSoon (ver AppRouter.jsx).

  Al construir una sección: quitarla de acá y agregar su <Route> real. Cada
  `path` tiene que coincidir con el enlace del Sidebar.jsx de su rol.
*/

const NOTIFICATIONS_TEXT =
  "Por ahora los avisos del sistema se envían por correo electrónico.";
const PROFILE_TEXT = "La gestión de tu perfil estará disponible más adelante.";

const COMING_SOON_SECTIONS = {
  admin: {
    area: "Administración",
    backTo: "/admin",
    items: [
      {},
      {
        path: "/admin/notificaciones",
        title: "Notificaciones",
        description: NOTIFICATIONS_TEXT,
      },
      { path: "/admin/perfil", title: "Mi perfil", description: PROFILE_TEXT },
    ],
  },

  student: {
    area: "Estudiante",
    backTo: "/estudiante",
    items: [
      {
        path: "/estudiante/clases",
        title: "Mis clases",
        description:
          "Aquí verás las clases en las que estás inscrito y sus horarios.",
      },
      {
        path: "/estudiante/asistencia",
        title: "Asistencia",
        description: "Aquí podrás consultar tu asistencia a las clases.",
      },
      {
        path: "/estudiante/pagos",
        title: "Pagos",
        description: "Aquí podrás consultar el historial de tus pagos.",
      },
      {
        path: "/estudiante/notificaciones",
        title: "Notificaciones",
        description: NOTIFICATIONS_TEXT,
      },
      {
        path: "/estudiante/perfil",
        title: "Mi perfil",
        description: PROFILE_TEXT,
      },
    ],
  },

  parent: {
    area: "Padre de familia",
    backTo: "/padre",
    items: [
      {
        path: "/padre/pagos",
        title: "Pagos",
        description:
          "Aquí podrás consultar el historial de pagos de las inscripciones de tus hijos.",
      },
      {
        path: "/padre/notificaciones",
        title: "Notificaciones",
        description: NOTIFICATIONS_TEXT,
      },
      { path: "/padre/perfil", title: "Mi perfil", description: PROFILE_TEXT },
    ],
  },

  instructor: {
    area: "Instructor",
    backTo: "/instructor",
    items: [
      {
        path: "/instructor/estudiantes",
        title: "Estudiantes",
        description: "Aquí verás los estudiantes inscritos en tus clases.",
      },
      {
        path: "/instructor/asistencia",
        title: "Asistencia",
        description: "Aquí podrás registrar la asistencia de tus clases.",
      },
      {
        path: "/instructor/calendario",
        title: "Calendario",
        description: "Aquí verás el calendario semanal de tus clases.",
      },
      {
        path: "/instructor/pagos",
        title: "Pagos",
        description:
          "Aquí podrás consultar los pagos recibidos por tus clases.",
      },
      {
        path: "/instructor/reportes",
        title: "Reportes",
        description: "Aquí podrás generar reportes de los pagos de tus clases.",
      },
      {
        path: "/instructor/notificaciones",
        title: "Notificaciones",
        description: NOTIFICATIONS_TEXT,
      },
      {
        path: "/instructor/perfil",
        title: "Mi perfil",
        description: PROFILE_TEXT,
      },
    ],
  },
};

export default COMING_SOON_SECTIONS;
