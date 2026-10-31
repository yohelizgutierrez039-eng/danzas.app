# Frontend de Danzas.app

Interfaz web de Danzas.app, la plataforma para encontrar e inscribirse en clases de baile. Está hecha con **React 19**, **Vite** y **React Router**, y consume la API de [`../backend`](../backend/README.md).

## Inicio rápido

Requisitos: Node.js 22.12 o superior (el repositorio no declara `engines`; es la misma versión que pide el backend para sus pruebas) y el **backend en marcha**, porque el frontend no tiene datos propios.

```bash
cd frontend
npm install
# Copia .env.example a .env y define VITE_API_URL (ver "Variable de entorno")
npm run dev
```

Vite no define otro puerto en `vite.config.js`, así que usa el suyo por defecto: **`http://localhost:5173`**. Si ese puerto está ocupado, Vite elige el siguiente y lo muestra en la terminal.

Para tener datos con los que navegar, carga la demostración desde `backend/` con `npm run seed:demo` y usa las cuentas de [`../docs/demo.md`](../docs/demo.md).

## Variable de entorno

El paquete incluye un archivo `.env.example`: cópialo a `.env`.

| Variable | Para qué sirve | Obligatoria | Por defecto |
| -------- | -------------- | ----------- | ----------- |
| `VITE_API_URL` | URL base de la API, **incluyendo `/api`**. Se lee en `src/api/api.js` | Sí | Ninguno |

- Debe apuntar al backend en local, con la forma `http://localhost:3000/api` (el backend usa el puerto `3000` salvo que cambies `PORT`).
- Sin esta variable, las peticiones salen a `undefined/...` y todo falla. Si la cambias, reinicia Vite.

## Scripts de npm

Tomados de `package.json`.

| Comando | Qué hace |
| ------- | -------- |
| `npm run dev` | Servidor de desarrollo de Vite |
| `npm run lint` | ESLint sobre todo el paquete (`eslint .`) |
| `npm run build` | Compila a `dist/` |
| `npm run preview` | Sirve el resultado de `build` |

No hay script de pruebas en este paquete. El CI (`.github/workflows/ci.yml`) ejecuta `npm run lint`.

## Estructura de `src/`

```text
src/
  main.jsx, App.jsx   Arranque: AuthProvider + AppRouter
  api/api.js          Cliente HTTP único (función api)
  services/           Una función por endpoint: auth, classes, enrollments,
                      academies, users, reports
  hooks/              useAuth, useClasses, useAcademies, usePaymentsReport...
  context/            AuthContext (sesión y token)
  routes/             AppRouter, ProtectedRoute, comingSoonSections
  layouts/            Public, Auth, Admin, Student, Parent e Instructor
  screens/            Pantallas por área: public, auth, admin, student, parent, instructor
  components/         Piezas reutilizables (common, layout, classes, dashboard...)
  styles/, utils/     Estilos globales y utilidades (formatos de fecha y moneda)
```

## Rutas por rol

`src/routes/AppRouter.jsx` agrupa las rutas por layout. `ProtectedRoute` redirige a `/login` si no hay sesión y a `/no-autorizado` si el rol no coincide. Tras iniciar sesión, cada rol cae en su inicio.

| Área | Rol | Rutas principales |
| ---- | --- | ----------------- |
| Pública | Invitado | `/`, `/clases`, `/clases/:id`, `/academias`, `/como-funciona`, `/about` |
| Autenticación | Invitado | `/login`, `/registro`, `/recuperar-password`, `/restablecer-password` |
| Administración | `admin` | `/admin`, `/admin/usuarios`, `/admin/academias`, `/admin/reportes` |
| Estudiante | `estudiante` | `/estudiante`, `/estudiante/inscripciones` y el flujo de inscripción y pago |
| Padre | `padre` | `/padre`, `/padre/menores`, `/padre/inscripciones`, `/padre/asistencia` |
| Instructor | `instructor` | `/instructor`, `/instructor/clases`, `/instructor/pagos` |

## Cómo se llama a la API

`api` es una **función** (no un objeto con métodos tipo axios). Recibe el endpoint, relativo a `VITE_API_URL`, y las opciones de `fetch`:

