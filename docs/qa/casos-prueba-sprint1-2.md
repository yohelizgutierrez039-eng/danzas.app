# Casos de prueba manuales — Sprint 1-2 (academias, usuarios y clases)

Casos de prueba en formato Dado/Cuando/Entonces para los requisitos funcionales
del módulo de academias y clases (RF-006 a RF-010). Igual que en
`casos-prueba-sprint1.md`, los resultados esperados salen del comportamiento
real de la implementación (backend en `backend/src` y pantallas en
`frontend/src/screens`), no de lo que debería hacer el sistema. Cuando el ERS
(`docs/ERS_DanzasApp_v1.2.docx`) y el código no coinciden, el caso lo dice en
"Estado conocido" y la discrepancia queda descrita en la sección
[Observaciones](#observaciones-discrepancias-ers--código) al final.

> Alcance de la revisión: análisis estático del código; no se ejecutó la
> aplicación para escribir este documento. Los casos marcados como
> "verificar en ejecución" dependen de un comportamiento que solo se confirma
> corriendo el backend.

## Índice de casos

| ID | RF | Caso | Prioridad | Cómo se ejecuta | Estado conocido |
| -- | -- | ---- | --------- | --------------- | --------------- |
| CP-S12-001 | RF-006 | Admin lista las solicitudes de academia pendientes | Alta | API | OK |
| CP-S12-002 | RF-006 | Admin aprueba una solicitud (notifica al instructor) | Alta | API | OK |
| CP-S12-003 | RF-006 | Admin rechaza una solicitud (notifica al instructor) | Alta | API | OK |
| CP-S12-004 | RF-006 | Una academia RECHAZADA (o pendiente) no puede publicar clases (caso límite a) | Alta | API | OK (OBS-01 corregido en `fix/auth-clases-cuatro-bugs`) |
| CP-S12-005 | RF-006 | Solo el admin puede aprobar o rechazar solicitudes | Alta | API | OK |
| CP-S12-006 | RF-007 | Admin lista y filtra usuarios; los demás roles no entran | Media | UI + API | OK |
| CP-S12-007 | RF-007 | Admin suspende un usuario (caso límite b) | Alta | UI + API | OK |
| CP-S12-008 | RF-007 | Admin elimina un usuario sin información asociada (caso límite b) | Alta | UI + API | OK |
| CP-S12-009 | RF-007 | Admin no puede eliminar un usuario con información asociada (caso límite b) | Alta | UI + API | OK |
| CP-S12-010 | RF-007 | Admin no puede suspender ni eliminar su propia cuenta (caso límite b) | Media | API | OK |
| CP-S12-011 | RF-007 | Un usuario suspendido intenta iniciar sesión | Media | API | OK (OBS-05 corregido en `fix/auth-clases-cuatro-bugs`) |
| CP-S12-012 | RF-007 | Admin edita un usuario (validaciones) | Baja | UI + API | OK |
| CP-S12-013 | RF-008 | Instructor aprobado crea una clase | Alta | API | OK (verificar formato de hora, OBS-07) |
| CP-S12-014 | RF-008 | Horario que se cruza con otra clase del instructor (caso límite c) | Alta | API | OK / verificar OBS-07 |
| CP-S12-015 | RF-008 | Menos de 15 minutos entre clases (caso límite c) | Alta | API | OK |
| CP-S12-016 | RF-008 / RF-009 | Exactamente 15 minutos entre clases sí se permite (caso límite c) | Alta | API | OK |
| CP-S12-017 | RF-008 | Validaciones de campos obligatorios y de rol al crear clase | Media | API | DEFECTO (OBS-08) |
| CP-S12-018 | RF-009 | Instructor edita una clase (cruce, propiedad, inexistente) | Alta | API | OK |
| CP-S12-019 | RF-009 | Instructor cancela una clase y se avisa a los inscritos | Alta | API | OK |
| CP-S12-020 | RF-010 | Instructor registra asistencia en su clase | Media | API | OK |
| CP-S12-021 | RF-010 | Instructor registra asistencia en una clase que NO es suya (caso límite d) | Alta | API | OK |
| CP-S12-022 | RF-010 | Asistencia: inscripciones ajenas a la clase y cuerpo inválido | Baja | API | DEFECTO leve (OBS-11) |

Los casos que el pedido original de QA marcó como obligatorios están
etiquetados como "caso límite" (a) clase de academia rechazada, (b) admin
suspende y elimina usuarios, (c) cruce de horario y espacio mínimo de 15
minutos, (d) asistencia en clase ajena.

## Cómo preparar el entorno

1. **Variables de entorno.** El backend lee `backend/.env` y el frontend
   `frontend/.env` (cada carpeta tiene su `.env.example`; los `.env` no se
   versionan). Hace falta una base MySQL accesible y `JWT_SECRET`,
   `JWT_EXPIRES_IN` y `DATABASE_URL` definidos. `VITE_API_URL` del frontend debe
   apuntar al backend incluyendo el prefijo `/api` (por defecto
   `http://localhost:3000/api`, porque el backend monta todas las rutas bajo
   `/api` y escucha en `PORT`, por defecto 3000).
2. **Sembrar la base** (desde la raíz del repo):
   `cd backend && npx prisma db seed`. El seed borra y vuelve a crear todos los
   datos de prueba, por lo que **todos los ids (UUID) cambian en cada ejecución**
   y los tokens anteriores dejan de servir: después de re-sembrar hay que volver
   a iniciar sesión y volver a consultar los ids.
3. **Backend:** `cd backend && npm run dev` (nodemon, `src/server.js`) en
   `http://localhost:3000`. Es la consola donde aparecen las líneas
   `[correo simulado] ...`.
4. **Frontend:** `cd frontend && npm run dev` (Vite) en `http://localhost:5173`.
5. **Datos de prueba** (todos con contraseña `Prueba1234`):

   | Usuario | Rol | Datos relevantes |
   | ------- | --- | ---------------- |
   | `admin@danzas.app` | admin | Bogotá |
   | `instructor.aprobado@danzas.app` (Camila Rodríguez) | instructor | Academia "Academia Ritmo Caribe" aprobada. Clases: Salsa lunes 18:00-19:00 (cupo 13/15, $50.000) y Bachata miércoles 19:15-20:15 (12/12, $45.000), Barranquilla |
   | `instructor.independiente@danzas.app` (Julián Torres) | instructor | Independiente aprobado. Clase Danza urbana martes 17:00-18:00 (19/20, $40.000), Medellín |
   | `instructor.pendiente@danzas.app` (Valentina Gómez) | instructor | Solicitud "Academia Nuevos Pasos" en estado `pendiente`, sin clases |
   | `estudiante1@danzas.app` (Andrea Pérez) | estudiante | Inscripción `confirmada` en Salsa, pago aprobado y una asistencia |
   | `estudiante2@danzas.app` (Santiago Mejía) | estudiante | Inscripción `pendiente_pago` en Danza urbana |
   | `padre@danzas.app` (Laura Sánchez) | padre | Menores Mateo e Isabella Sánchez; Mateo inscrito (confirmada, pagada) en Salsa |

   `diaSemana` usa 0 = domingo, 1 = lunes, 2 = martes, 3 = miércoles, etc. (el
   seed y `backend/src/utils/classSchedule.util.js` usan esa convención).
6. **Cómo hacer las llamadas a la API.** Los ejemplos usan `curl` (Git Bash);
   en Postman, Thunder Client o Bruno se usa el mismo método, URL, header
   `Authorization: Bearer <TOKEN>` y cuerpo JSON.

   ```bash
   API=http://localhost:3000/api
   # Login: devuelve { "token": "...", "user": { "id": "...", ... } }
   curl -s -X POST $API/auth/login -H "Content-Type: application/json" \
     -d '{"correo":"admin@danzas.app","contraseña":"Prueba1234"}'
   # Llamada autenticada
   curl -s $API/admin/users -H "Authorization: Bearer <TOKEN_ADMIN>"
   ```

   Placeholders usados abajo: `<TOKEN_ADMIN>`, `<TOKEN_CAMILA>` (instructor
   aprobado), `<TOKEN_JULIAN>` (independiente), `<TOKEN_VALENTINA>`
   (pendiente), `<TOKEN_E1>`, `<TOKEN_E2>`, `<TOKEN_PADRE>`; `<ID_SALSA>`,
   `<ID_BACHATA>`, `<ID_URBANA>` se obtienen con
   `GET $API/classes/search` (público, devuelve `id` y `tipoBaile`);
   `<ID_E1>`, `<ID_E2>`, etc. salen del `user.id` del login o de
   `GET $API/admin/users`; los ids de inscripción salen de
   `GET $API/users/<id del usuario>/enrollments` con el token de ese usuario.
7. **Formato de las horas en el cuerpo (importante).** Las horas se guardan en
   columnas `TIME` (`@db.Time(0)`) y el seed las crea como
   `1970-01-01T18:00:00.000Z` (hora de pared, sin zona). No hay documentación
   de la API; el código usa dos formatos incompatibles (ver OBS-07). Convención
   de este documento: para **crear con éxito** se envía ISO
   (`"1970-01-01T10:00:00.000Z"`); para **provocar un conflicto de horario** se
   envía `"HH:MM"` (`"18:30"`), que es lo que entiende la validación de cruce.
8. **Después de cada caso que cambie datos, volver a sembrar** (paso 2). Cada
   caso indica si modifica datos.

---

## RF-006 — Aprobación de academias

Archivos revisados: `backend/src/routes/academyRequests.routes.js`,
`backend/src/services/academyRequest.service.js`,
`backend/src/repositories/academyRequest.repository.js`,
`backend/src/services/class.service.js`, `backend/src/routes/classes.routes.js`.

> Nota de ejecución: las pantallas de administración de academias
> (`/admin/academias`, `/admin/academias/:id/revisar`) esperan un contrato
> distinto al del backend (ver OBS-04). Por eso estos casos se ejecutan contra
> la API.

### CP-S12-001 — RF-006 — Caso: Admin lista las solicitudes pendientes
- **RF:** RF-006 · **Prioridad:** Alta · **Ejecución:** API
- **Precondiciones / datos:** seed recién cargado; token de `admin@danzas.app`.

**Dado** un administrador autenticado y un seed con una solicitud pendiente (Valentina Gómez, "Academia Nuevos Pasos") y dos aprobadas
**Cuando** hace `GET /api/admin/academy-requests` con su token
**Entonces** recibe solo las solicitudes en estado `pendiente`

**Resultado esperado**
- `200` con `{ "requests": [ ... ] }`.
- `requests` contiene 1 elemento: `nombreAcademia: "Academia Nuevos Pasos"`, `estado: "pendiente"`, `revisadoPor: null`, `revisadoEn: null`, `instructorId` igual al id de `instructor.pendiente@danzas.app`. Anotar su `id` (`<ID_SOLICITUD>`).
- Las dos solicitudes aprobadas del seed no aparecen.

**Fuente:** `backend/src/services/academyRequest.service.js` (`listarPendientes`), `backend/src/repositories/academyRequest.repository.js` (`findPending`), `backend/src/routes/academyRequests.routes.js`.

### CP-S12-002 — RF-006 — Caso: Admin aprueba una solicitud y el instructor es notificado
- **RF:** RF-006 (y RF-017) · **Prioridad:** Alta · **Ejecución:** API · **Modifica datos**
- **Precondiciones / datos:** `<ID_SOLICITUD>` de CP-S12-001; consola del backend visible; `RESEND_API_KEY`/`EMAIL_FROM` sin definir.

**Dado** una solicitud pendiente de `instructor.pendiente@danzas.app` y un administrador autenticado
**Cuando** hace `POST /api/admin/academy-requests/<ID_SOLICITUD>/approve` con su token
**Entonces** la solicitud queda `aprobada` con el admin y la fecha de revisión, y el instructor recibe la notificación de aprobación

**Resultado esperado**
- `200` con `{ "request": { "id": "<ID_SOLICITUD>", "estado": "aprobada", "revisadoPor": "<id del admin>", "revisadoEn": "<fecha actual>" , ... } }`.
- En la consola del backend aparece: `[correo simulado] Para: instructor.pendiente@danzas.app | Asunto: Solicitud de academia aprobada (RESEND_API_KEY o EMAIL_FROM sin configurar)`. El cuerpo del correo (visible solo con un proveedor real) dice que la solicitud para "Academia Nuevos Pasos" fue aprobada y que ya puede publicar clases.
- `GET /api/admin/academy-requests` ya no devuelve esa solicitud (`requests: []`).

**Fuente:** `backend/src/services/academyRequest.service.js` (`aprobar`, `notificarSolicitante`), `backend/src/utils/emailTemplates.js` (`solicitudAcademiaResuelta`), `backend/src/services/email.service.js`.

### CP-S12-003 — RF-006 — Caso: Admin rechaza una solicitud y el instructor es notificado
- **RF:** RF-006 (y RF-017) · **Prioridad:** Alta · **Ejecución:** API · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado (solicitud pendiente de Valentina).

**Dado** una solicitud pendiente de `instructor.pendiente@danzas.app` y un administrador autenticado
**Cuando** hace `POST /api/admin/academy-requests/<ID_SOLICITUD>/reject`
**Entonces** la solicitud queda `rechazada` y el instructor recibe la notificación de rechazo

**Resultado esperado**
- `200` con `{ "request": { "estado": "rechazada", "revisadoPor": "<id del admin>", "revisadoEn": "<fecha>" , ... } }`.
- Consola: `[correo simulado] Para: instructor.pendiente@danzas.app | Asunto: Solicitud de academia rechazada (RESEND_API_KEY o EMAIL_FROM sin configurar)`.
- La solicitud desaparece del listado de pendientes.
- El usuario `instructor.pendiente@danzas.app` conserva su rol y su estado (`pendiente`); el rechazo no modifica la cuenta (OBS-02).

**Fuente:** `backend/src/services/academyRequest.service.js` (`rechazar`), `backend/src/utils/emailTemplates.js`.

### CP-S12-004 — RF-006 — Caso límite (a): una academia rechazada (o aún pendiente) no puede publicar clases
- **RF:** RF-006 / RF-008 · **Prioridad:** Alta · **Ejecución:** API · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado. Variante A: rechazar primero la solicitud de Valentina (CP-S12-003). Variante B: dejarla pendiente (seed sin tocar). Token de `instructor.pendiente@danzas.app` (`<TOKEN_VALENTINA>`). Control: `instructor.aprobado@danzas.app` sí puede publicar (CP-S12-013).

**Dado** que el instructor `instructor.pendiente@danzas.app` tiene su solicitud de academia rechazada (variante A) o todavía sin resolver (variante B)
**Cuando** hace `POST /api/classes` con un cuerpo válido:
```json
{
  "tipoBaile": "Merengue", "ciudad": "Cali", "modalidad": "presencial",
  "cupoMaximo": 10, "precio": 30000, "diaSemana": 4,
  "horaInicio": "1970-01-01T10:00:00.000Z", "horaFin": "1970-01-01T11:00:00.000Z"
}
```
**Entonces** según el ERS el sistema rechaza la publicación y la clase no existe ni aparece en el buscador

**Resultado esperado (según ERS RF-006)**
- `403 ACADEMY_NOT_APPROVED` ("Tu solicitud de academia fue rechazada." / "... sigue pendiente de aprobación." + "No puedes publicar clases hasta que el administrador la apruebe.") y ninguna clase creada.
- `GET /api/classes/search?tipoBaile=Merengue` devuelve `[]`.

**Estado conocido: OK, corregido en `fix/auth-clases-cuatro-bugs` (OBS-01).** `crearClase` ahora exige al menos una solicitud `aprobada` del instructor; con solicitud rechazada, pendiente o inexistente responde `403 ACADEMY_NOT_APPROVED`. Antes respondía `201`.

**Fuente:** `backend/src/services/class.service.js` (`crearClase`, `exigirAcademiaAprobada`), `backend/src/repositories/academyRequest.repository.js` (`findByInstructor`); criterio en ERS RF-006 y RF-008.

### CP-S12-005 — RF-006 — Caso: solo el admin puede aprobar o rechazar solicitudes
- **RF:** RF-006 · **Prioridad:** Alta · **Ejecución:** API
- **Precondiciones / datos:** seed recién cargado; tokens de `instructor.aprobado@danzas.app` y `estudiante1@danzas.app`.

**Dado** un usuario autenticado cuyo rol no es `admin` (o una petición sin token)
**Cuando** intenta `POST /api/admin/academy-requests/<ID_SOLICITUD>/approve`, `.../reject` o `GET /api/admin/academy-requests`
**Entonces** el backend rechaza la petición y la solicitud no cambia de estado

**Resultado esperado**
- Con token de instructor o estudiante: `403` con `error.code = "FORBIDDEN"` y mensaje "No tenés permiso para acceder a este recurso.".
- Sin header `Authorization`: `401` con `error.code = "UNAUTHORIZED"` y mensaje "Token no provisto o con formato inválido.".
- La solicitud sigue `pendiente` (verificable con el token admin).

**Fuente:** `backend/src/middleware/roleGuard.middleware.js`, `backend/src/middleware/auth.middleware.js`, `backend/src/routes/academyRequests.routes.js`.

---

## RF-007 — Gestión de usuarios

Archivos revisados: `backend/src/routes/adminUsers.routes.js`,
`backend/src/services/user.service.js`,
`backend/src/repositories/user.repository.js`,
`frontend/src/screens/admin/Users/Users.jsx`, `UserDetail.jsx`, `UserForm.jsx`,
`frontend/src/routes/AppRouter.jsx`.

### CP-S12-006 — RF-007 — Caso: Admin lista y filtra usuarios; los demás roles no acceden
- **RF:** RF-007 · **Prioridad:** Media · **Ejecución:** UI + API
- **Precondiciones / datos:** seed recién cargado.

**Dado** un administrador que inicia sesión en `http://localhost:5173/login` con `admin@danzas.app`
**Cuando** entra a `/admin/usuarios` y usa el buscador y los filtros de rol y estado
**Entonces** ve los 7 usuarios del seed con sus tarjetas resumen y los filtros recortan la lista; un usuario que no es admin no puede entrar a esa pantalla

**Resultado esperado**
- UI: título "Usuarios", texto "7 usuarios encontrados", tarjetas: Total usuarios 7, Usuarios activos 6, Instructores 3, Estudiantes 2. Los filtros se aplican en el navegador (sin nueva petición): buscar "bogot" deja 3 usuarios (admin, estudiante1, padre); estado "Pendiente" deja 1 (Valentina Gómez); un filtro sin coincidencias muestra el vacío "No se encontraron usuarios". El botón "Limpiar" restablece la lista.
- API: `GET /api/admin/users` con token admin devuelve `200 { "users": [ { id, nombre, correo, rol, ciudad, estado, creadoEn } ] }` ordenado por `creadoEn` descendente, sin `passwordHash` ni contadores de login.
- Acceso: con `estudiante1@danzas.app` abrir `/admin/usuarios` redirige a `/no-autorizado` ("No autorizado" / "No tenés permiso para ver esta sección."); sin sesión redirige a `/login`. Por API, el token de estudiante da `403 FORBIDDEN` y sin token `401 UNAUTHORIZED`.

**Fuente:** `backend/src/services/user.service.js` (`listarUsuarios`), `backend/src/repositories/user.repository.js` (`selectPublico`), `frontend/src/screens/admin/Users/Users.jsx`, `frontend/src/routes/ProtectedRoute.jsx`.

### CP-S12-007 — RF-007 — Caso límite (b): Admin suspende un usuario
- **RF:** RF-007 · **Prioridad:** Alta · **Ejecución:** UI + API · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado; objetivo: `estudiante2@danzas.app` (Santiago Mejía).

**Dado** un administrador autenticado y el usuario Santiago Mejía en estado `activo`
**Cuando** abre `/admin/usuarios`, pulsa "Ver detalles" en su fila, pulsa "Suspender usuario" y confirma "Sí, suspender" (o llama `PATCH /api/admin/users/<ID_E2>/suspend`)
**Entonces** la cuenta queda en estado `suspendido`

**Resultado esperado**
- UI: diálogo "Suspender usuario" con el texto "¿Estás seguro de que deseas suspender la cuenta de Santiago Mejía?"; al confirmar, la insignia de estado pasa a "Suspendido" y el botón "Suspender usuario" desaparece.
- API: `200 { "message": "Usuario suspendido correctamente", "user": { ..., "estado": "suspendido" } }`.
- En `/admin/usuarios` el filtro de estado "Suspendido" lo muestra. Los datos de inscripciones/pagos del usuario no se tocan.
- Suspender un usuario ya suspendido vuelve a responder `200` (la operación es idempotente).

**Fuente:** `backend/src/services/user.service.js` (`suspenderUsuario`), `backend/src/controllers/user.controller.js` (`suspendUser`), `frontend/src/screens/admin/Users/UserDetail.jsx`.

### CP-S12-008 — RF-007 — Caso límite (b): Admin elimina un usuario sin información asociada
- **RF:** RF-007 · **Prioridad:** Alta · **Ejecución:** UI + API · **Modifica datos**
- **Precondiciones / datos:** crear un usuario "descartable" sin datos asociados. Opción UI: `/registro` con Rol "Instructor", Nombre "Usuario Borrable", correo `borrable@danzas.app`, contraseña `Prueba1234`, Ciudad "Cali" (el rol Instructor es el único del formulario cuyo valor coincide con el backend, ver OBS-06). Opción API: `POST /api/auth/register` con `{"rol":"estudiante","nombre":"Usuario Borrable","correo":"borrable@danzas.app","contraseña":"Prueba1234","ciudad":"Cali"}`.

**Dado** un usuario recién registrado, sin clases, inscripciones, menores ni solicitudes, y un administrador autenticado
**Cuando** el admin entra al detalle de ese usuario, pulsa "Eliminar usuario" y confirma "Sí, eliminar" (o llama `DELETE /api/admin/users/<ID_BORRABLE>`)
**Entonces** el usuario se elimina definitivamente

**Resultado esperado**
- El registro responde `201` y redirige a `/login` con "Registro exitoso. Ahora puedes iniciar sesión."; el usuario aparece en `/admin/usuarios` con estado "Pendiente" (el estado por defecto del alta).
- Diálogo: "¿Estás seguro de que deseas eliminar la cuenta de Usuario Borrable? Esta acción no se puede deshacer."
- API: `204` sin cuerpo; la UI vuelve a `/admin/usuarios` y el usuario ya no está en la lista.
- `GET /api/admin/users/<ID_BORRABLE>` responde `404` con `error.code = "USER_NOT_FOUND"` y mensaje "Usuario no encontrado.".

**Fuente:** `backend/src/services/user.service.js` (`eliminarUsuario`), `backend/src/controllers/user.controller.js` (`deleteUser`), `frontend/src/screens/admin/Users/UserDetail.jsx`, `frontend/src/screens/auth/Register.jsx`.

### CP-S12-009 — RF-007 — Caso límite (b): Admin no puede eliminar un usuario con información asociada
- **RF:** RF-007 · **Prioridad:** Alta · **Ejecución:** UI + API
- **Precondiciones / datos:** seed recién cargado; objetivos con datos asociados: `estudiante1@danzas.app` (inscripciones), `padre@danzas.app` (menores e inscripciones), `instructor.aprobado@danzas.app` (clases y solicitud).

**Dado** un administrador autenticado y un usuario que tiene inscripciones, menores, clases o solicitudes
**Cuando** intenta eliminarlo desde el detalle ("Eliminar usuario" y "Sí, eliminar") o con `DELETE /api/admin/users/<ID_E1>`
**Entonces** el sistema impide la eliminación y sugiere suspender

**Resultado esperado**
- API: `409` con `error.code = "USER_HAS_RELATED_DATA"` y mensaje "No se puede eliminar el usuario porque tiene información asociada. Suspéndelo en su lugar.".
- UI: el mensaje aparece en un recuadro de error de la pantalla de detalle y el usuario sigue en la lista.
- Un id inexistente (UUID válido que no está en la base) responde `404 USER_NOT_FOUND` "Usuario no encontrado." tanto en `DELETE` como en `PATCH .../suspend` y `GET`.

**Fuente:** `backend/src/services/user.service.js` (`eliminarUsuario`, manejo de `P2003` y `P2025`), `frontend/src/screens/admin/Users/UserDetail.jsx`.

### CP-S12-010 — RF-007 — Caso límite (b): el admin no puede suspender ni eliminar su propia cuenta
- **RF:** RF-007 · **Prioridad:** Media · **Ejecución:** API
- **Precondiciones / datos:** token admin e `<ID_ADMIN>` (`user.id` del login).

**Dado** un administrador autenticado
**Cuando** llama `PATCH /api/admin/users/<ID_ADMIN>/suspend`, `DELETE /api/admin/users/<ID_ADMIN>` o `PUT /api/admin/users/<ID_ADMIN>` con `{"estado":"suspendido"}`
**Entonces** el sistema rechaza las tres operaciones sobre su propia cuenta

**Resultado esperado**
- `409` con `error.code = "CANNOT_MODIFY_SELF"` y los mensajes, respectivamente: "No puedes suspender tu propia cuenta.", "No puedes eliminar tu propia cuenta." y "No puedes cambiar el estado de tu propia cuenta.".
- La cuenta del admin sigue `activa`.

**Fuente:** `backend/src/services/user.service.js` (`suspenderUsuario`, `eliminarUsuario`, `actualizarUsuario`).

### CP-S12-011 — RF-007 — Caso: un usuario suspendido intenta iniciar sesión
- **RF:** RF-007 · **Prioridad:** Media · **Ejecución:** API · **Modifica datos**
- **Precondiciones / datos:** `estudiante2@danzas.app` suspendido (CP-S12-007).

**Dado** una cuenta en estado `suspendido`
**Cuando** su titular hace `POST /api/auth/login` con sus credenciales correctas (y luego usa el token para `GET /api/users/<ID_E2>/enrollments`)
**Entonces** el login se bloquea con `403 ACCOUNT_SUSPENDED` y no se emite token

**Resultado esperado (comportamiento actual del código)**
- `403 ACCOUNT_SUSPENDED` "Tu cuenta está suspendida. Contacta al administrador." y sin token. La comprobación va después de validar la contraseña: con contraseña incorrecta se responde el `401 INVALID_CREDENTIALS` normal y el contador de intentos fallidos sigue igual. Los usuarios `pendiente` (p. ej. `instructor.pendiente@danzas.app`) sí pueden iniciar sesión.
- El ERS solo dice que el administrador puede "suspender" cuentas (RF-007) y no define el efecto; se tomó la decisión de bloquear el login. Un JWT emitido antes de la suspensión sigue siendo válido hasta que expire (`auth.middleware.js` solo verifica el token).

**Estado conocido: OK, corregido en `fix/auth-clases-cuatro-bugs` (OBS-05).**

**Fuente:** `backend/src/services/auth.service.js` (`login`, rama `estado === "suspendido"`), `backend/src/middleware/auth.middleware.js` (solo verifica el JWT).

### CP-S12-012 — RF-007 — Caso: Admin edita un usuario (reglas de validación)
- **RF:** RF-007 · **Prioridad:** Baja · **Ejecución:** UI + API · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado; objetivo `estudiante2@danzas.app`.

**Dado** un administrador autenticado en `/admin/usuarios/<ID_E2>/editar`
**Cuando** modifica nombre, ciudad o estado y guarda, o envía por API cuerpos inválidos a `PUT /api/admin/users/<ID_E2>`
**Entonces** los cambios válidos se guardan y los inválidos se rechazan con un código específico

**Resultado esperado**
- `{"nombre":"Santiago M. Mejía","ciudad":"Cartagena"}`: `200 { "message": "Usuario actualizado correctamente", "user": {...} }`. En la UI el selector "Rol" está deshabilitado y "Guardar cambios" vuelve al detalle.
- `{"rol":"admin"}`: `400 ROLE_CHANGE_NOT_ALLOWED` "No se permite cambiar el rol de un usuario."
- `{"correo":"estudiante1@danzas.app"}`: `409 EMAIL_ALREADY_REGISTERED` "El correo ya está registrado."
- `{"correo":"abc"}`: `400 INVALID_EMAIL_FORMAT` "El formato del correo no es válido."
- `{"estado":"bloqueado"}`: `400 INVALID_STATE` "El estado debe ser uno de: pendiente, activo, suspendido."
- `{"passwordHash":"x"}`: `400 INVALID_FIELDS` "Campos no permitidos: passwordHash."; `{}`: `400 EMPTY_BODY` "No se enviaron campos para actualizar."; `{"nombre":""}`: `400 INVALID_NAME`.

**Fuente:** `backend/src/services/user.service.js` (`validarDatosEdicion`, `actualizarUsuario`), `frontend/src/screens/admin/Users/UserForm.jsx`.

---

## RF-008 — Creación de clase

Archivos revisados: `backend/src/routes/classes.routes.js`,
`backend/src/services/class.service.js`,
`backend/src/services/schedule.service.js`,
`backend/src/repositories/class.repository.js`.

> Nota de ejecución: las pantallas del instructor (`/instructor/clases/nueva`)
> envían un cuerpo con otros nombres de campo (`name`, `dance_type`, `capacity`,
> `schedule` como texto) y dependen de endpoints inexistentes (OBS-09). Estos
> casos se ejecutan contra la API.

### CP-S12-013 — RF-008 — Caso: Instructor aprobado crea una clase
- **RF:** RF-008 · **Prioridad:** Alta · **Ejecución:** API · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado; token de `instructor.aprobado@danzas.app`. Camila ya tiene lunes 18:00-19:00 y miércoles 19:15-20:15, así que el martes 10:00-11:00 está libre.

**Dado** un instructor con academia aprobada y un horario libre
**Cuando** hace `POST /api/classes` con:
```json
{
  "tipoBaile": "Merengue", "ciudad": "Barranquilla", "modalidad": "presencial",
  "cupoMaximo": 10, "precio": 30000, "diaSemana": 2,
  "horaInicio": "1970-01-01T10:00:00.000Z", "horaFin": "1970-01-01T11:00:00.000Z"
}
```
**Entonces** la clase se crea y queda publicada en el buscador de inmediato

**Resultado esperado**
- `201` con la clase: `estado: "activa"`, `cupoMaximo: 10`, `cupoDisponible: 10`, `instructorId` igual al de Camila, `horarios` con un elemento (`diaSemana: 2`, `horaInicio`, `horaFin`). El `precio` llega como texto (Prisma serializa `Decimal` así).
- `GET /api/classes/search?tipoBaile=Merengue&ciudad=Barranquilla` (sin token) incluye la clase nueva.
- Si el servidor responde `500` con este cuerpo, el formato de hora del cuerpo no es el que acepta Prisma: anotarlo en OBS-07 (verificar en ejecución).

**Fuente:** `backend/src/services/class.service.js` (`crearClase`), `backend/src/repositories/class.repository.js` (`create`, `searchClasses`).

### CP-S12-014 — RF-008 — Caso límite (c): horario que se cruza con otra clase del mismo instructor
- **RF:** RF-008 · **Prioridad:** Alta · **Ejecución:** API
- **Precondiciones / datos:** seed recién cargado. Camila: Salsa lunes 18:00-19:00. Julián: Danza urbana martes 17:00-18:00.

**Dado** un instructor con una clase activa el lunes de 18:00 a 19:00
**Cuando** intenta crear otra clase el mismo día con un horario que se solapa, por ejemplo `POST /api/classes` con el cuerpo de CP-S12-013 cambiando `"diaSemana": 1`, `"horaInicio": "18:30"`, `"horaFin": "19:30"`
**Entonces** el sistema rechaza la creación indicando el conflicto de horario

**Resultado esperado**
- Variante A (solapamiento parcial `18:30-19:30`), variante B (mismo horario exacto `18:00`-`19:00`) y variante C (contenido dentro `18:15`-`18:45`): `409` con `error.code = "SCHEDULE_CONFLICT"` y mensaje "El horario se cruza con otra clase del instructor.". No se crea ninguna clase.
- Variante D (instructor independiente): con el token de Julián, `diaSemana: 2`, `"17:30"`-`"18:30"` también da `409 SCHEDULE_CONFLICT`: la regla aplica a todas las clases del instructor, tenga o no academia afiliada.
- Variante E (control): otro día (`diaSemana: 2`) o otro instructor con la misma franja no genera conflicto (ver CP-S12-013).
- Variante F (verificar en ejecución, OBS-07): repetir A enviando las horas como ISO (`"1970-01-01T18:30:00.000Z"`). El ERS exige `409`; por el análisis del código el cruce no se detecta y la clase se crearía (si ocurre, es un defecto; borrar la clase creada re-sembrando).
- Una clase ya cancelada deja de bloquear el horario: la validación solo compara contra clases `activa`.

**Fuente:** `backend/src/services/schedule.service.js` (`seSuperponen`, `hayConflictoDeHorario`), `backend/src/services/class.service.js` (`crearClase`).

### CP-S12-015 — RF-008 — Caso límite (c): menos de 15 minutos entre clases
- **RF:** RF-008 · **Prioridad:** Alta · **Ejecución:** API
- **Precondiciones / datos:** seed recién cargado; Camila con Salsa lunes 18:00-19:00.

**Dado** una clase del instructor que termina a las 19:00
**Cuando** intenta crear otra el mismo día que empieza menos de 15 minutos después de terminar la anterior, o que termina menos de 15 minutos antes de que empiece la siguiente
**Entonces** el sistema la rechaza por no respetar el espacio mínimo

**Resultado esperado** (`POST /api/classes` con token de Camila, `diaSemana: 1`):
- `"horaInicio": "19:10"`, `"horaFin": "20:10"` (5 minutos después de la Salsa): `409 SCHEDULE_CONFLICT`.
- `"horaInicio": "19:14"`, `"horaFin": "20:14"` (1 minuto menos del mínimo): `409 SCHEDULE_CONFLICT`.
- `"horaInicio": "16:50"`, `"horaFin": "17:50"` (termina 10 minutos antes de la Salsa): `409 SCHEDULE_CONFLICT`.
- Mensaje en los tres casos: "El horario se cruza con otra clase del instructor.". No se crea ninguna clase.

**Fuente:** `backend/src/services/schedule.service.js` (`MARGEN_MINUTOS = 15`, `seSuperponen`).

### CP-S12-016 — RF-008 / RF-009 — Caso límite (c): exactamente 15 minutos entre clases sí se permite
- **RF:** RF-008 y RF-009 · **Prioridad:** Alta · **Ejecución:** API · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado. Se usa la edición (PUT) enviando solo `diaSemana` para no depender del formato de hora (OBS-07): Bachata (miércoles 19:15-20:15) se mueve al lunes, quedando 15 minutos exactos después de la Salsa (18:00-19:00).

**Dado** una clase que termina a las 19:00 y otra clase del mismo instructor que empieza a las 19:15
**Cuando** Camila hace `PUT /api/classes/<ID_BACHATA>` con `{"diaSemana": 1}`
**Entonces** el sistema acepta el cambio porque el espacio es exactamente el mínimo de 15 minutos

**Resultado esperado**
- `200` con la clase Bachata y `horarios[0].diaSemana = 1` (19:15-20:15 se mantienen).
- Control del límite: con `{"diaSemana":1,"horaInicio":"19:14","horaFin":"20:14"}` el mismo PUT responde `409 SCHEDULE_CONFLICT` (un minuto menos del mínimo; ver CP-S12-015).
- Re-sembrar para restaurar el miércoles.

**Fuente:** `backend/src/services/schedule.service.js` (regla `inicioNuevo < finExistente + 15`), `backend/src/services/class.service.js` (`editarClase`), `backend/prisma/seed.js` (comentario sobre el espacio de 15 minutos).

### CP-S12-017 — RF-008 — Caso: validaciones de campos obligatorios y de rol al crear una clase
- **RF:** RF-008 · **Prioridad:** Media · **Ejecución:** API
- **Precondiciones / datos:** seed recién cargado; tokens de Camila y `estudiante1@danzas.app`.

**Dado** el criterio del ERS "todos los campos obligatorios deben completarse antes de publicar" y que solo los instructores crean clases
**Cuando** Camila hace `POST /api/classes` con cuerpo `{}` o sin `precio`/`cupoMaximo`/`ciudad`, y un estudiante hace `POST /api/classes` con un cuerpo válido
**Entonces** el estudiante es rechazado por rol y la creación incompleta debería rechazarse con un error de validación

**Resultado esperado**
- Estudiante: `403 FORBIDDEN` "No tenés permiso para acceder a este recurso."; sin token `401 UNAUTHORIZED`.
- Cuerpo incompleto, según ERS: error `400` de validación con los campos faltantes.
- **Estado conocido: DEFECTO (OBS-08).** El código no valida el cuerpo: Prisma lanza un error y el manejador responde `500` con `error.code = "INTERNAL_ERROR"` y el mensaje genérico "Ocurrió un error inesperado". Tampoco bloquea `"modalidad": "virtual"` (el ERS limita v1.0 a presencial) ni precios o cupos negativos.
- La pantalla "Nueva clase" sí valida en el navegador (mensajes como "El nombre de la clase es obligatorio." o "La cantidad de cupos debe ser mayor que 0."), pero no está conectada al backend (OBS-09).

**Fuente:** `backend/src/services/class.service.js` (`crearClase` sin validación), `backend/src/middleware/errorHandler.js`, `backend/src/middleware/roleGuard.middleware.js`, `frontend/src/screens/instructor/ClassForm.jsx`.

---

## RF-009 — Edición y cancelación de clase

Archivos revisados: `backend/src/services/class.service.js`,
`backend/src/repositories/class.repository.js`,
`backend/src/repositories/enrollment.repository.js`,
`backend/src/utils/emailTemplates.js`.

### CP-S12-018 — RF-009 — Caso: Instructor edita una clase (cruce de horario, propiedad e inexistente)
- **RF:** RF-009 (reglas de RF-008) · **Prioridad:** Alta · **Ejecución:** API · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado; tokens de Camila y de Julián.

**Dado** una clase propia y las reglas de cruce y espacio mínimo del RF-008
**Cuando** el instructor edita la clase con `PUT /api/classes/<id>` en distintos escenarios
**Entonces** solo el dueño puede editar y los cambios de horario se validan contra sus otras clases

**Resultado esperado**
- Camila `PUT /api/classes/<ID_SALSA>` con `{"precio": 55000}`: `200`, `precio` actualizado. La clase no choca consigo misma (se excluye de la validación).
- Camila `PUT /api/classes/<ID_BACHATA>` con `{"diaSemana":1,"horaInicio":"18:30","horaFin":"19:30"}`: `409 SCHEDULE_CONFLICT` "El horario se cruza con otra clase del instructor."; la Bachata queda en miércoles.
- Julián (no es dueño) `PUT /api/classes/<ID_SALSA>`: `403 FORBIDDEN` "No tenés permiso para modificar esta clase."; la Salsa no cambia.
- `PUT /api/classes/00000000-0000-0000-0000-000000000000` con un campo cualquiera: `404 CLASS_NOT_FOUND` "Clase no encontrada.".
- Estudiante: `403 FORBIDDEN` (rol); sin token `401`.

**Fuente:** `backend/src/services/class.service.js` (`editarClase`), `backend/src/services/schedule.service.js`, `backend/src/repositories/class.repository.js` (`update`).

### CP-S12-019 — RF-009 — Caso: Instructor cancela una clase y se avisa a los inscritos
- **RF:** RF-009 (y RF-017) · **Prioridad:** Alta · **Ejecución:** API · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado. Parte A: Bachata de Camila (sin inscritos). Parte B: Danza urbana de Julián (estudiante2 con inscripción `pendiente_pago`, sin pago). El caso de clase con pagos confirmados y reembolsos está en `casos-prueba-sprint4.md` (CP-S4-005).

**Dado** una clase activa del instructor, con o sin inscritos
**Cuando** el dueño hace `DELETE /api/classes/<id>`
**Entonces** la clase pasa a `cancelada`, las inscripciones activas se cancelan y los inscritos son avisados por correo

**Resultado esperado**
- Parte A (Camila, Bachata): `200` con la clase (`estado: "cancelada"`) y `inscripcionesCanceladas: 0`, `reembolsosProcesados: 0`. `GET /api/classes/search?tipoBaile=Bachata` ya no la devuelve.
- Parte B (Julián, Danza urbana): `200` con `inscripcionesCanceladas: 1`, `reembolsosProcesados: 0` (la inscripción no tenía pago aprobado). La inscripción de estudiante2 queda `cancelada` (`canceladoPor: instructor`). Consola: `[correo simulado] Para: estudiante2@danzas.app | Asunto: Clase cancelada: Danza urbana (...)`; el cuerpo explica que no había un pago aprobado, por lo que no corresponde reembolso.
- Repetir el `DELETE` sobre la misma clase: `409 CLASS_ALREADY_CANCELLED` "La clase ya está cancelada.".
- Otro instructor (Julián sobre la Salsa): `403 FORBIDDEN` "No tenés permiso para cancelar esta clase."; id inexistente: `404 CLASS_NOT_FOUND`.

**Fuente:** `backend/src/services/class.service.js` (`cancelarClase`, `notificarClaseCancelada`), `backend/src/repositories/enrollment.repository.js` (`findActivasPorClase`, `cancelarPorClaseDeInstructor`), `backend/src/utils/emailTemplates.js` (`claseCanceladaPorInstructor`).

---

## RF-010 — Gestión de asistencia

Archivos revisados: `backend/src/routes/classes.routes.js`,
`backend/src/services/attendance.service.js`,
`backend/src/repositories/attendance.repository.js`,
`frontend/src/screens/instructor/ClassDetailInstructor.jsx`.

> Nota de ejecución: la pantalla de detalle de clase del instructor guarda la
> asistencia solo en el navegador (comentario "TODO: falta backend RF-010" y
> el aviso "Asistencia guardada localmente...") y `Attendance.jsx` está vacío.
> El endpoint existe y se prueba por API (OBS-09, OBS-11).

### CP-S12-020 — RF-010 — Caso: Instructor registra asistencia en su clase
- **RF:** RF-010 · **Prioridad:** Media · **Ejecución:** API · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado. Obtener `<ID_INSC_E1>` (inscripción de estudiante1 en Salsa) con `GET /api/users/<ID_E1>/enrollments` y el token de estudiante1, y `<ID_INSC_MATEO>` con `GET /api/users/<ID_MATEO>/enrollments` y el token del padre (`<ID_MATEO>` sale de `GET /api/users/dependents`).

**Dado** la clase Salsa de Camila con dos inscripciones confirmadas (estudiante1 y Mateo)
**Cuando** Camila hace `POST /api/classes/<ID_SALSA>/attendance` con
```json
{ "fechaSesion": "2026-10-12",
  "registros": [
    { "inscripcionId": "<ID_INSC_E1>", "asistio": true },
    { "inscripcionId": "<ID_INSC_MATEO>", "asistio": false }
  ] }
```
**Entonces** se guarda un registro de asistencia por inscripción para esa sesión

**Resultado esperado**
- `201` con `{ "count": 2 }`.
- `GET /api/users/<ID_E1>/enrollments` (token estudiante1) muestra en `asistencias` dos registros: el del seed y el nuevo (`asistio: true`, `fechaSesion` 2026-10-12). Mateo tiene un registro con `asistio: false`.

**Fuente:** `backend/src/services/attendance.service.js` (`registrarAsistencia`), `backend/src/repositories/attendance.repository.js` (`registrarVarias`).

### CP-S12-021 — RF-010 — Caso límite (d): instructor registra asistencia en una clase que NO es suya
- **RF:** RF-010 · **Prioridad:** Alta · **Ejecución:** API
- **Precondiciones / datos:** seed recién cargado; `<ID_INSC_E1>` como en CP-S12-020; token de `instructor.independiente@danzas.app` (Julián, que no es dueño de la Salsa).

**Dado** la clase Salsa, que pertenece a Camila, y un instructor distinto (Julián)
**Cuando** Julián hace `POST /api/classes/<ID_SALSA>/attendance` con un cuerpo válido (`fechaSesion` e inscripciones de la Salsa)
**Entonces** el sistema rechaza el registro y no guarda ninguna asistencia

**Resultado esperado**
- `403` con `error.code = "FORBIDDEN"` y mensaje "No tenés permiso para registrar asistencia en esta clase.".
- `GET /api/users/<ID_E1>/enrollments` (token estudiante1) sigue mostrando una sola asistencia (la del seed): no se creó ninguna fila.
- Variantes: token de estudiante: `403 FORBIDDEN` "No tenés permiso para acceder a este recurso." (lo corta el guardián de rol); id de clase inexistente: `404 CLASS_NOT_FOUND` "Clase no encontrada."; sin token: `401 UNAUTHORIZED`.

**Fuente:** `backend/src/services/attendance.service.js` (`clase.instructorId !== instructorId`), `backend/src/routes/classes.routes.js`.

### CP-S12-022 — RF-010 — Caso: inscripciones ajenas a la clase y cuerpo inválido
- **RF:** RF-010 · **Prioridad:** Baja · **Ejecución:** API · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado; token de Camila; `<ID_INSC_E1>` (inscripción en Salsa).

**Dado** una clase propia (Bachata, sin inscritos) y una inscripción que pertenece a otra clase (Salsa)
**Cuando** Camila hace `POST /api/classes/<ID_BACHATA>/attendance` con `{"fechaSesion":"2026-10-12","registros":[{"inscripcionId":"<ID_INSC_E1>","asistio":true}]}`, y luego otra vez sin la propiedad `registros`
**Entonces** el sistema ignora la inscripción que no es de la clase y falla ante el cuerpo inválido

**Resultado esperado (comportamiento actual)**
- Primera llamada: `201 { "count": 0 }`; no se crea ninguna asistencia y no se informa que la inscripción fue descartada.
- Segunda llamada (sin `registros`): `500` con `INTERNAL_ERROR` ("Ocurrió un error inesperado") en lugar de un `400` de validación.
- Registrar dos veces la misma sesión para la misma inscripción crea filas duplicadas (no hay restricción de unicidad).

**Estado conocido: DEFECTO leve (OBS-11).**

**Fuente:** `backend/src/repositories/attendance.repository.js` (`registrarVarias`), `backend/src/services/attendance.service.js`, `backend/prisma/schema.prisma` (modelo `Asistencia`).

---

## Observaciones (discrepancias ERS / código)

**OBS-01 — RF-006: una academia rechazada o pendiente SÍ puede publicar clases (Alta). CORREGIDA: corregido en `fix/auth-clases-cuatro-bugs`.** `crearClase` responde `403 ACADEMY_NOT_APPROVED` si el instructor no tiene una solicitud aprobada (la edición y el registro de asistencia no cambian a propósito). Descripción original:
El ERS RF-006 exige que "una academia rechazada no puede publicar clases" y que un instructor "no puede publicar clases ni operar en la plataforma hasta ser verificada y aprobada". El código solo valida el rol: `backend/src/routes/classes.routes.js` (`requireRole("instructor")`) y `backend/src/services/class.service.js` (`crearClase`) nunca leen la tabla `solicitud_academia`. Afecta CP-S12-004. Tampoco se valida al editar ni al registrar asistencia.

**OBS-02 — RF-006: aprobar/rechazar no valida el estado actual ni actualiza la cuenta (Media).**
`backend/src/services/academyRequest.service.js` actualiza la solicitud sin comprobar que esté `pendiente`: una solicitud rechazada puede aprobarse después (y viceversa), repitiendo el correo. Además no cambia `usuario.estado` (Valentina sigue `pendiente` tras ser aprobada).

**OBS-03 — RF-006: aprobar/rechazar un id inexistente responde 500 (Baja).**
`academyRequestRepository.updateEstado` lanza el error `P2025` de Prisma; `errorHandler.js` lo convierte en `500` con `error.code = "P2025"` y el mensaje genérico. Debería ser `404`.

**OBS-04 — RF-006: las pantallas de administración de academias no coinciden con el backend (Alta para la demo).**
`GET /api/admin/academy-requests` devuelve `{ requests: [filas de solicitud con id, instructorId, nombreAcademia, estado, ...] }`, pero `frontend/src/hooks/useAcademies.js` guarda ese objeto como si fuera un arreglo y `frontend/src/screens/admin/academies/AcademiesAdmin.jsx` espera campos que no existen (`academyName`, `instructorName`, `city`, `danceTypes`, ...); la lista fallaría al renderizar. `AcademyReview.jsx` y `frontend/src/services/academies.service.js` llaman a `GET /admin/academy-requests/:id` y `GET /admin/academies/:id`, rutas que el backend no define. Hasta alinear el contrato, aprobar y rechazar solo se puede probar por API. Verificar en ejecución.

**OBS-05 — RF-007: un usuario suspendido puede iniciar sesión y operar (Media, por confirmar). CORREGIDA (login): corregido en `fix/auth-clases-cuatro-bugs`.** El login responde `403 ACCOUNT_SUSPENDED`; los tokens ya emitidos siguen válidos hasta expirar. Descripción original:
`auth.service.js#login` no consulta `usuario.estado` y `auth.middleware.js` solo verifica el JWT. El ERS no define el efecto de "suspender"; se recomienda bloquear el login y los tokens existentes.

**OBS-06 — RF-007 / registro: el alta no valida el rol y el formulario envía valores que no coinciden con el enum (Alta). CORREGIDA: corregido en `fix/auth-clases-cuatro-bugs`.** `registrar` solo acepta `estudiante`, `padre` e `instructor` (`400 INVALID_ROLE` para `admin` y cualquier otro valor) y `Register.jsx` envía `estudiante` / `padre`. Descripción original:
`auth.service.js#registrar` pasa `rol` a Prisma sin validarlo: la API acepta `"rol": "admin"` y crearía un administrador sin autorización alguna. Además `frontend/src/screens/auth/Register.jsx` envía `student` y `parent`, pero el enum de la base es `estudiante` / `padre`, por lo que registrarse como estudiante o padre desde el formulario fallaría en Prisma (verificar en ejecución); solo `instructor` coincide. Por eso estos casos crean usuarios de prueba como instructor por UI o con el rol correcto por API.

**OBS-07 — RF-008 / RF-009: formatos de hora incompatibles entre la validación de cruce y Prisma (Alta, verificar en ejecución).**
`schedule.service.js#aMinutos` interpreta las horas como `"HH:MM"` (separa por `:`) o como `Date`. Prisma exige un `DateTime` ISO o `Date` para las columnas `@db.Time(0)`. Como el cuerpo JSON solo trae textos, con `"HH:MM"` el cruce se detecta pero el alta sin conflicto probablemente falle en Prisma (`500`), y con ISO el alta funciona pero `aMinutos` calcula `NaN` y nunca detecta cruces. Si se confirma, la regla de cruce y de 15 minutos no funciona en el flujo normal de creación. Los casos CP-S12-013 a CP-S12-016 están diseñados para aislar este problema.

**OBS-08 — RF-008: no hay validación de campos obligatorios, modalidad ni rangos (Media).**
`class.service.js#crearClase` no valida nada: cuerpo incompleto da `500 INTERNAL_ERROR`; acepta `modalidad: "virtual"` (el ERS limita v1.0 a presencial; el enum `Modalidad` del schema y los filtros del frontend también incluyen virtual) y valores negativos de precio o cupo.

**OBS-09 — RF-008 / RF-009 / RF-010: las pantallas del instructor no están conectadas al backend (Alta para la demo).**
`ClassForm.jsx` envía `name`, `dance_type`, `city`, `capacity`, `schedule` (texto libre), etc., mientras el backend espera `tipoBaile`, `ciudad`, `modalidad`, `cupoMaximo`, `precio`, `diaSemana`, `horaInicio`, `horaFin`. `classes.service.js` llama a `GET /classes/my-classes` y `GET /classes/:id`, que no existen en `classes.routes.js` (solo hay `GET /search`, `POST /`, `PUT /:id`, `DELETE /:id` y `POST /:id/attendance`). `Attendance.jsx` está vacío y el registro de asistencia de `ClassDetailInstructor.jsx` es local. Además `classes.service.js` filtra con el parámetro `tipo` y el backend espera `tipoBaile` (el filtro por tipo de la pantalla pública se aplica entonces en el navegador, ver sprint 2-3).

**OBS-10 — RF-009: la edición permite cambios inconsistentes (Media).**
`class.service.js#editarClase` / `class.repository.js#update` aceptan `estado` (se puede reactivar una clase cancelada o marcarla `finalizada`) y modifican `cupoMaximo` sin recalcular `cupoDisponible`. No comprueba que la clase esté cancelada.

**OBS-11 — RF-010: el registro de asistencia es permisivo (Baja).**
`attendance.service.js` / `attendance.repository.js`: no valida `registros` ni `fechaSesion` (500 si faltan), descarta en silencio las inscripciones que no son de la clase (`201 { count: 0 }`), no exige inscripción confirmada, no restringe a clases activas y permite duplicados por sesión.

**OBS-12 — Sprint 1 (informativo): `casos-prueba-sprint1.md` está desactualizado.**
(a) (CORREGIDO, corregido en `fix/auth-clases-cuatro-bugs`: `auth.routes.js` ya monta `POST /forgot-password` y `POST /reset-password`, y el frontend envía `{ correo }` como espera el controller.) Antes `auth.routes.js` solo montaba `POST /register` y `POST /login`; las rutas de recuperación de contraseña que llama `frontend/src/services/auth.service.js` (`/auth/forgot-password`, `/auth/reset-password`) no existían en el backend. (b) `dependent.service.js` ya usa `AppError` y responde `403` con código `FORBIDDEN_NOT_PARENT`; la nota del documento de Sprint 1 que describe un `500` ya no aplica. Conviene revisar esos casos de Sprint 1 antes del regreso.
