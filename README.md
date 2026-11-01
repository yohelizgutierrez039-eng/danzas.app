# Danzas.app

Plataforma web para encontrar clases de baile, inscribirse y pagar. Conecta a estudiantes y padres de familia con instructores y academias.

> **Estado: versión 1.0 en desarrollo.** El núcleo funciona de punta a punta, pero **no todos los requisitos del ERS están completos** (ver [Estado del proyecto](#estado-del-proyecto)). La entrega es local: el despliegue en producción está **pospuesto** por decisión del equipo.

## Qué permite hacer

Hay cuatro roles: `estudiante`, `padre`, `instructor` y `admin`. Además, cualquier visitante puede explorar las clases sin cuenta.

- **Registro e inicio de sesión** con recuperación de contraseña.
- **Publicar y buscar clases** por tipo y ciudad, con horarios, cupos y detección de cruces de horario.
- **Inscribirse y pagar** (el pago es simulado), con cancelación y reembolso cuando faltan 2 horas o más para la próxima sesión.
- **Padres:** registrar a sus hijos menores e inscribirlos en clases.
- **Instructores:** administrar sus clases y tomar asistencia.
- **Administración:** gestionar usuarios (suspender, editar, eliminar) y aprobar o rechazar solicitudes de academias.
- **Reportes:** pagos para administradores e instructores, y asistencia de los hijos para los padres.
- **Avisos por correo** mediante Resend. Sin credenciales, se simulan en la consola del backend.

## Inicio rápido

Requisitos: Node.js 22.12 o superior, npm y un servidor MySQL en marcha. Levanta primero el backend y después el frontend.

```bash
# 1. Backend (http://localhost:3000)
cd backend
npm install
# copia .env.example a .env y completa DATABASE_URL, JWT_SECRET y JWT_EXPIRES_IN
npx prisma generate
npx prisma db push
npm run seed:demo      # datos de demostración (opcional, no borra nada)
npm run dev
```

```bash
# 2. Frontend (http://localhost:5173)
cd frontend
npm install
# copia .env.example a .env y define VITE_API_URL=http://localhost:3000/api
npm run dev
```

Con los datos de demostración cargados, las cuentas y el guion para recorrer la plataforma están en [`docs/demo.md`](docs/demo.md). El detalle de cada paquete está en su propio README:

- [Backend](backend/README.md): variables de entorno, scripts, base de datos, API y errores.
- [Frontend](frontend/README.md): rutas por rol, cliente de la API y estado de las pantallas.

## Tecnologías

| Capa | Tecnología |
| ---- | ---------- |
| Frontend | React 19, Vite, React Router |
| Backend | Node.js, Express 5, Prisma 6 |
| Base de datos | MySQL |
| Pruebas | vitest (backend) |
| Correo | Resend, mediante `fetch` |
| Integración continua | GitHub Actions: lint del frontend y `prisma generate` del backend |

## Estructura del repositorio

```text
backend/    API REST (rutas, controladores, servicios, repositorios, Prisma)
frontend/   Aplicación web en React
docs/       Documentación del proyecto, guía de demostración y casos de prueba
.github/    Flujo de integración continua
render.yaml Configuración de despliegue (existe, pero no está en uso)
```

## Estado del proyecto

Lo que **sí** está conectado y funciona está en la lista de arriba. Lo que **falta o es provisional**:

- **Requisitos del ERS incompletos:** falta la verificación de correo al registrarse, el consentimiento de datos personales y la edición o eliminación de menores, entre otros.
- **Pantallas con datos de ejemplo:** los cuatro dashboards, la gestión de clases del administrador y las academias para invitados no usan el backend.
- **Menú con secciones "Próximamente":** 17 entradas (pagos, notificaciones, mi perfil y otras) abren una pantalla vacía.
- **Pagos simulados:** no hay pasarela; la integración real queda para una versión posterior.
- **Sin despliegue:** los archivos existen (`render.yaml`, `frontend/vercel.json`) pero no se usan todavía.

La lista completa y las limitaciones conocidas están en [`docs/demo.md`](docs/demo.md), secciones 5 y 6.

## Documentación

| Documento | Para qué sirve |
| --------- | -------------- |
| [ERS v1.2](docs/ERS_DanzasApp_v1.2.docx) | Especificación de requisitos |
| [SDD v1.1](docs/SDD_DanzasApp_v1.1.docx) | Diseño del software |
| [Plan del proyecto v1.1](docs/Plan_Proyecto_DanzasApp_v1.1.docx) | Alcance, cronograma, equipo y riesgos |
| [Guía de la demostración](docs/demo.md) | Cuentas de prueba, guion y limitaciones |
| [Plan de despliegue](docs/despliegue.md) | Cómo se desplegaría, cuando el equipo lo retome |
| [Casos de prueba](docs/qa/) | Casos de QA por sprint |
| Mapas de pantallas | [Invitado](docs/Mapa_de_pantallas_usuario_invitado.png), [estudiante](docs/Mapa_de_pantallas_usuario_estudiante.png), [instructor](docs/Mapa_de_pantallas_usuario_instructor.png) y [administrador](docs/Mapa_de_pantallas_usuario_admin.png) |

## Cómo contribuir

- Los cambios entran a `main` mediante **pull request**, desde una rama propia (por ejemplo `feat/...`, `fix/...` o `docs/...`).
- Los mensajes de commit siguen **Conventional Commits** (`feat:`, `fix:`, `docs:`, `test:`...).
- Antes de abrir el PR, corre `npm run lint` en `frontend/` y `npm test` en `backend/`.
