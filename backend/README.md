# Backend de Danzas.app

API REST de Danzas.app, la plataforma para encontrar e inscribirse en clases de baile. Está hecha con **Express 5**, **Prisma 6** y **MySQL**, en CommonJS. Las pruebas usan **vitest**.

La interfaz que consume esta API está en [`../frontend`](../frontend/README.md). Levanta primero el backend y después el frontend.

## Inicio rápido

Requisitos: Node.js 22.12 o superior (ver [Versión de Node](#versión-de-node)), npm y un servidor MySQL en marcha.

```bash
cd backend
npm install
# Copia .env.example a .env y completa las variables (ver "Variables de entorno")
npx prisma generate
npx prisma db push
npm run seed:demo      # opcional: carga datos de demostración
npm run dev
```

Resultado esperado en la terminal: `Servidor ejecutándose en http://localhost:3000`.

Verificación: abre `http://localhost:3000/api/prueba-db`. Debe responder `{"mensaje":"Conexión con MySQL correcta","datos":[{"resultado":1}]}`.

## Variables de entorno

El paquete incluye un archivo `.env.example`: cópialo a `.env` y reemplaza los valores de ejemplo por los tuyos. Nunca subas el `.env` al repositorio. Esta tabla sale de los `process.env.*` del código.

| Variable | Para qué sirve | Obligatoria | Por defecto en el código |
| -------- | -------------- | ----------- | ------------------------ |
| `DATABASE_URL` | URL de MySQL que usa Prisma (`prisma/schema.prisma`) | Sí | Ninguno |
| `JWT_SECRET` | Firma y verifica los JWT | Sí | Ninguno |
| `JWT_EXPIRES_IN` | Vigencia del token de sesión (formato `jsonwebtoken`, por ejemplo `1h`) | Sí, el código no define valor por defecto | Ninguno |
| `PORT` | Puerto del servidor | No | `3000` |
| `FRONTEND_URL` | Base del enlace del correo de recuperación de contraseña | No | `http://localhost:5173` |
| `RESEND_API_KEY` | Clave de Resend para enviar correos | No | Sin clave, el correo se simula |
| `EMAIL_FROM` | Remitente de los correos | No | Sin remitente, el correo se simula |
| `NODE_ENV` | Con `production` se ignora `simularRechazo` en el pago simulado | No | Sin definir |

Solo para scripts (se definen en el shell del comando, ver [`create:admin`](#scripts-de-apoyo)):

| Variable | Uso |
| -------- | --- |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Obligatorias para `create:admin` (la contraseña, mínimo 10 caracteres) |
| `ADMIN_NOMBRE`, `ADMIN_CIUDAD` | Opcionales: `Administrador` y `Sin definir` por defecto |

## Scripts de npm

Tomados de `package.json`.

| Comando | Qué hace |
| ------- | -------- |
| `npm run dev` | Servidor con recarga automática (`nodemon src/server.js`) |
| `npm start` | Servidor sin recarga (`node src/server.js`) |
| `npm test` | Pruebas con vitest (`vitest run`) |
| `npm run test:coverage` | Pruebas con cobertura (v8), limitada a los servicios de pago, inscripción y horario |
| `npm run db:check` | Prueba la conexión a MySQL y avisa si va cifrada (`scripts/check-db.js`) |
| `npm run seed:demo` | Carga los datos de la demostración (`prisma/seed-demo.js`) |
| `npm run create:admin` | Crea o actualiza la cuenta de administrador real (`scripts/create-admin.js`) |
| `npm run backfill:solicitudes` | Crea la solicitud de academia pendiente para instructores que no la tienen (`scripts/backfill-solicitudes.js`) |

## Base de datos

- Prisma modela las tablas en `prisma/schema.prisma` (usuarios, menores, solicitudes de academia, clases, horarios, inscripciones, pagos y asistencia).
- El proyecto **no usa migraciones**: no existe la carpeta `prisma/migrations`. El esquema se aplica con `npx prisma db push`. Si cambias `schema.prisma`, vuelve a ejecutar `db push` y `npx prisma generate`.
- Hay dos seeds, con efectos muy distintos:

| Comando | Efecto |
| ------- | ------ |
| `npm run seed:demo` | **Aditivo**: crea lo que falta y no borra nada. Admite `-- --dry-run`, `-- --reset --yes` y `-- --allow-remote` (el `--` es obligatorio) |
| `npx prisma db seed` | Ejecuta `prisma/seed.js`: **borra todas las tablas** y crea 7 cuentas base |

Las cuentas, contraseñas y el guion de la demostración están en [`../docs/demo.md`](../docs/demo.md). No ejecutes `npx prisma db seed` ni `seed:demo -- --reset` sobre datos que quieras conservar.

## Estructura de `src/`

```text
src/
  server.js          Arranque: CORS, JSON, rutas, manejador de errores
  config/            Cliente de Prisma
  routes/            Define las rutas y sus middlewares (auth, roles)
  controllers/       Lee la petición y responde
  services/          Reglas de negocio (incluye email.service.js y payment/)
  repositories/      Acceso a datos con Prisma
  middleware/        auth.middleware.js, roleGuard.middleware.js, errorHandler.js
  events/            Emisor de eventos "correo" (RF-017)
  utils/             JWT, plantillas de correo, utilidades de horario
prisma/              schema.prisma, seed.js, seed-demo.js
scripts/             check-db, create-admin, backfill-solicitudes, generate-test-token
tests/               Pruebas de vitest (tests/**/*.test.js)
```

Flujo de una petición: `routes` -> `controllers` -> `services` -> `repositories`.

## API

Todas las rutas cuelgan de `/api`. Los roles salen de `requireRole(...)` en cada archivo de rutas; "autenticado" significa cualquier rol con sesión válida.

| Prefijo | Para qué sirve | Acceso |
| ------- | -------------- | ------ |
| `GET /` | Mensaje de que el servidor funciona | Público |
| `GET /api/prueba-db` | Verifica la conexión con MySQL | Público |
| `/api/auth` | `register`, `login`, `forgot-password`, `reset-password` | Público |
| `/api/classes` | Búsqueda (`/search`), detalle (`/:id`), crear, editar y cancelar clases, `/my-classes`, asistencia (`/:id/attendance`) | Búsqueda y detalle públicos; el resto, `instructor` |
| `/api/enrollments` | Inscribirse, pago simulado (`/:id/simulate-payment`) y cancelar (`DELETE /:id`) | `estudiante`, `padre` |
| `/api/users` | Menores a cargo (`/dependents`) e historial de inscripciones (`/:id/enrollments`) | Autenticado; el detalle de un menor, `padre` o `admin` |
| `/api/admin/users` | Listar, ver, editar, suspender (`PATCH /:id/suspend`) y eliminar usuarios | `admin` |
| `/api/admin/academy-requests` | Listar, ver, aprobar y rechazar solicitudes de academia | `admin` |
| `/api/reports` | `/payments` (reporte de pagos) y `/attendance` (asistencia de un hijo) | `/payments`: `admin`, `instructor`; `/attendance`: `padre` |

## Autenticación y errores

- El login devuelve un **JWT** firmado con `JWT_SECRET`. Se envía en cada petición como `Authorization: Bearer <token>`.
- Los roles son `admin`, `instructor`, `estudiante` y `padre`, siempre en minúsculas. El registro público solo admite `estudiante`, `padre` e `instructor`; el admin se crea con `create:admin`.
- El middleware lee al usuario en la base en cada petición, así que una **suspensión surte efecto de inmediato**: responde `403` con código `ACCOUNT_SUSPENDED`. Tras 5 contraseñas incorrectas, la cuenta se bloquea 15 minutos (`423`, `ACCOUNT_LOCKED`).
- Los errores de negocio se lanzan con `new AppError(message, status, code)` y el manejador (`middleware/errorHandler.js`) responde siempre así:

```json
{ "error": { "code": "FORBIDDEN", "message": "Texto para mostrar al usuario" } }
```

Si el error no es un `AppError`, la respuesta es `500` con código `INTERNAL_ERROR` y un mensaje genérico. El endpoint `/api/prueba-db` es la excepción: responde `{ "mensaje": ... }`.

## Correos (RF-017)

Los avisos del sistema (pago, cancelaciones, resolución de academias y recuperación de contraseña) se emiten como evento `correo` y los envía `src/services/email.service.js` con la API de Resend mediante `fetch`.

- Si **faltan `RESEND_API_KEY` o `EMAIL_FROM`**, no se envía nada: el correo se imprime en la consola como `[correo simulado] Para: ... | Asunto: ...`. Es lo esperado en desarrollo y en la demostración.
- Un fallo del proveedor solo se registra en el log; nunca rompe la operación del usuario.

## Pruebas

```bash
npm test
```

Las 25 suites están en `tests/`. Un bloque de `tests/enrollment.service.test.js` solo corre si `DATABASE_URL` está definida en el entorno. Para ver la cobertura: `npm run test:coverage`.

### Versión de Node

El repositorio no declara `engines` ni `.nvmrc`. La versión de `vitest` instalada exige Node `^22.12.0 || ^24.0.0 || >=26.0.0`, así que usa **Node 22.12 o superior** si vas a correr las pruebas. El flujo de CI (`.github/workflows/ci.yml`) usa Node 20, pero solo ejecuta el lint del frontend y `prisma generate`.

## Solución de problemas

| Síntoma | Causa probable | Qué hacer |
| ------- | -------------- | --------- |
| `EADDRINUSE` | El puerto 3000 está ocupado | Cambia `PORT` (por ejemplo `PORT=3001 npm run dev`) y ajusta `VITE_API_URL` en el frontend |
| `P1001` | MySQL apagado o `DATABASE_URL` mal | Enciende MySQL y revisa host y puerto |
| `P1003` | La base no existe | Créala y ejecuta `npx prisma db push` |
| `P2021` o `P2022` | Falta una tabla o columna | Ejecuta `npx prisma db push` |
| `[ABORTADO] --reset BORRA TODOS los datos` | Falta `--yes` (y el `--` de npm antes de las opciones) | `npm run seed:demo -- --reset --yes` |
| La conexión no va cifrada | Prisma ignora `ssl-mode` en la URL de MySQL | Usa `sslaccept=accept_invalid_certs`; compruébalo con `npm run db:check` (ver [`../docs/despliegue.md`](../docs/despliegue.md)) |
| `Cuenta bloqueada` al iniciar sesión | 5 intentos fallidos | Espera 15 minutos |

## Documentación relacionada

- [Guía de la demostración y credenciales](../docs/demo.md)
- [Plan de despliegue](../docs/despliegue.md): el despliegue está **pospuesto** por decisión del equipo; la entrega es local hasta el 31/10/2026. Los archivos `render.yaml` y `frontend/vercel.json` existen pero no están en uso.
- [Casos de prueba de QA](../docs/qa/)
- Documentos del proyecto: [ERS v1.2](../docs/ERS_DanzasApp_v1.2.docx), [SDD v1.1](../docs/SDD_DanzasApp_v1.1.docx) y [Plan del proyecto v1.1](../docs/Plan_Proyecto_DanzasApp_v1.1.docx)
- [README del frontend](../frontend/README.md)