- Agrega `Content-Type: application/json` y, si hay token en `localStorage`, `Authorization: Bearer <token>`.
- Devuelve el JSON de la respuesta.
- Si la respuesta no es exitosa, **lanza un `Error`** con el mensaje de `error.message` del backend, más `status` y `data`. Cada pantalla lo maneja con `try/catch`.

Ejemplo real de `src/services/classes.service.js`:

```js
import api from "../api/api";

export const searchClasses = async ({ tipo, ciudad } = {}) => {
  const params = new URLSearchParams();

  if (tipo) params.append("tipo", tipo);
  if (ciudad) params.append("ciudad", ciudad);

  const queryString = params.toString();

  return await api(`/classes/search${queryString ? `?${queryString}` : ""}`);
};

export const createClass = async (classData) => {
  return await api("/classes", {
    method: "POST",
    body: JSON.stringify(classData),
  });
};
```

El `AuthContext` guarda `token` y `user` en `localStorage`. Los endpoints disponibles y sus roles están en la [tabla de la API del backend](../backend/README.md#api).

## Estado del frontend

La fuente de verdad de lo que funciona es [`../docs/demo.md`](../docs/demo.md). Resumen honesto:

**Conectado al backend** (según `docs/demo.md`): registro e inicio de sesión, explorar clases con filtros, inscripción, pago simulado, cancelación con reembolso, asistencia, reporte de pagos, gestión de usuarios y revisión de solicitudes de academia.

**Con datos de ejemplo (no usan el backend)**, comprobado en el código:

| Pantalla | Rutas | Evidencia |
| -------- | ----- | --------- |
| Los cuatro dashboards | `/estudiante`, `/padre`, `/instructor`, `/admin` | Comentario "Datos de demostración temporales" en cada `Dashboard*.jsx` |
| Clases del admin | `/admin/classes`, `/admin/classes/:id` | Constantes `MOCK_CLASSES` y `MOCK_CLASS_DETAIL` |
| Academias para invitados | `/academias`, `/academias/:id` | Comentario "Datos de demostración" en `Academies.jsx` y `AcademyDetail.jsx` |

**Pendiente**:

- Hay 17 secciones del menú lateral que abren una pantalla "Próximamente" (pagos, notificaciones, mi perfil y otras). Se registran en `src/routes/comingSoonSections.js`.
- Hay al menos 30 archivos vacíos en `src/` (por ejemplo `screens/admin/payments/PaymentsAdmin.jsx`) reservados para pantallas, hooks y servicios que aún no se construyen.
- Siguen pendientes, según `docs/demo.md`, la verificación de correo al registrarse y el consentimiento de datos personales. No todos los requisitos del ERS están completos.

## Solución de problemas

| Síntoma | Causa probable | Qué hacer |
| ------- | -------------- | --------- |
| No cargan clases o hay error de red | Backend apagado o `VITE_API_URL` incorrecta | Levanta el backend y revisa que `VITE_API_URL` termine en `/api`; reinicia Vite si la cambias |
| Backend en otro puerto (por `EADDRINUSE`) | `3000` ocupado | Ajusta `VITE_API_URL` al nuevo puerto; para el frontend, `npm run dev -- --port 5174` |
| Un botón lleva a "Próximamente" | La sección aún no existe | Usa el menú lateral; el detalle está en `docs/demo.md` |

## Documentación relacionada

- [README del backend](../backend/README.md)
- [Guía de la demostración y credenciales](../docs/demo.md)
- [Plan de despliegue](../docs/despliegue.md): el despliegue está **pospuesto** por decisión del equipo; la entrega es local hasta el 31/10/2026. `frontend/vercel.json` existe pero no está en uso.
- [Casos de prueba de QA](../docs/qa/)
- Documentos del proyecto: [ERS v1.2](../docs/ERS_DanzasApp_v1.2.docx), [SDD v1.1](../docs/SDD_DanzasApp_v1.1.docx) y [Plan del proyecto v1.1](../docs/Plan_Proyecto_DanzasApp_v1.1.docx)
