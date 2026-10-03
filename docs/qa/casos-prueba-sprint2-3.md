# Casos de prueba manuales — Sprint 2-3 (regresión de Sprint 2 + búsqueda, inscripción e historial)

Casos de prueba en formato Dado/Cuando/Entonces para la regresión del módulo
de academias y clases (RF-006 a RF-010, Sprint 2) y para los módulos nuevos del
Sprint 3: búsqueda y filtrado (RF-011), inscripción (RF-012) e historial
(RF-014). El pago simulado (RF-013) y la cancelación con reembolso (RF-018) se
prueban en detalle en `casos-prueba-sprint4.md`; aquí solo se prueba el paso
previo (la inscripción queda `pendiente_pago`).

Igual que en `casos-prueba-sprint1.md`, los resultados esperados salen del
comportamiento real del código (`backend/src` y `frontend/src/screens`), no
del ERS. Las diferencias con el ERS (`docs/ERS_DanzasApp_v1.2.docx`) se marcan
en "Estado conocido" y se describen en
[Observaciones](#observaciones-discrepancias-ers--código). Los casos de
regresión (CP-S23-001 a 008) son una versión abreviada de los casos completos
de `casos-prueba-sprint1-2.md` (se cita el ID de origen); ante una duda sobre
el detalle de datos o variantes, ese documento manda.

> Alcance de la revisión: análisis estático del código; no se ejecutó la
> aplicación para escribir este documento.

## Índice de casos

| ID | RF | Caso | Prioridad | Cómo se ejecuta | Estado conocido |
| -- | -- | ---- | --------- | --------------- | --------------- |
| CP-S23-001 | RF-006 | Regresión: admin aprueba y rechaza solicitudes de academia (origen CP-S12-002/003) | Alta | API | OK |
| CP-S23-002 | RF-006 | Regresión: academia rechazada o pendiente no puede publicar clases (origen CP-S12-004) | Alta | API | OK (OBS-01 corregido en `fix/auth-clases-cuatro-bugs`) |
| CP-S23-003 | RF-007 | Regresión: admin gestiona usuarios (listar, suspender, eliminar) (origen CP-S12-006 a 010) | Alta | UI + API | OK |
| CP-S23-004 | RF-007 | Regresión: control de acceso al panel de administración (origen CP-S12-005/006) | Media | UI + API | OK |
| CP-S23-005 | RF-008 | Regresión: cruce de horario y espacio mínimo de 15 minutos (origen CP-S12-014 a 016) | Alta | API | OK / verificar OBS-02 |
| CP-S23-006 | RF-009 | Regresión: edición y cancelación de clase por el instructor (origen CP-S12-018/019) | Alta | API | OK |
| CP-S23-007 | RF-010 | Regresión: instructor registra asistencia en su clase (origen CP-S12-020) | Media | API | OK |
| CP-S23-008 | RF-010 | Regresión: asistencia en una clase que NO es del instructor (origen CP-S12-021) | Alta | API | OK |
| CP-S23-009 | RF-011 | Búsqueda y filtrado exitosos por tipo de baile y ciudad | Alta | UI + API | OK |
| CP-S23-010 | RF-011 | Búsqueda sin resultados | Alta | UI + API | OK |
| CP-S23-011 | RF-011 | El buscador excluye clases canceladas y muestra los cupos | Media | UI + API | OK |
| CP-S23-012 | RF-012 | El estudiante se inscribe en una clase | Alta | UI + API | OK |
| CP-S23-013 | RF-012 | Inscripción en una clase sin cupos | Alta | UI + API | OK |
| CP-S23-014 | RF-012 | Inscripción duplicada en la misma clase | Media | API | OK |
| CP-S23-015 | RF-012 | El padre inscribe a su menor | Alta | API | OK |
| CP-S23-016 | RF-012 | Un padre intenta inscribir a un menor que NO es suyo | Alta | API | OK |
| CP-S23-017 | RF-012 | Reglas por rol y por parámetros al inscribirse | Media | API | OK |
| CP-S23-018 | RF-012 | Inscripción del menor desde la pantalla "Explorar clases" del padre | Media | UI | DEFECTO de integración (OBS-04) |
| CP-S23-019 | RF-014 | El estudiante consulta su propio historial | Alta | UI + API | OK |
| CP-S23-020 | RF-014 | El padre consulta el historial de su menor | Alta | API (UI no operable) | OK en API / DEFECTO UI (OBS-06) |
| CP-S23-021 | RF-014 | Un usuario intenta ver el historial de OTRO usuario | Alta | API | OK |
| CP-S23-022 | RF-014 | El admin consulta el historial de cualquier usuario o menor | Media | UI + API | OK |

Casos que el pedido de QA marcó como obligatorios: búsqueda sin resultados
(CP-S23-010), inscripción sin cupo (CP-S23-013), padre con menor ajeno
(CP-S23-016) y consulta del historial de otro usuario (CP-S23-021). La
gestión de usuarios por el admin está en CP-S23-003/004.

## Cómo preparar el entorno

1. **Variables de entorno.** El backend lee `backend/.env` y el frontend
   `frontend/.env` (cada carpeta tiene su `.env.example`; los `.env` no se
   versionan). Hace falta MySQL accesible y `DATABASE_URL`, `JWT_SECRET` y
   `JWT_EXPIRES_IN` definidos. `VITE_API_URL` del frontend debe apuntar al
   backend con el prefijo `/api` (por defecto `http://localhost:3000/api`; el
   backend escucha en `PORT`, por defecto 3000, y monta todo bajo `/api`).
2. **Sembrar la base:** `cd backend && npx prisma db seed`. Borra y recrea los
   datos de prueba, así que **los ids (UUID) cambian en cada ejecución** y los
   tokens anteriores dejan de servir (hay que volver a iniciar sesión y a
   consultar los ids). Los casos que modifican datos lo indican; después de
   ellos, volver a sembrar.
3. **Backend:** `cd backend && npm run dev` en `http://localhost:3000`. En esa
   consola aparecen las líneas `[correo simulado] ...` (no hay
   `RESEND_API_KEY`/`EMAIL_FROM`).
4. **Frontend:** `cd frontend && npm run dev` en `http://localhost:5173`.
5. **Datos de prueba** (contraseña de todos: `Prueba1234`):

   | Usuario | Rol | Datos relevantes |
   | ------- | --- | ---------------- |
   | `admin@danzas.app` | admin | |
   | `instructor.aprobado@danzas.app` (Camila) | instructor | Salsa lunes 18:00-19:00 (cupo 13/15, $50.000) y Bachata miércoles 19:15-20:15 (12/12, $45.000), Barranquilla, presencial |
   | `instructor.independiente@danzas.app` (Julián) | instructor | Danza urbana martes 17:00-18:00 (19/20, $40.000), Medellín |
   | `instructor.pendiente@danzas.app` (Valentina) | instructor | Solicitud pendiente, sin clases |
   | `estudiante1@danzas.app` (Andrea Pérez) | estudiante | Inscripción confirmada en Salsa (pago aprobado) con una asistencia |
   | `estudiante2@danzas.app` (Santiago Mejía) | estudiante | Inscripción `pendiente_pago` en Danza urbana |
   | `padre@danzas.app` (Laura Sánchez) | padre | Menores Mateo e Isabella; Mateo inscrito (confirmada, pagada) en Salsa |

6. **Llamadas a la API** (ejemplos con `curl` en Git Bash; en Postman, Thunder
   Client o Bruno se usa el mismo método, URL, header y cuerpo):

   ```bash
   API=http://localhost:3000/api
   curl -s -X POST $API/auth/login -H "Content-Type: application/json" \
     -d '{"correo":"estudiante1@danzas.app","contraseña":"Prueba1234"}'
   # => { "token": "...", "user": { "id": "...", "rol": "estudiante", ... } }
   curl -s $API/classes/search            # público: ids de las clases
   curl -s $API/users/<ID_USUARIO>/enrollments -H "Authorization: Bearer <TOKEN>"
   ```

   Placeholders: `<TOKEN_ADMIN>`, `<TOKEN_CAMILA>`, `<TOKEN_JULIAN>`,
   `<TOKEN_E1>`, `<TOKEN_E2>`, `<TOKEN_PADRE>`; `<ID_SALSA>`, `<ID_BACHATA>`,
   `<ID_URBANA>` (de `GET /api/classes/search`); `<ID_E1>`, `<ID_E2>`,
   `<ID_PADRE>` (el `user.id` del login); `<ID_MATEO>`, `<ID_ISABELLA>` (de
   `GET /api/users/dependents` con el token del padre).
   `diaSemana`: 0 domingo, 1 lunes, 2 martes, 3 miércoles...
7. **Datos que hay que editar a mano.** Algunos casos necesitan un estado que
   el seed no trae (por ejemplo una clase con un solo cupo). Se hace con
   Prisma Studio (`cd backend && npx prisma studio`, `http://localhost:5555`):
   tablas `clase` (`cupo_disponible`), `horario`, `inscripcion`, `pago`.
8. **Formato de hora en el cuerpo de clases.** Las columnas son `TIME`
   (`@db.Time(0)`); el seed guarda `1970-01-01T18:00:00.000Z`. Para crear con
   éxito se envía ISO; para provocar un conflicto de horario se envía `"HH:MM"`
   (ver OBS-02 y OBS-07 de `casos-prueba-sprint1-2.md`).

---

## Regresión Sprint 2 (RF-006 a RF-010)

Archivos de referencia: ver los casos de origen en
`docs/qa/casos-prueba-sprint1-2.md`. Preparar las variables y los tokens como
indica ese documento; re-sembrar entre casos que modifican datos.

### CP-S23-001 — RF-006 — Regresión: admin aprueba y rechaza solicitudes de academia
- **RF:** RF-006 · **Prioridad:** Alta · **Ejecución:** API · **Modifica datos** · **Origen:** CP-S12-002 y CP-S12-003

**Dado** la solicitud pendiente de `instructor.pendiente@danzas.app` (obtenida con `GET /api/admin/academy-requests`) y un administrador autenticado
**Cuando** hace `POST /api/admin/academy-requests/<ID_SOLICITUD>/approve` (o, tras re-sembrar, `/reject`)
**Entonces** la solicitud queda `aprobada` (o `rechazada`) y el instructor es notificado por correo

**Resultado esperado**
- `200 { "request": { "estado": "aprobada" | "rechazada", "revisadoPor": "<id admin>", "revisadoEn": "<fecha>" } }`.
- Consola del backend: `[correo simulado] Para: instructor.pendiente@danzas.app | Asunto: Solicitud de academia aprobada` (o `... rechazada`).
- La solicitud deja de aparecer en `GET /api/admin/academy-requests`.

**Fuente:** `backend/src/services/academyRequest.service.js`, `backend/src/routes/academyRequests.routes.js`.

### CP-S23-002 — RF-006 — Regresión: una academia rechazada (o pendiente) no puede publicar clases
- **RF:** RF-006 · **Prioridad:** Alta · **Ejecución:** API · **Modifica datos** · **Origen:** CP-S12-004

**Dado** que la solicitud de `instructor.pendiente@danzas.app` fue rechazada (o sigue pendiente)
**Cuando** ese instructor hace `POST /api/classes` con un cuerpo válido (ver CP-S12-004)
**Entonces** según el ERS recibe un error 4xx y la clase no existe ni aparece en `GET /api/classes/search`

**Resultado esperado**
- `403 ACADEMY_NOT_APPROVED` y ninguna clase creada.
- **Estado conocido: OK, corregido en `fix/auth-clases-cuatro-bugs` (OBS-01).** `crearClase` consulta `solicitud_academia` y exige una solicitud aprobada. Antes respondía `201`.

**Fuente:** `backend/src/routes/classes.routes.js`, `backend/src/services/class.service.js` (`crearClase`).

### CP-S23-003 — RF-007 — Regresión: admin gestiona usuarios (listar, suspender, eliminar)
- **RF:** RF-007 · **Prioridad:** Alta · **Ejecución:** UI + API · **Modifica datos** · **Origen:** CP-S12-006 a CP-S12-010

**Dado** un administrador autenticado en `/admin/usuarios`
**Cuando** lista los usuarios, suspende a `estudiante2@danzas.app`, intenta eliminar a `estudiante1@danzas.app` (con inscripciones) y elimina a un usuario recién registrado sin datos asociados
**Entonces** el listado, la suspensión y la eliminación respetan las reglas del sistema

**Resultado esperado**
- Listado: "7 usuarios encontrados" con el seed; los filtros (buscador, rol, estado) recortan la lista en el navegador.
- Suspender: `200 { "message": "Usuario suspendido correctamente", "user": { "estado": "suspendido" } }`; la UI muestra la insignia "Suspendido".
- Eliminar con datos asociados: `409 USER_HAS_RELATED_DATA` "No se puede eliminar el usuario porque tiene información asociada. Suspéndelo en su lugar."
- Eliminar sin datos asociados: `204`; el usuario desaparece de la lista y `GET /api/admin/users/<id>` da `404 USER_NOT_FOUND`.
- Sobre la propia cuenta del admin, suspender o eliminar da `409 CANNOT_MODIFY_SELF`.
- Informativo (OBS-03, corregido en `fix/auth-clases-cuatro-bugs`): un usuario suspendido ya no puede iniciar sesión (`403 ACCOUNT_SUSPENDED`).

**Fuente:** `backend/src/services/user.service.js`, `frontend/src/screens/admin/Users/Users.jsx`, `frontend/src/screens/admin/Users/UserDetail.jsx`.

### CP-S23-004 — RF-007 — Regresión: control de acceso al panel de administración
- **RF:** RF-007 · **Prioridad:** Media · **Ejecución:** UI + API · **Origen:** CP-S12-005 y CP-S12-006

**Dado** un estudiante, un instructor o un visitante sin sesión
**Cuando** abre `/admin/usuarios` en el navegador o llama a `GET /api/admin/users`, `GET /api/admin/academy-requests`
**Entonces** el acceso se rechaza

**Resultado esperado**
- UI con sesión de estudiante: redirección a `/no-autorizado` ("No autorizado" / "No tenés permiso para ver esta sección."); sin sesión: redirección a `/login`.
- API con token de estudiante o instructor: `403 FORBIDDEN` "No tenés permiso para acceder a este recurso."; sin token: `401 UNAUTHORIZED` "Token no provisto o con formato inválido."; token vencido o alterado: `401 UNAUTHORIZED` "Token inválido o expirado.".

**Fuente:** `backend/src/middleware/auth.middleware.js`, `backend/src/middleware/roleGuard.middleware.js`, `frontend/src/routes/ProtectedRoute.jsx`.

### CP-S23-005 — RF-008 — Regresión: cruce de horario y espacio mínimo de 15 minutos
- **RF:** RF-008 · **Prioridad:** Alta · **Ejecución:** API · **Origen:** CP-S12-014, CP-S12-015 y CP-S12-016

**Dado** Camila con Salsa los lunes de 18:00 a 19:00 y Bachata los miércoles de 19:15 a 20:15
**Cuando** crea (`POST /api/classes`) una clase el lunes con `"horaInicio":"18:30","horaFin":"19:30"`, otra el lunes con `"19:10"-"20:10"`, y mueve la Bachata al lunes con `PUT /api/classes/<ID_BACHATA>` `{"diaSemana":1}`
**Entonces** las dos primeras se rechazan por cruce o por espacio menor a 15 minutos, y la tercera se acepta porque el espacio es exactamente 15 minutos

**Resultado esperado**
- Las dos primeras: `409 SCHEDULE_CONFLICT` "El horario se cruza con otra clase del instructor." y ninguna clase creada.
- Mover la Bachata al lunes (19:15-20:15): `200`, `horarios[0].diaSemana = 1`.
- Verificar en ejecución (OBS-02): repetir el solapamiento enviando las horas como ISO; el ERS exige `409`.

**Fuente:** `backend/src/services/schedule.service.js`, `backend/src/services/class.service.js`.

### CP-S23-006 — RF-009 — Regresión: edición y cancelación de clase por el instructor
- **RF:** RF-009 · **Prioridad:** Alta · **Ejecución:** API · **Modifica datos** · **Origen:** CP-S12-018 y CP-S12-019

**Dado** las clases de Camila y Julián
**Cuando** Camila edita su Salsa (`PUT` con `{"precio":55000}`), Julián intenta editarla, y luego Camila cancela su Bachata con `DELETE /api/classes/<ID_BACHATA>`
**Entonces** solo el dueño puede editar y cancelar, y la clase cancelada sale del buscador

**Resultado esperado**
- Camila edita: `200` con el nuevo `precio`. Julián edita: `403 FORBIDDEN` "No tenés permiso para modificar esta clase.".
- Cancelar: `200` con `estado: "cancelada"`, `inscripcionesCanceladas: 0`, `reembolsosProcesados: 0`; segunda cancelación `409 CLASS_ALREADY_CANCELLED`; Julián sobre la Salsa `403 FORBIDDEN` "No tenés permiso para cancelar esta clase.".
- Cancelar la Danza urbana (Julián) cancela la inscripción pendiente de estudiante2 y escribe `[correo simulado] Para: estudiante2@danzas.app | Asunto: Clase cancelada: Danza urbana`.

**Fuente:** `backend/src/services/class.service.js`, `backend/src/repositories/enrollment.repository.js`.

### CP-S23-007 — RF-010 — Regresión: instructor registra asistencia en su clase
- **RF:** RF-010 · **Prioridad:** Media · **Ejecución:** API · **Modifica datos** · **Origen:** CP-S12-020

**Dado** la Salsa de Camila con las inscripciones confirmadas de estudiante1 y de Mateo
**Cuando** Camila hace `POST /api/classes/<ID_SALSA>/attendance` con `{"fechaSesion":"2026-10-12","registros":[{"inscripcionId":"<ID_INSC_E1>","asistio":true},{"inscripcionId":"<ID_INSC_MATEO>","asistio":false}]}`
**Entonces** se guarda una asistencia por inscripción

**Resultado esperado**
- `201 { "count": 2 }`; `GET /api/users/<ID_E1>/enrollments` (token estudiante1) muestra 2 elementos en `asistencias` (el del seed y el nuevo).

**Fuente:** `backend/src/services/attendance.service.js`, `backend/src/repositories/attendance.repository.js`.

### CP-S23-008 — RF-010 — Regresión: asistencia en una clase que NO es del instructor
- **RF:** RF-010 · **Prioridad:** Alta · **Ejecución:** API · **Origen:** CP-S12-021

**Dado** la Salsa de Camila y el instructor Julián (que no es su dueño)
**Cuando** Julián hace `POST /api/classes/<ID_SALSA>/attendance` con un cuerpo válido
**Entonces** el sistema rechaza el registro y no guarda ninguna fila

**Resultado esperado**
- `403 FORBIDDEN` "No tenés permiso para registrar asistencia en esta clase."; las asistencias de estudiante1 siguen siendo 1.
- Con token de estudiante: `403 FORBIDDEN` "No tenés permiso para acceder a este recurso.".

**Fuente:** `backend/src/services/attendance.service.js`.

---

## RF-011 — Búsqueda y filtrado de clases

Archivos revisados: `backend/src/routes/classes.routes.js`,
`backend/src/controllers/class.controller.js` (`searchClasses`),
`backend/src/repositories/class.repository.js` (`searchClasses`),
`frontend/src/services/classes.service.js`,
`frontend/src/screens/public/ExploreClasses.jsx`.

### CP-S23-009 — RF-011 — Caso: búsqueda y filtrado exitosos por tipo de baile y ciudad
- **RF:** RF-011 · **Prioridad:** Alta · **Ejecución:** UI + API
- **Precondiciones / datos:** seed recién cargado; no hace falta iniciar sesión (ruta pública).

**Dado** un visitante en `http://localhost:5173/clases` con tres clases activas en el seed (Salsa y Bachata en Barranquilla, Danza urbana en Medellín)
**Cuando** selecciona "Tipo de baile: Salsa", luego cambia a "Ciudad: Barranquilla" (sin tipo), y también escribe "danza" en el buscador de texto
**Entonces** el listado se actualiza según el filtro, sin recargar la página

**Resultado esperado**
- Sin filtros: contador "3 clases" y tarjetas "Clase de Salsa", "Clase de Bachata" y "Clase de Danza urbana" con ciudad, precio ($50.000 / $45.000 / $40.000) y cupos ("13 disponibles", "12 disponibles", "19 disponibles") y el botón "Ver clase →".
- Tipo "Salsa": 1 clase. Ciudad "Barranquilla": 2 clases (Salsa y Bachata). Texto "danza" (busca en tipo y ciudad): 1 clase (Danza urbana). Botón "Limpiar" restablece los filtros.
- API: `GET /api/classes/search?ciudad=Barranquilla` responde `200` con un arreglo de 2 clases activas (campos de la clase; sin horarios ni datos del instructor). `GET /api/classes/search?tipoBaile=Salsa&ciudad=Barranquilla` devuelve 1.
- El filtro de "Tipo de baile" de la pantalla se aplica en el navegador (la pantalla envía `tipo`, que el backend ignora); el de ciudad sí se pide al backend. Al cambiar un filtro se vuelve a pedir el listado y la pantalla muestra un indicador de carga ("Cargando clases...") que reemplaza temporalmente el contenido (OBS-05).

**Fuente:** `backend/src/repositories/class.repository.js` (`searchClasses`), `frontend/src/screens/public/ExploreClasses.jsx`.

### CP-S23-010 — RF-011 — Caso: búsqueda sin resultados
- **RF:** RF-011 · **Prioridad:** Alta · **Ejecución:** UI + API
- **Precondiciones / datos:** seed recién cargado.

**Dado** un visitante en `/clases` y que no existe ninguna clase de Bachata en Medellín (Bachata solo se dicta en Barranquilla)
**Cuando** selecciona "Tipo de baile: Bachata" y "Ciudad: Medellín" (o llama `GET /api/classes/search?tipoBaile=Bachata&ciudad=Medell%C3%ADn`)
**Entonces** el sistema informa que no hay resultados en lugar de mostrar un error

**Resultado esperado**
- UI: contador "0 clases" y el bloque vacío con el título "No encontramos clases". En el código el componente `EmptyState` solo pinta `title`, `description`, `actionText` y `onAction`; la pantalla le pasa `message` y `action`, que se ignoran, así que el texto "Intenta cambiar los filtros o realizar otra búsqueda." y el botón "Limpiar filtros" del bloque vacío no se ven (OBS-05). El botón "Limpiar" de la barra de filtros sigue disponible y devuelve las 3 clases.
- API: `200` con `[]`; no es un error.
- No aparece el recuadro "No pudimos cargar las clases" (ese es solo para fallos de red o `5xx`).

**Fuente:** `frontend/src/screens/public/ExploreClasses.jsx`, `frontend/src/components/common/EmptyState/EmptyState.jsx`, `backend/src/controllers/class.controller.js` (`searchClasses`).

### CP-S23-011 — RF-011 — Caso: el buscador excluye clases canceladas y muestra los cupos
- **RF:** RF-011 · **Prioridad:** Media · **Ejecución:** UI + API · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado; con Prisma Studio poner `cupo_disponible = 0` en la clase Danza urbana.

**Dado** una clase con `cupoDisponible = 0` y otra que el instructor cancela (Bachata, `DELETE /api/classes/<ID_BACHATA>` con el token de Camila)
**Cuando** un visitante abre `/clases`
**Entonces** la clase sin cupos sigue apareciendo y la cancelada ya no

**Resultado esperado**
- Se listan Salsa y Danza urbana (Danza urbana con "0 disponibles"); la Bachata cancelada no aparece. La búsqueda solo filtra `estado = activa`, no por cupo.
- API: `GET /api/classes/search` devuelve 2 clases.

**Fuente:** `backend/src/repositories/class.repository.js` (`searchClasses` con `estado: "activa"`), `backend/src/services/class.service.js` (`cancelarClase`).

---

## RF-012 — Inscripción a clase

Archivos revisados: `backend/src/routes/enrollments.routes.js`,
`backend/src/controllers/enrollment.controller.js`,
`backend/src/services/enrollment.service.js` (`crearInscripcion`),
`backend/src/repositories/enrollment.repository.js` (`crearConDecrementoDeCupo`),
`frontend/src/services/enrollments.service.js`,
`frontend/src/screens/student/ClassDetailStudent.jsx`,
`frontend/src/screens/parent/ExploreClassesParent.jsx`.

> Nota de ejecución: `/estudiante/clases/:id` (`ClassDetailStudent.jsx`) y
> `/estudiante/clases/:id/inscribir` muestran datos fijos de ejemplo ("Salsa
> Básica", "$80.000", "Cupos disponibles: 8"), pero la inscripción que envían es
> real y usa el `id` de la URL. Para probar por UI hay que escribir la URL con el
> UUID real de la clase (`/estudiante/clases/<ID_BACHATA>`). La pantalla pública
> `/clases/:id` es una maqueta que no llama al backend (OBS-04).

### CP-S23-012 — RF-012 — Caso: el estudiante se inscribe en una clase
- **RF:** RF-012 · **Prioridad:** Alta · **Ejecución:** UI + API · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado; sesión de `estudiante1@danzas.app` (aún no inscrita en Bachata; Bachata tiene 12 de 12 cupos).

**Dado** un estudiante autenticado y una clase activa con cupos (Bachata)
**Cuando** abre `/estudiante/clases/<ID_BACHATA>`, pulsa "Inscribirme" y confirma "Confirmar inscripción" en el diálogo (o llama `POST /api/enrollments` con `{"class_id":"<ID_BACHATA>"}`)
**Entonces** se crea una inscripción `pendiente_pago`, se descuenta un cupo y se lo lleva al pago

**Resultado esperado**
- API: `201` con la inscripción: `estado: "pendiente_pago"`, `status: "pendiente_pago"`, `enrollmentId` = `id`, `menorId: null`, `usuarioId` del estudiante, `clase` (con `horarios`), `pago: null`.
- UI: tras confirmar se redirige a `/estudiante/inscripciones/<id>/pago` con el título "Confirmar inscripción", la tarjeta "Resumen de la inscripción" (Clase "Bachata", Precio "$45.000") y el botón "Confirmar pago (simulado)" (el pago se prueba en `casos-prueba-sprint4.md`).
- `/estudiante/inscripciones` muestra la tarjeta "Bachata" con estado "Pago pendiente", pago "Sin información", asistencia "Sin registros de asistencia" y el botón "Completar pago".
- `GET /api/classes/search?tipoBaile=Bachata` muestra `cupoDisponible: 11` (antes 12).

**Fuente:** `backend/src/services/enrollment.service.js` (`crearInscripcion`), `backend/src/repositories/enrollment.repository.js` (`crearConDecrementoDeCupo`), `frontend/src/screens/student/ClassDetailStudent.jsx`, `frontend/src/screens/student/PaymentCheckout.jsx`, `frontend/src/screens/student/MyEnrollments.jsx`.

### CP-S23-013 — RF-012 — Caso: inscripción en una clase sin cupos
- **RF:** RF-012 · **Prioridad:** Alta · **Ejecución:** UI + API · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado; con Prisma Studio poner `cupo_disponible = 1` en la clase Salsa (queda un único cupo). Tokens de `estudiante2@danzas.app` y del padre; `<ID_ISABELLA>` (Isabella aún no está inscrita en Salsa).

**Dado** la clase Salsa con un solo cupo disponible
**Cuando** estudiante2 se inscribe en Salsa (`POST /api/enrollments` `{"class_id":"<ID_SALSA>"}`, que toma el último cupo) y a continuación el padre intenta inscribir a Isabella (`{"class_id":"<ID_SALSA>","dependent_id":"<ID_ISABELLA>"}`)
**Entonces** la primera inscripción se acepta y la segunda se rechaza por falta de cupos, sin dejar el contador en negativo

**Resultado esperado**
- Primera: `201`, `estado: "pendiente_pago"`; `cupoDisponible` pasa a 0.
- Segunda: `409` con `error.code = "CLASS_FULL"` y mensaje "La clase no tiene cupos disponibles."; no se crea inscripción para Isabella (su historial queda vacío) y `cupoDisponible` sigue en 0.
- UI: con sesión de `estudiante1@danzas.app` (que ya está inscrita) abrir `/estudiante/clases/<ID_SALSA>` y pulsar "Inscribirme" > "Confirmar inscripción" muestra el mensaje de error "La clase no tiene cupos disponibles." (la validación de cupo se hace antes que la de duplicado). La pantalla sigue mostrando "Cupos disponibles: 8" de ejemplo y el botón habilitado porque sus datos son fijos (OBS-04).

**Fuente:** `backend/src/repositories/enrollment.repository.js` (`crearConDecrementoDeCupo`, `SIN_CUPO`), `backend/src/services/enrollment.service.js` (`ERRORES_DE_CREACION`), `frontend/src/screens/student/ClassDetailStudent.jsx`.

### CP-S23-014 — RF-012 — Caso: inscripción duplicada en la misma clase
- **RF:** RF-012 · **Prioridad:** Media · **Ejecución:** API
- **Precondiciones / datos:** seed recién cargado.

**Dado** `estudiante1@danzas.app` con una inscripción `confirmada` en Salsa, `estudiante2@danzas.app` con una `pendiente_pago` en Danza urbana, y Mateo inscrito en Salsa
**Cuando** estudiante1 vuelve a hacer `POST /api/enrollments` con `{"class_id":"<ID_SALSA>"}`, estudiante2 lo hace con `<ID_URBANA>` y el padre con `{"class_id":"<ID_SALSA>","dependent_id":"<ID_MATEO>"}`
**Entonces** el sistema rechaza las tres solicitudes sin descontar cupos

**Resultado esperado**
- `409` con `error.code = "ENROLLMENT_ALREADY_EXISTS"` y mensaje "Ya existe una inscripción activa en esta clase." en las tres.
- Los cupos no cambian. Una inscripción cancelada no cuenta como activa (se puede volver a inscribir tras cancelar). Isabella (otro menor del mismo padre) sí puede inscribirse en Salsa.

**Fuente:** `backend/src/repositories/enrollment.repository.js` (`ESTADOS_ACTIVOS`, `INSCRIPCION_DUPLICADA`).

### CP-S23-015 — RF-012 — Caso: el padre inscribe a su menor
- **RF:** RF-012 · **Prioridad:** Alta · **Ejecución:** API · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado; token de `padre@danzas.app`; `<ID_ISABELLA>` de `GET /api/users/dependents`.

**Dado** un padre autenticado con un menor registrado (Isabella) que no está inscrita en Bachata
**Cuando** hace `POST /api/enrollments` con `{"class_id":"<ID_BACHATA>","dependent_id":"<ID_ISABELLA>"}`
**Entonces** la inscripción queda a nombre del padre para ese menor, en `pendiente_pago`

**Resultado esperado**
- `201` con `estado: "pendiente_pago"`, `usuarioId` = id del padre, `menorId` = `<ID_ISABELLA>` y `menor.nombre = "Isabella Sánchez"`; `cupoDisponible` de Bachata baja en 1.
- `GET /api/users/<ID_ISABELLA>/enrollments` con el token del padre devuelve 1 inscripción.
- El cuerpo también acepta los nombres `claseId` y `menorId`.

**Fuente:** `backend/src/services/enrollment.service.js` (`crearInscripcion`, rama `padre`), `backend/src/controllers/enrollment.controller.js`.

### CP-S23-016 — RF-012 — Caso: un padre intenta inscribir a un menor que NO es suyo
- **RF:** RF-012 · **Prioridad:** Alta · **Ejecución:** API · **Modifica datos**
- **Precondiciones / datos:** el seed solo trae un padre, así que hay que crear un segundo con su propio menor: `POST /api/auth/register` `{"rol":"padre","nombre":"Otro Padre","correo":"otro.padre@danzas.app","contraseña":"Prueba1234","ciudad":"Cali"}` (`201`), login con ese usuario y `POST /api/users/dependents` `{"nombre":"Hijo Ajeno","fechaNacimiento":"2016-05-01"}` (`201`; anotar `dependent.id` = `<ID_AJENO>`). Token de `padre@danzas.app`.

**Dado** el menor "Hijo Ajeno" registrado por otro padre y a `padre@danzas.app` autenticado
**Cuando** `padre@danzas.app` hace `POST /api/enrollments` con `{"class_id":"<ID_BACHATA>","dependent_id":"<ID_AJENO>"}`
**Entonces** el sistema rechaza la inscripción y no crea nada

**Resultado esperado**
- `403` con `error.code = "FORBIDDEN"` y mensaje "El menor no pertenece a tu cuenta.".
- No se crea inscripción y el `cupoDisponible` de Bachata no cambia (12).
- Variante: `dependent_id` con un UUID que no existe: `404` con `error.code = "DEPENDENT_NOT_FOUND"` y mensaje "Menor no encontrado.".
- Re-sembrar al terminar (el seed también elimina el padre y el menor creados).

**Fuente:** `backend/src/services/enrollment.service.js` (`menor.padreId !== solicitante.id`), `backend/src/repositories/dependent.repository.js` (`findById`).

### CP-S23-017 — RF-012 — Caso: reglas por rol y por parámetros al inscribirse
- **RF:** RF-012 · **Prioridad:** Media · **Ejecución:** API
- **Precondiciones / datos:** seed recién cargado; tokens de estudiante1, padre, instructor (Camila) y admin.

**Dado** las reglas de quién puede inscribirse y con qué datos
**Cuando** se envían estas peticiones a `POST /api/enrollments`: (1) padre sin `dependent_id`; (2) estudiante con `dependent_id`; (3) cuerpo sin `class_id`; (4) `class_id` numérico (`101`); (5) `class_id` con un UUID inexistente; (6) `class_id` de una clase cancelada; (7) token de instructor o admin; (8) sin token
**Entonces** cada una se rechaza con su código

**Resultado esperado**
1. `400 VALIDATION_ERROR` "Un padre debe indicar el menor que desea inscribir."
2. `403 FORBIDDEN` "Solo un padre puede inscribir a un menor."
3. `400 VALIDATION_ERROR` "El identificador de la clase es obligatorio."
4. `400 VALIDATION_ERROR` "Los identificadores enviados no son válidos."
5. `404 CLASS_NOT_FOUND` "Clase no encontrada."
6. `409 CLASS_NOT_ACTIVE` "La clase no está disponible para inscripción." (cancelar antes la Bachata como Camila).
7. `403 FORBIDDEN` "No tenés permiso para acceder a este recurso."
8. `401 UNAUTHORIZED` "Token no provisto o con formato inválido."

**Fuente:** `backend/src/services/enrollment.service.js`, `backend/src/routes/enrollments.routes.js`, `backend/src/middleware/roleGuard.middleware.js`.

### CP-S23-018 — RF-012 — Caso: inscripción del menor desde la pantalla "Explorar clases" del padre
- **RF:** RF-012 · **Prioridad:** Media · **Ejecución:** UI
- **Precondiciones / datos:** seed recién cargado; sesión de `padre@danzas.app`.

**Dado** un padre en `/padre/clases` con Mateo e Isabella cargados en el selector "Seleccionar hijo/a"
**Cuando** pulsa "Inscribir hijo/a" sin elegir menor y luego lo hace eligiendo a Isabella
**Entonces** sin menor seleccionado se le pide elegir uno; con menor seleccionado el flujo debería llevarlo al pago

**Resultado esperado (comportamiento actual)**
- Sin menor: mensaje "Primero debes seleccionar cuál hijo/a quieres inscribir.".
- Con menor: la pantalla lista tres clases de ejemplo fijas ("Salsa Infantil", "Danza Urbana Kids", "Ballet Infantil", con ids numéricos 101 a 103 y ciudad "Guamal"), no las del backend. Al inscribir envía `class_id: 101` (número) y el backend responde `400 VALIDATION_ERROR` "Los identificadores enviados no son válidos.", que se muestra como error en pantalla. La inscripción del menor no se puede completar desde la UI.

**Estado conocido: DEFECTO de integración (OBS-04).** La inscripción de menores solo se prueba por API (CP-S23-015).

**Fuente:** `frontend/src/screens/parent/ExploreClassesParent.jsx` (`demoClasses`, `handleEnroll`), `backend/src/services/enrollment.service.js`.

---

## RF-014 — Historial de clases

Archivos revisados: `backend/src/routes/users.routes.js`,
`backend/src/services/enrollment.service.js` (`obtenerHistorial`),
`backend/src/repositories/enrollment.repository.js` (`findByUsuario`, `findByMenor`),
`frontend/src/screens/student/MyEnrollments.jsx`,
`frontend/src/screens/parent/MyEnrollmentsParent.jsx`,
`frontend/src/screens/admin/Users/UserHistory.jsx`.

### CP-S23-019 — RF-014 — Caso: el estudiante consulta su propio historial
- **RF:** RF-014 · **Prioridad:** Alta · **Ejecución:** UI + API
- **Precondiciones / datos:** seed recién cargado; sesiones de `estudiante1@danzas.app` y `estudiante2@danzas.app`. Para el estado vacío, un estudiante nuevo: `POST /api/auth/register` `{"rol":"estudiante","nombre":"Sin Clases","correo":"sinclases@danzas.app","contraseña":"Prueba1234","ciudad":"Cali"}`.

**Dado** un estudiante autenticado con inscripciones
**Cuando** entra a `/estudiante/inscripciones` (o llama `GET /api/users/<su id>/enrollments` con su token)
**Entonces** ve sus inscripciones con estado, pago y asistencia

**Resultado esperado**
- estudiante1: tarjeta "Salsa" con estado "Confirmada", "Fecha de inscripción" (fecha de hoy del seed), "Estado del pago: Pagado", "Asistencia: 1 de 1 sesiones" y el botón "Cancelar inscripción".
- estudiante2: tarjeta "Danza urbana", "Pago pendiente", pago "Sin información", "Sin registros de asistencia" y el botón "Completar pago".
- Estudiante sin inscripciones: título "No tienes inscripciones" y "Todavía no estás inscrito en ninguna clase de danza." con el botón "Explorar clases".
- API: `200` con un arreglo ordenado de la más reciente a la más antigua; cada elemento trae `estado`, `clase` (con `horarios`), `pago` (o `null`), `asistencias` y `menor` (o `null`). Las inscripciones canceladas siguen apareciendo con estado "Cancelada".
- Un padre que consulta su propio id ve todas las inscripciones que hizo, incluidas las de sus menores.

**Fuente:** `backend/src/services/enrollment.service.js` (`obtenerHistorial`), `backend/src/repositories/enrollment.repository.js` (`INCLUDE_DETALLE`, `findByUsuario`), `frontend/src/screens/student/MyEnrollments.jsx`.

### CP-S23-020 — RF-014 — Caso: el padre consulta el historial de su menor
- **RF:** RF-014 · **Prioridad:** Alta · **Ejecución:** API (la UI no es operable)
- **Precondiciones / datos:** seed recién cargado; token del padre; `<ID_MATEO>`.

**Dado** un padre autenticado y su menor Mateo, inscrito en Salsa (confirmada, pagada)
**Cuando** hace `GET /api/users/<ID_MATEO>/enrollments` con su token
**Entonces** recibe el historial del menor

**Resultado esperado**
- `200` con un elemento: Salsa, `estado: "confirmada"`, `pago.estado: "aprobado"`, `menor.nombre: "Mateo Sánchez"`.
- UI: `/padre/inscripciones` (pantalla "Inscripciones de mis hijos") lee la lista de menores de `user.menores` guardado en la sesión, y el login no devuelve ese campo; por eso muestra "No tienes menores registrados" aunque Mateo e Isabella existan, y su botón "Registrar menor" navega a una ruta inexistente (`/padre/dependientes`), que redirige al inicio.

**Estado conocido: OK en API, DEFECTO en UI (OBS-06).**

**Fuente:** `backend/src/services/enrollment.service.js` (rama del padre con `menor.padreId === solicitante.id`), `frontend/src/screens/parent/MyEnrollmentsParent.jsx`, `backend/src/controllers/auth.controller.js`.

### CP-S23-021 — RF-014 — Caso: un usuario intenta ver el historial de OTRO usuario
- **RF:** RF-014 · **Prioridad:** Alta · **Ejecución:** API
- **Precondiciones / datos:** seed recién cargado; tokens de estudiante1, estudiante2, padre y Camila; `<ID_E1>`, `<ID_MATEO>`.

**Dado** el historial de estudiante1 (`<ID_E1>`) y el de Mateo (`<ID_MATEO>`), que pertenece al padre
**Cuando** (1) estudiante2 hace `GET /api/users/<ID_E1>/enrollments`; (2) el padre hace `GET /api/users/<ID_E1>/enrollments`; (3) estudiante1 hace `GET /api/users/<ID_MATEO>/enrollments`; (4) Camila (instructor) hace `GET /api/users/<ID_E1>/enrollments`; (5) estudiante2 consulta un UUID inexistente; (6) la misma consulta sin token
**Entonces** el sistema rechaza todas y no expone datos ajenos

**Resultado esperado**
- (1) a (4): `403` con `error.code = "FORBIDDEN"` y mensaje "No tenés permiso para ver este historial.".
- (5): también `403` con el mismo mensaje (a un usuario que no es admin no se le revela si el id existe).
- (6): `401 UNAUTHORIZED`.
- Por UI no hay forma de pedir el historial de otro id: `/estudiante/inscripciones` usa siempre el `id` de la sesión, y `/admin/usuarios/<id>/historial` redirige a `/no-autorizado` si el rol no es admin.

**Fuente:** `backend/src/services/enrollment.service.js` (`obtenerHistorial`), `backend/src/routes/users.routes.js`, `frontend/src/routes/ProtectedRoute.jsx`.

### CP-S23-022 — RF-014 — Caso: el admin consulta el historial de cualquier usuario o menor
- **RF:** RF-014 · **Prioridad:** Media · **Ejecución:** UI + API
- **Precondiciones / datos:** seed recién cargado; token admin y sesión admin.

**Dado** un administrador autenticado
**Cuando** abre `/admin/usuarios/<ID_E1>/historial` (no hay un enlace a esta pantalla desde el detalle del usuario; se entra por URL) o llama `GET /api/users/<id>/enrollments` con ids de usuario, de menor e inexistente
**Entonces** ve los historiales permitidos y recibe `404` si el id no existe

**Resultado esperado**
- UI para estudiante1: título "Historial del usuario", "Consulta las inscripciones registradas de Andrea Pérez.", tarjetas Inscripciones 1, Confirmadas 1, Canceladas 0 y "Pagos aprobados" con el monto de la Salsa; el elemento "Inscripción a Salsa" con "Confirmada", ciudad y "1 asistencias". El filtro de estado ("Pendientes de pago", "Confirmadas", "Canceladas") recorta la lista.
- API: `GET /api/users/<ID_E1>/enrollments` y `GET /api/users/<ID_MATEO>/enrollments` responden `200`; con un UUID inexistente: `404 USER_NOT_FOUND` "Usuario no encontrado.".
- UI con el id de un menor: la pantalla muestra un error (`GET /api/admin/users/<ID_MATEO>` responde `404 USER_NOT_FOUND`), porque busca primero al usuario.

**Fuente:** `backend/src/services/enrollment.service.js` (`obtenerHistorial`, rama `admin`), `frontend/src/screens/admin/Users/UserHistory.jsx`.

---

## Observaciones (discrepancias ERS / código)

Las observaciones OBS-01 a OBS-12 de `casos-prueba-sprint1-2.md` siguen vigentes
para la regresión de Sprint 2 (OBS-01, OBS-05, OBS-06 y la parte de rutas de OBS-12 quedaron corregidas en `fix/auth-clases-cuatro-bugs`; antes: una academia rechazada o
pendiente sí podía publicar clases; un usuario suspendido podía iniciar sesión;
el formato de hora de las clases es incoherente entre la validación de cruce y
Prisma). Las siguientes son nuevas de Sprint 3 y usan numeración propia:

**OBS-01 (S2-3) — RF-006: ver OBS-01 de Sprint 1-2. CORREGIDA (corregido en `fix/auth-clases-cuatro-bugs`).** El caso CP-S23-002 fallaba porque `backend/src/services/class.service.js` nunca consultaba el estado de la solicitud de academia; ahora `crearClase` responde `403 ACADEMY_NOT_APPROVED`.

**OBS-02 (S2-3) — RF-008: ver OBS-07 de Sprint 1-2.** La regla de cruce y de 15 minutos (`schedule.service.js`) solo detecta conflictos con horas en formato `"HH:MM"`; con ISO calcula `NaN`. Verificar en ejecución en CP-S23-005.

**OBS-03 (S2-3) — RF-007: ver OBS-05 de Sprint 1-2. CORREGIDA (corregido en `fix/auth-clases-cuatro-bugs`).** Antes el usuario suspendido conservaba el acceso (`auth.service.js#login` no miraba `estado`); ahora el login responde `403 ACCOUNT_SUSPENDED`.

**OBS-04 (S2-3) — RF-012: las pantallas de clase del estudiante y del padre usan datos de ejemplo (Alta para la demo).**
`ClassDetail.jsx` (pública, `/clases/:id`) es una maqueta sin llamada al backend: siempre muestra "Salsa Básica" y su botón "Inscribirme" abre el aviso de inicio de sesión aunque el usuario ya haya iniciado sesión. `ClassDetailStudent.jsx` y `EnrollmentProcess.jsx` muestran datos fijos (nombre, precio $80.000, cupos 8) aunque inscriben de verdad con el id de la URL; no existe `GET /api/classes/:id` en el backend. `ExploreClassesParent.jsx` trabaja con `demoClasses` de ids numéricos (101 a 103), así que el backend rechaza la inscripción con `400 VALIDATION_ERROR`; además `DashboardStudent.jsx` y varios accesos rápidos (`/estudiante/clases`, `/estudiante/asistencia`, `/estudiante/pagos`) apuntan a datos de ejemplo o a rutas que no existen en `AppRouter.jsx` (caen en `/`). En la práctica solo se llega a la inscripción real escribiendo la URL con el UUID.

**OBS-05 (S2-3) — RF-011: detalles de la pantalla pública de búsqueda (Baja).**
(a) `ExploreClasses.jsx` pasa `message` y `action` al componente `EmptyState`, que solo usa `description`, `actionText` y `onAction`; el texto de ayuda del estado vacío y el botón "Limpiar filtros" no se muestran. (b) El ERS RF-011 reserva el filtro por modalidad para v2.0, pero la pantalla ofrece "Modalidad" (presencial/virtual) y filtra en el navegador. (c) `classes.service.js#searchClasses` manda `tipo` y el backend lee `tipoBaile`; el filtro por tipo funciona solo porque la pantalla filtra también en el navegador. (d) Cada cambio de filtro reemplaza toda la pantalla por el indicador de carga (`if (loading) return <Loading fullScreen />`), incluidos los filtros. El requisito "los resultados se actualizan sin recargar toda la página" se cumple (no hay recarga del navegador) aunque con ese parpadeo.

**OBS-06 (S2-3) — RF-014: el historial del padre no es operable desde la UI (Alta).**
`MyEnrollmentsParent.jsx` obtiene los menores de `user.menores`, un campo que `POST /api/auth/login` no devuelve (devuelve el usuario sin `passwordHash`, sin menores); siempre cae en "No tienes menores registrados". Debería leer `GET /api/users/dependents`, como hacen `Dependents.jsx` y `ExploreClassesParent.jsx`. La API (`GET /api/users/<id menor>/enrollments`) funciona.

**OBS-07 (S2-3) — Privacidad de menores: `GET /api/users/dependents/:id` no valida la propiedad (Alta, fuera del alcance de RF-006 a RF-014 pero relacionado con RF-012/RF-014).**
`backend/src/controllers/dependent.controller.js#getDependentById` y `dependent.service.js#obtenerMenorPorId` devuelven cualquier menor por id a cualquier usuario autenticado, sin comprobar que sea su padre (el ERS cita la Ley 1581 de 2012 sobre datos de menores). Los ids son UUID, lo que lo hace difícil de explotar pero no lo corrige. Caso sugerido para QA: con el token de estudiante1 hacer `GET /api/users/dependents/<ID_MATEO>`; el comportamiento actual es `200` con los datos del menor; lo esperado es `403`.

**OBS-08 (S2-3) — RF-012: la reserva de cupo no vence (Media).**
El ERS (CU-03) habla de "reservar temporalmente el cupo". El código descuenta el cupo al inscribirse y lo mantiene mientras la inscripción esté `pendiente_pago`, sin tiempo límite ni tarea que lo libere (`enrollment.repository.js#crearConDecrementoDeCupo`); una inscripción que nunca se paga retiene el cupo indefinidamente (como la de estudiante2 en el seed).

**OBS-09 (S2-3) — Registro: el alta desde la UI y los roles (informativo, ver OBS-06 de Sprint 1-2). CORREGIDA (corregido en `fix/auth-clases-cuatro-bugs`).**
Antes, para crear estudiantes o padres de prueba había que usar la API con `"rol":"estudiante"` / `"padre"` porque el formulario enviaba `student` / `parent`, valores que no existen en el enum de la base. Ahora el formulario envía `estudiante` / `padre`.
