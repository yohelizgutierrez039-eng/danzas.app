# Casos de prueba manuales — Sprint 5 (reportes, asistencia e integración de clases)

Casos de prueba en formato Dado/Cuando/Entonces para la creación y edición de
clases desde la interfaz del instructor (RF-008), la gestión de asistencia
(RF-010), el detalle público y la búsqueda de clases conectados al backend
(RF-011), el reporte de pagos para administrador e instructor (RF-015) y el
reporte de asistencia para padres (RF-016). Igual que en
`casos-prueba-sprint4.md`, los resultados esperados salen del comportamiento
real del código (`backend/src` y `frontend/src`) y de los mensajes que
definen los servicios y las pantallas, no del ERS. Las diferencias con el ERS
(`docs/ERS_DanzasApp_v1.2.docx`, módulos "Gestión de clases", "Búsqueda e
inscripción" y "Reportes") se marcan en "Estado conocido" y se describen en
[Observaciones](#observaciones-discrepancias-ers--código).

> **Alcance y trazabilidad de la verificación.** Los casos se escribieron por
> lectura del código de las cuatro ramas de funcionalidad del sprint, que
> deben estar integradas en el entorno de prueba: `feat/backend-clases-asistencia`,
> `feat/backend-reportes`, `feat/frontend-clases-asistencia` y
> `feat/frontend-reportes` (PRs #58 a #61 en GitHub). El autor de los cambios
> ejecutó el 2026-10-18 una parte de los escenarios contra una base real (API
> y navegador), y ese mismo día la revisión de este documento verificó por API
> el cruce de horario, los tres estados de la solicitud de academia, las
> validaciones de creación de clases, los códigos 500 de las observaciones
> OBS-09 y OBS-13 y el rechazo del token de recuperación; en el índice figuran
> como **Verificado en ejecución**. Todo lo demás proviene de lectura estática
> del código (y de las pruebas unitarias de `backend/tests`) y está marcado como
> "por verificar en ejecución". **No se verificaron en ejecución:** el cruce de
> horario `409 SCHEDULE_CONFLICT` y `403 ACADEMY_NOT_APPROVED` a través de la
> interfaz (sí por API), la auditoría de los enlaces del menú lateral en un
> navegador y la vista en pantallas móviles (este documento no cubre diseño
> responsive). El script de backfill de solicitudes sí se verificó en ejecución.

## Índice de casos

| ID | RF | Caso | Prioridad | Cómo se ejecuta | Estado conocido |
| -- | -- | ---- | --------- | --------------- | --------------- |
| CP-S5-001 | RF-008 | Un instructor aprobado crea una clase desde el formulario `/instructor/clases/nueva` | Alta | UI + API | Verificado en ejecución |
| CP-S5-002 | RF-008 | Las horas se muestran tal como se ingresaron (18:00 sigue siendo 18:00) en todas las pantallas | Alta | UI + API | Verificado en ejecución (Mis clases); resto por verificar (pantallas de admin con datos de ejemplo, OBS-03) |
| CP-S5-003 | RF-008 | Horario que se cruza o queda a menos de 15 minutos de otra clase: `409 SCHEDULE_CONFLICT` | Alta | UI + API | API verificada en ejecución (tabla completa); UI no verificada en ejecución |
| CP-S5-004 | RF-008 | Instructor con solicitud de academia no aprobada: `403 ACADEMY_NOT_APPROVED` | Alta | UI + API | API verificada en ejecución (los 3 estados y la aprobación); UI por verificar |
| CP-S5-005 | RF-008 | Validaciones del formulario y de la API al crear una clase; solo el instructor puede crear | Media | UI + API | API verificada en ejecución (OBS-11 y OBS-13); validaciones del formulario por lectura |
| CP-S5-006 | RF-008 | `GET /api/classes/my-classes`: solo instructor, solo sus clases, con horarios | Alta | API + UI | Verificado en ejecución (OBS-01) |
| CP-S5-007 | RF-008 / RF-009 | Editar el cupo máximo: `INVALID_CAPACITY` si baja de los inscritos y `cupoDisponible` recalculado | Alta | API + UI | API verificada en ejecución; UI por lectura |
| CP-S5-008 | RF-010 | (5a) El instructor toma asistencia en `/instructor/clases/:id` y al recargar ve los valores guardados | Alta | UI | Verificado en ejecución (OBS-09) |
| CP-S5-009 | RF-010 | (5b) Guardar dos veces la misma fecha no duplica filas (idempotente) y deja los últimos valores | Alta | API | Verificado en ejecución |
| CP-S5-010 | RF-010 | Listado de alumnos de la sesión (solo confirmados, menores marcados) y fecha inválida `400 INVALID_DATE` | Media | API + UI | Verificado en ejecución (API) |
| CP-S5-011 | RF-010 | (6) Un instructor intenta leer o registrar la asistencia de la clase de otro: `403` | Alta | API + UI | API verificada en ejecución; UI por lectura (OBS-10) |
| CP-S5-012 | RF-010 | Registro de asistencia con cuerpo inválido | Baja | API | DEFECTO leve (OBS-09); el `500` sin `registros` está verificado en ejecución |
| CP-S5-013 | RF-011 | Detalle público de una clase `/clases/:id`: `200` con horarios e instructor, `404 CLASS_NOT_FOUND` | Alta | UI + API | Verificado en ejecución |
| CP-S5-014 | RF-011 | El botón de inscripción del detalle público según rol y estado de la clase | Media | UI | Por verificar en ejecución (OBS-05) |
| CP-S5-015 | RF-011 | Filtro por tipo de baile: alias `?tipo=` y lista desplegable | Alta | API + UI | API verificada en ejecución; limitación de lista fija (OBS-06) |
| CP-S5-016 | RF-011 / RF-012 / RF-013 | Flujo integrado: explorar, ver detalle, inscribirse y pagar; efecto en cupos, asistencia y reportes | Alta | UI + API | Flujo verificado en ejecución; efectos en asistencia y reportes por lectura |
| CP-S5-017 | RF-011 / RF-012 | Detalle del estudiante `/estudiante/clases/:id` y reinscripción duplicada: `409 ENROLLMENT_ALREADY_EXISTS` | Media | UI + API | Detalle verificado en ejecución; duplicado por lectura (OBS-04) |
| CP-S5-018 | RF-015 | El administrador ve el reporte de pagos sin filtros: 2 pagos, $100.000 | Alta | UI + API | Verificado en ejecución |
| CP-S5-019 | RF-015 | (1a) Reporte de pagos filtrado por fecha | Alta | UI + API | Rango futuro verificado en ejecución; resto por lectura |
| CP-S5-020 | RF-015 | (1b) Reporte de pagos filtrado por instructor | Alta | UI + API | Verificado en ejecución (`instructor_id` del admin) |
| CP-S5-021 | RF-015 | (1c) Reporte de pagos filtrado por academia | Alta | UI + API | Por verificar en ejecución (OBS-08) |
| CP-S5-022 | RF-015 | Pagos reembolsados en el reporte (cancelación de la clase por el instructor) | Media | API + UI | Por verificar en ejecución (OBS-02) |
| CP-S5-023 | RF-015 | El instructor solo ve los pagos de sus propias clases | Alta | API | Verificado en ejecución |
| CP-S5-024 | RF-015 | (2) Un instructor intenta ver los pagos de otro instructor: `403 FORBIDDEN` | Alta | API | Verificado en ejecución |
| CP-S5-025 | RF-015 | (3) Rango de fechas invertido, fecha imposible o formato inválido: `400 INVALID_DATE_RANGE` | Alta | API + UI | Rango invertido verificado en ejecución; resto por lectura |
| CP-S5-026 | RF-015 | Acceso al reporte de pagos por rol (estudiante, padre, sin token) | Alta | API + UI | Estudiante `403` verificado en ejecución; resto por lectura |
| CP-S5-027 | RF-015 | Pantalla `/admin/reportes`: filtros combinados, selector de instructores y estado vacío | Media | UI | Estado vacío verificado en ejecución |
| CP-S5-028 | RF-015 | Pantalla `/instructor/pagos`: solo pagos propios y sin columna Instructor | Alta | UI | Verificado en ejecución |
| CP-S5-029 | RF-016 | El padre consulta la asistencia de su menor: sesiones, presentes y porcentaje (66.7) | Alta | API | Verificado en ejecución |
| CP-S5-030 | RF-016 | Menor sin asistencia registrada: resumen en cero y estado vacío | Media | API + UI | Verificado en ejecución |
| CP-S5-031 | RF-016 | (4) Un padre intenta ver la asistencia de un menor que no es suyo: `403`; también `404` y `400` | Alta | API + UI | Verificado en ejecución |
| CP-S5-032 | RF-016 | Pantalla `/padre/asistencia`: selector de hijo, resumen, detalle por clase y sin menores | Media | UI | Verificado en ejecución (OBS-14) |
| CP-S5-033 | RF-016 | Acceso al reporte de asistencia por rol (estudiante, administrador, instructor, sin token) | Media | API | Estudiante `403` verificado en ejecución; resto por lectura |
| CP-S5-034 | RF-007 | Token de un usuario suspendido: `403 ACCOUNT_SUSPENDED` en cualquier endpoint protegido | Alta | API | Verificado en ejecución |
| CP-S5-035 | RF-003 / seguridad | El token de recuperación de contraseña no sirve como sesión: `401 UNAUTHORIZED` | Alta | API | Verificado en ejecución |
| CP-S5-036 | RF-005 / navegación | Todos los enlaces del menú lateral de cada rol llevan a una pantalla real o a "Próximamente" | Alta | UI | No verificado en navegador (OBS-03, OBS-07, OBS-12) |
| CP-S5-037 | RF-006 / RF-008 | Script de backfill de solicitudes de academia para instructores sin solicitud | Baja | Consola | Verificado en ejecución |

Los casos marcados con (1a) a (6) son los escenarios obligatorios del pedido de
QA de la tarjeta (en la tarjeta están rotulados (a) a (f)): (1a) fecha, (1b)
instructor y (1c) academia son los tres filtros del reporte de pagos; (2) es el
instructor que consulta pagos ajenos; (3) el rango de fechas inválido; (4) el
menor ajeno; (5a) y (5b) la asistencia guardada y recargada, y su idempotencia;
(6) el instructor que accede a la asistencia de la clase de otro.

## Cómo preparar el entorno

1. **Variables de entorno.** El backend lee `backend/.env` y el frontend
   `frontend/.env` (cada carpeta tiene su `.env.example`; los `.env` no se
   versionan). Hace falta MySQL accesible y `DATABASE_URL`, `JWT_SECRET` y
   `JWT_EXPIRES_IN` definidos. `VITE_API_URL` del frontend debe apuntar al
   backend con el prefijo `/api` (por defecto `http://localhost:3000/api`; el
   backend escucha en `PORT`, por defecto 3000, y monta todo bajo `/api`).
2. **Sembrar la base:** `cd backend && npx prisma db seed`. **Los casos que
   modifican datos lo indican ("Modifica datos"): volver a sembrar antes de
   cada uno.** El seed regenera todos los usuarios con ids (UUID) nuevos, así
   que los tokens y los ids anteriores dejan de servir (hay que volver a iniciar
   sesión y a consultar los ids). Las fechas y horas de los pagos y de la
   asistencia del seed son las del momento de sembrar.
3. **Backend:** `cd backend && npm run dev` en `http://localhost:3000`. La
   consola del backend escribe los correos como
   `[correo simulado] Para: <correo> | Asunto: <asunto> (...)` si no hay
   `RESEND_API_KEY` ni `EMAIL_FROM`.
4. **Frontend:** `cd frontend && npm run dev` en `http://localhost:5173`.
   Conviene abrir las herramientas de desarrollo del navegador (pestaña Red) para
   ver las llamadas a `/api` que se mencionan en algunos casos.
5. **Datos de prueba** (contraseña de todos: `Prueba1234`). Es lo que el seed
   (`backend/prisma/seed.js`) crea de verdad:

   | Usuario | Rol | Datos relevantes |
   | ------- | --- | ---------------- |
   | `admin@danzas.app` | admin | |
   | `instructor.aprobado@danzas.app` (Camila Rodríguez) | instructor | Barranquilla; solicitud `aprobada` de "Academia Ritmo Caribe". Salsa lunes 18:00-19:00 (cupo 13 disponibles de 15, $50.000, 2 inscritos: Andrea y Mateo) y Bachata miércoles 19:15-20:15 (12 de 12, $45.000, sin inscritos). Es la dueña de los dos pagos aprobados del seed |
   | `instructor.independiente@danzas.app` (Julián Torres) | instructor | Medellín; solicitud `aprobada` sin nombre de academia (independiente). Danza urbana martes 17:00-18:00 (19 de 20, $40.000); sin pagos |
   | `instructor.pendiente@danzas.app` (Valentina Gómez) | instructor | Cali; el usuario tiene `estado = pendiente` (puede iniciar sesión) y su solicitud "Academia Nuevos Pasos" está `pendiente`; sin clases |
   | `estudiante1@danzas.app` (Andrea Pérez) | estudiante | Inscripción `confirmada` en Salsa, pago `aprobado` simulado de $50.000 y **una** asistencia (`asistio = true`) con la fecha en que se sembró (fecha UTC) |
   | `estudiante2@danzas.app` (Santiago Mejía) | estudiante | Inscripción `pendiente_pago` en Danza urbana (sin pago) |
   | `padre@danzas.app` (Laura Sánchez) | padre | Menores Mateo Sánchez (nacido 2015-03-10) e Isabella Sánchez (2017-07-22). Mateo tiene inscripción `confirmada` en Salsa con pago `aprobado` de $50.000 y **ninguna** asistencia; Isabella no tiene inscripciones |

   Totales del seed que se usan para calcular resultados: **2 pagos
   aprobados de $50.000** (el de Andrea y el de Mateo, con Laura como
   acudiente), ambos de clases de Camila: `totalRecibido` = 100000,
   `totalReembolsado` = 0, `neto` = 100000. Julián, Valentina y las demás
   cuentas no tienen pagos. En el seed no hay pagos rechazados ni
   reembolsados.
6. **Llamadas a la API** (ejemplos con `curl` en Git Bash; en Postman, Thunder
   Client o Bruno se usa el mismo método, URL, header y cuerpo). Los errores
   de la API tienen la forma `{ "error": { "code": "...", "message": "..." } }`:

   ```bash
   API=http://localhost:3000/api
   login() {   # uso: login instructor.aprobado@danzas.app
     curl -s -X POST $API/auth/login -H "Content-Type: application/json" \
       -d "{\"correo\":\"$1\",\"contraseña\":\"Prueba1234\"}"
   }
   login instructor.aprobado@danzas.app
   # => { "token": "...", "user": { "id": "...", ... } }
   curl -s $API/reports/payments -H "Authorization: Bearer <TOKEN_ADMIN>"
   # con filtros de texto, dejar que curl codifique los espacios y las tildes:
   curl -s -G $API/reports/payments --data-urlencode "academia=Academia Ritmo Caribe" \
     -H "Authorization: Bearer <TOKEN_ADMIN>"
   ```

   Placeholders de **tokens** (`token` del login de cada usuario):
   `<TOKEN_ADMIN>`, `<TOKEN_CAMILA>`, `<TOKEN_JULIAN>`, `<TOKEN_VALENTINA>`,
   `<TOKEN_E1>`, `<TOKEN_E2>`, `<TOKEN_PADRE>`, `<TOKEN_PADRE2>` (este último
   solo en CP-S5-031).
   Placeholders de **ids**: `<ID_CAMILA>`, `<ID_JULIAN>`, `<ID_VALENTINA>`,
   `<ID_E1>`, `<ID_E2>`, `<ID_PADRE>` (`user.id` del login);
   `<ID_SALSA>`, `<ID_BACHATA>`, `<ID_URBANA>` (de `GET /api/classes/search`,
   público, o de `GET /api/classes/my-classes` con el token del instructor);
   `<ID_MATEO>`, `<ID_ISABELLA>` (de `GET /api/users/dependents` con el token del
   padre); `<ID_INSC_E1>` y `<ID_INSC_MATEO>` (el campo `inscripcionId` de cada
   alumno en `GET /api/classes/<ID_SALSA>/attendance?fecha=<FECHA>` con el token
   de Camila); `<ID_INSC_E2>` (de `GET /api/users/<ID_E2>/enrollments` con el
   token de estudiante2); `<ID_SOLICITUD_VALENTINA>` (de
   `GET /api/admin/academy-requests` con el token del admin, la solicitud con
   `instructorId` igual a `<ID_VALENTINA>`).
   Placeholders de **fechas** (formato `YYYY-MM-DD`): `<HOY>` es el día en que se
   sembró, **en hora de Colombia**; `<AYER>` y `<MANANA>` son el día anterior y
   el siguiente; `<FECHA_SEED>` es la fecha de la asistencia sembrada (se ve en
   Prisma Studio, tabla `asistencia`, columna `fecha_sesion`; coincide con
   `<HOY>` salvo que se haya sembrado entre las 19:00 y las 23:59 de Colombia,
   porque el seed la guarda con la fecha UTC).
7. **Formatos que se ven en pantalla.** Los importes salen con
   `Intl.NumberFormat("es-CO")`: `$ 50.000` (con un espacio no separable entre
   el símbolo y el número; en el resto del documento se escribe `$50.000`). La
   columna "Fecha" del reporte de pagos muestra día y hora en hora de Colombia
   (`America/Bogota`), por ejemplo "18 oct 2026, 2:05 p. m." (el formato exacto
   depende del navegador). Los horarios de las clases se muestran como
   `Lunes 18:00 - 19:00` (día + hora de inicio y de fin en 24 horas).
8. **Prisma Studio** (`cd backend && npx prisma studio`, `http://localhost:5555`)
   sirve para ver tablas (`asistencia`, `pago`, `inscripcion`) y, donde se
   indique, para editar un valor.
9. **Cómo se forma el horario que envía la interfaz.** El formulario envía la
   hora como `1970-01-01T<HH>:<MM>:00.000Z` (la hora de pared tal cual, sin
   convertir de zona) y las pantallas la leen con la hora UTC de ese texto. Por
   eso la hora que se escribe es la que se muestra, sin importar la zona del
   navegador (CP-S5-002).

---

## RF-008 — Creación y edición de clases desde la interfaz del instructor

Archivos revisados: `backend/src/routes/classes.routes.js`,
`backend/src/controllers/class.controller.js`,
`backend/src/services/class.service.js`,
`backend/src/services/schedule.service.js`,
`backend/src/repositories/class.repository.js`,
`frontend/src/screens/instructor/ClassForm.jsx`,
`frontend/src/screens/instructor/MyClasses.jsx`,
`frontend/src/utils/formatDate.js`.

### CP-S5-001 — RF-008 — Caso: un instructor aprobado crea una clase desde el formulario
- **RF:** RF-008 · **Prioridad:** Alta · **Ejecución:** UI + API · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado; sesión de `instructor.aprobado@danzas.app` (Camila) en `http://localhost:5173/login`. Camila ya tiene Salsa (lunes 18:00-19:00) y Bachata (miércoles 19:15-20:15), así que el viernes está libre.

**Dado** una instructora con la solicitud de academia aprobada, en `/instructor/clases` ("Mis clases", con 2 clases)
**Cuando** pulsa "+ Nueva clase" (lleva a `/instructor/clases/nueva`, título "Crear una nueva clase"), completa Tipo de baile `Cumbia`, Ciudad `Barranquilla`, Día de la semana `Viernes`, Hora de inicio `17:00`, Hora de fin `18:00`, Cupo máximo `10`, Precio `35000` y pulsa "Crear clase"
**Entonces** la clase se crea, se vuelve a la lista y la clase queda publicada en el buscador

**Resultado esperado**
- UI: durante el envío el botón dice "Guardando..."; luego el navegador pasa a `/instructor/clases` y la tabla "Clases creadas" tiene una fila nueva con "Cumbia" / "Barranquilla", modalidad "Presencial", horario "Viernes 17:00 - 18:00", estudiantes "0" "/ 10", precio "$35.000" y el estado "Activa" con los botones "Ver", "Editar" y "Cancelar". Los contadores pasan a "Total de clases" 3, "Clases activas" 3 y "Estudiantes inscritos" 2 (los dos de la Salsa).
- API equivalente: `POST /api/classes` con el token de Camila y
  ```json
  { "tipoBaile": "Cumbia", "ciudad": "Barranquilla", "modalidad": "presencial",
    "cupoMaximo": 10, "precio": 35000, "diaSemana": 5,
    "horaInicio": "1970-01-01T17:00:00.000Z", "horaFin": "1970-01-01T18:00:00.000Z" }
  ```
  responde `201` con la clase: `instructorId` igual a `<ID_CAMILA>`, `estado: "activa"`, `cupoMaximo: 10`, `cupoDisponible: 10`, `precio: "35000"` (texto, así serializa Prisma el `Decimal`) y `horarios` con un elemento (`diaSemana: 5`, `horaInicio: "1970-01-01T17:00:00.000Z"`, `horaFin: "1970-01-01T18:00:00.000Z"`).
- Visible de inmediato: `GET /api/classes/search?tipo=Cumbia` (sin token) devuelve la clase; en `http://localhost:5173/clases` el contador pasa a "4 clases" y la tarjeta "Clase de Cumbia" muestra "Barranquilla", "Viernes 17:00 - 18:00", "$35.000" y "10 disponibles". El tipo "Cumbia" no figura en el desplegable "Tipo de baile" (OBS-06); sí se encuentra escribiendo "cumbia" en el buscador de texto.
- El formulario siempre crea la clase como `presencial` (el texto de la sección dice "Las clases son presenciales."; el ERS limita v1.0 a presencial).
- Si el formulario se envía con un campo vacío, no se llama al backend (ver CP-S5-005).

**Fuente:** `frontend/src/screens/instructor/ClassForm.jsx` (`handleSubmit`, `classData`), `frontend/src/utils/formatDate.js` (`horaAISO`, `formatearHorario`), `frontend/src/screens/instructor/MyClasses.jsx`, `backend/src/services/class.service.js` (`crearClase`), `backend/src/repositories/class.repository.js` (`create`, `searchClasses`).

### CP-S5-002 — RF-008 — Caso: la hora se muestra tal como se ingresó (18:00 sigue siendo 18:00)
- **RF:** RF-008 · **Prioridad:** Alta · **Ejecución:** UI + API · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado; sesión de Camila. Navegador y sistema operativo en hora de Colombia (UTC-5) o cualquier zona distinta de UTC: es justo el escenario en el que una conversión de zona movería la hora.

**Dado** una instructora que crea una clase `Cumbia` los viernes de `18:00` a `19:00` (mismo procedimiento que CP-S5-001 cambiando las horas; el viernes está libre)
**Cuando** revisa la clase en cada pantalla que muestra horarios
**Entonces** en todas aparece `18:00` y `19:00`, nunca una hora desplazada por la zona horaria (por ejemplo 13:00 o 23:00)

**Resultado esperado**
- API: `POST /api/classes` (con `"horaInicio": "1970-01-01T18:00:00.000Z"` y `"horaFin": "1970-01-01T19:00:00.000Z"`) y luego `GET /api/classes/<id>` devuelven `horarios[0].horaInicio = "1970-01-01T18:00:00.000Z"` y `horaFin = "1970-01-01T19:00:00.000Z"`. La Salsa del seed devuelve `"1970-01-01T18:00:00.000Z"` y `"1970-01-01T19:00:00.000Z"`.
- La cadena `Viernes 18:00 - 19:00` aparece en:
  - `/instructor/clases` (Mis clases), columna "Horario";
  - `/instructor/clases/<id>` (detalle del instructor), tarjeta "Horario";
  - `/instructor/clases/<id>/editar`: los campos "Hora de inicio" y "Hora de fin" vienen cargados con `18:00` y `19:00`;
  - `/clases` (tarjeta, "Horario") y `/clases/<id>` (detalle público, "Horario");
  - `/estudiante/clases/<id>` (detalle del estudiante) y `/estudiante/clases/<id>/inscribir` ("Horario").
- Con el seed, la Salsa se ve `Lunes 18:00 - 19:00`, la Bachata `Miércoles 19:15 - 20:15` y la Danza urbana `Martes 17:00 - 18:00` en esas mismas pantallas.
- Pantallas de administración de clases (`/admin/classes` y `/admin/classes/<cualquier id>`): no leen el backend, muestran clases de ejemplo (OBS-03). Solo se comprueba que la hora de ejemplo se lea sin desplazamiento: "Salsa intermedio" con "Lun - Mié - Vie" y `19:00 - 20:30` en el listado y `19:00 - 20:30` en el detalle.
- Verificado en ejecución: la clase creada por el formulario con 17:00-18:00 se vio como `Viernes 17:00 - 18:00` en Mis clases. Las demás pantallas de la lista están por verificar en ejecución.

**Fuente:** `frontend/src/utils/formatDate.js` (`horaDesdeISO` lee la hora UTC; `horaAISO`), `frontend/src/components/classes/ClassSchedule.jsx`, `frontend/src/screens/instructor/MyClasses.jsx`, `frontend/src/screens/public/ClassDetail.jsx`, `frontend/src/screens/admin/classes/ClassesAdmin.jsx`, `frontend/src/screens/admin/classes/ClassDetailAdmin.jsx`.

### CP-S5-003 — RF-008 — Caso: horario que se cruza o queda a menos de 15 minutos de otra clase, `409 SCHEDULE_CONFLICT`
- **RF:** RF-008 · **Prioridad:** Alta · **Ejecución:** UI + API · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado (re-sembrar entre filas de la tabla que crean una clase y afectan a las siguientes); tokens de Camila y de Julián. Camila: Salsa lunes 18:00-19:00 y Bachata miércoles 19:15-20:15. Julián: Danza urbana martes 17:00-18:00.

**Dado** una instructora con una clase activa el lunes de 18:00 a 19:00
**Cuando** intenta crear otra clase con un horario que se solapa o que queda a menos de 15 minutos de la existente (en el formulario `/instructor/clases/nueva`: Tipo `Merengue`, Ciudad `Barranquilla`, Día `Lunes`, horas de la tabla, Cupo `10`, Precio `30000`, "Crear clase"; o con `POST /api/classes` y las horas como `1970-01-01T<HH>:<MM>:00.000Z`)
**Entonces** el sistema rechaza la creación indicando el conflicto, salvo cuando la separación es de 15 minutos o más

**Resultado esperado** (día lunes, `diaSemana: 1`, token de Camila)

| Inicio - fin | Resultado |
| ------------ | --------- |
| 18:30 - 19:30 (solapa) | `409 SCHEDULE_CONFLICT` |
| 18:00 - 19:00 (mismo horario) | `409 SCHEDULE_CONFLICT` |
| 18:15 - 18:45 (contenido dentro) | `409 SCHEDULE_CONFLICT` |
| 19:10 - 20:10 (empieza 10 min después de que termina la Salsa) | `409 SCHEDULE_CONFLICT` |
| 19:14 - 20:14 (14 min) | `409 SCHEDULE_CONFLICT` |
| 19:15 - 20:15 (exactamente 15 min después) | `201`, se crea |
| 16:50 - 17:50 (termina 10 min antes de la Salsa) | `409 SCHEDULE_CONFLICT` |
| 16:45 - 17:45 (termina exactamente 15 min antes) | `201`, se crea |
| Martes 18:30 - 19:30 (otro día) | `201`, se crea |

- API: en los `409`, `error.code = "SCHEDULE_CONFLICT"` y `error.message = "El horario se cruza con otra clase del instructor."`; no se crea ninguna clase (verificar con `GET /api/classes/my-classes`).
- UI: en los casos de conflicto el formulario se queda en `/instructor/clases/nueva` y muestra un recuadro de error (título "Error") con el texto "Este horario se cruza con otra de tus clases o queda a menos de 15 minutos de una." (el texto de la pantalla no es el del backend, OBS-11). En los casos que se crean, vuelve a `/instructor/clases`.
- Julián (independiente): `diaSemana: 2`, 17:30 - 18:30 da el mismo `409`; la regla aplica a todas las clases del instructor, tenga o no academia.
- Una clase cancelada deja de bloquear el horario (la validación solo compara contra clases `activa`).
- Editar una clase no choca consigo misma: `PUT /api/classes/<ID_SALSA>` con `{"precio": 55000}` responde `200`.
- Verificado en ejecución por API el 2026-10-18: las nueve filas de la tabla, el `409` de Julián y la edición sin choque dieron el resultado indicado, con el mensaje exacto del backend. No verificado en ejecución a través de la interfaz.

**Fuente:** `backend/src/services/schedule.service.js` (`MARGEN_MINUTOS = 15`, `seSuperponen`, `hayConflictoDeHorario`), `backend/src/services/class.service.js` (`crearClase`, `editarClase`), `frontend/src/screens/instructor/ClassForm.jsx` (`ERROR_MESSAGES.SCHEDULE_CONFLICT`).

### CP-S5-004 — RF-008 — Caso: instructor con la solicitud de academia no aprobada, `403 ACADEMY_NOT_APPROVED`
- **RF:** RF-008 (RF-006) · **Prioridad:** Alta · **Ejecución:** UI + API · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado; `instructor.pendiente@danzas.app` (Valentina, solicitud `pendiente`); token del admin; `<ID_SOLICITUD_VALENTINA>`. Cuerpo de ejemplo para todos los `POST /api/classes` de este caso: `{"tipoBaile":"Tango","ciudad":"Cali","modalidad":"presencial","cupoMaximo":10,"precio":30000,"diaSemana":2,"horaInicio":"1970-01-01T10:00:00.000Z","horaFin":"1970-01-01T11:00:00.000Z"}`.

**Dado** una instructora que puede iniciar sesión pero cuya solicitud de academia todavía no está aprobada
**Cuando** intenta crear una clase (en `/instructor/clases/nueva`, o con `POST /api/classes` y el token de Valentina)
**Entonces** el sistema rechaza la publicación y explica el motivo según el estado de la solicitud

**Resultado esperado**
- Solicitud `pendiente` (estado del seed): `403` con `error.code = "ACADEMY_NOT_APPROVED"` y mensaje "Tu solicitud de academia sigue pendiente de aprobación. No puedes publicar clases hasta que el administrador la apruebe.". La clase no se crea (`GET /api/classes/my-classes` de Valentina devuelve `[]`). En la UI ese mismo mensaje aparece en el recuadro de error del formulario y la pantalla "Mis clases" de Valentina muestra "No tienes clases todavía".
- Solicitud `rechazada`: con el token del admin, `POST /api/admin/academy-requests/<ID_SOLICITUD_VALENTINA>/reject` responde `200` con `request.estado = "rechazada"`; el mismo `POST /api/classes` responde `403 ACADEMY_NOT_APPROVED` con el mensaje "Tu solicitud de academia fue rechazada. No puedes publicar clases hasta que el administrador la apruebe.".
- Sin ninguna solicitud (instructores registrados antes de que el alta creara la solicitud; ver CP-S5-037): `403 ACADEMY_NOT_APPROVED` con "Aún no tienes una solicitud de academia aprobada. No puedes publicar clases hasta que el administrador la apruebe.".
- Solicitud `aprobada`: `POST /api/admin/academy-requests/<ID_SOLICITUD_VALENTINA>/approve` responde `200` con `request.estado = "aprobada"` y luego el `POST /api/classes` responde `201`. Si el instructor tiene varias solicitudes, basta una aprobada. Aprobar una solicitud previamente rechazada no está bloqueado por el backend (no valida el estado actual; por confirmar en ejecución).
- Estados que bloquean: `pendiente`, `rechazada` y ausencia de solicitud. La edición, la cancelación y la asistencia no comprueban la aprobación (solo la creación).
- Valentina sí puede iniciar sesión y usar su panel: solo el estado de usuario `suspendido` bloquea el acceso, el `pendiente` no.
- Verificado en ejecución por API el 2026-10-18: los tres estados responden `403 ACADEMY_NOT_APPROVED` con los mensajes de arriba y, tras aprobar la solicitud (`200`), el `POST /api/classes` responde `201`. No verificado en ejecución a través de la interfaz.

**Fuente:** `backend/src/services/class.service.js` (`exigirAcademiaAprobada`, `crearClase`), `backend/src/repositories/academyRequest.repository.js` (`findByInstructor`), `backend/src/routes/academyRequests.routes.js`, `frontend/src/screens/instructor/ClassForm.jsx` (muestra `err.message`), `backend/prisma/seed.js`.

### CP-S5-005 — RF-008 — Caso: validaciones del formulario y de la API al crear una clase
- **RF:** RF-008 · **Prioridad:** Media · **Ejecución:** UI + API
- **Precondiciones / datos:** seed recién cargado; tokens de Camila y de `estudiante1@danzas.app`.

**Dado** el criterio del ERS "todos los campos obligatorios deben completarse antes de publicar" y que solo los instructores crean clases
**Cuando** Camila deja campos vacíos o con valores inválidos en el formulario, o llama a la API con horas incorrectas, y cuando estudiante1 llama a `POST /api/classes`
**Entonces** el formulario avisa sin llamar al backend y la API rechaza lo inválido

**Resultado esperado**
- UI, en este orden de validación y con el prefijo "⚠️" sobre el botón "Crear clase": "El tipo de baile es obligatorio.", "La ciudad es obligatoria.", "Selecciona el día de la semana.", "Selecciona la hora de inicio.", "Selecciona la hora de fin.", "La hora de fin debe ser posterior a la hora de inicio." (también con horas iguales), "El cupo máximo debe ser un número entero mayor que 0." y "El precio no puede ser negativo.". El precio `0` se acepta. No se envía ninguna petición (pestaña Red sin `POST /classes`).
- API, fin igual o anterior al inicio (por ejemplo 18:00-18:00 o 19:00-18:00, con un horario libre): `400` con `error.code = "INVALID_SCHEDULE"` y mensaje "El horario no es válido: la hora de inicio y de fin deben tener un formato correcto y la hora de fin debe ser posterior a la de inicio.". Un cuerpo `{}` de Camila responde el mismo `400 INVALID_SCHEDULE` (la hora se valida antes de tocar la base).
- API, token de estudiante: `403` con `error.code = "FORBIDDEN"` y mensaje "No tenés permiso para acceder a este recurso."; sin token: `401` con `error.code = "UNAUTHORIZED"` y mensaje "Token no provisto o con formato inválido."; token mal formado: `401 UNAUTHORIZED` "Token inválido o expirado.".
- Horario válido pero sin `precio`, `cupoMaximo` o `ciudad`: el código no valida el cuerpo y Prisma falla; el resultado es `500` con `error.code = "INTERNAL_ERROR"` y mensaje "Ocurrió un error inesperado" en lugar de un `400` (OBS-13, verificado en ejecución). Tampoco se bloquea `"modalidad": "virtual"` por API.

**Fuente:** `frontend/src/screens/instructor/ClassForm.jsx` (`validateForm`), `backend/src/services/schedule.service.js` (`validarHorario`, `horarioInvalido`), `backend/src/services/class.service.js` (`crearClase`), `backend/src/middleware/roleGuard.middleware.js`, `backend/src/middleware/auth.middleware.js`, `backend/src/middleware/errorHandler.js`.

### CP-S5-006 — RF-008 — Caso: `GET /api/classes/my-classes` es solo para instructores y devuelve solo sus clases
- **RF:** RF-008 · **Prioridad:** Alta · **Ejecución:** API + UI
- **Precondiciones / datos:** seed recién cargado; tokens de Camila, Julián, Valentina y estudiante1.

**Dado** instructores con distintas clases
**Cuando** cada uno llama `GET /api/classes/my-classes` con su token, o abre `/instructor/clases`
**Entonces** ve únicamente las clases que creó, con sus horarios

**Resultado esperado**
- Camila: `200` con un arreglo de 2 clases (Salsa y Bachata). Cada elemento trae `id`, `tipoBaile`, `ciudad`, `modalidad`, `cupoMaximo`, `cupoDisponible` (13 y 12), `precio` como texto, `estado: "activa"` y `horarios` (Salsa: `diaSemana: 1`, `1970-01-01T18:00:00.000Z` a `1970-01-01T19:00:00.000Z`; Bachata: `diaSemana: 3`, `19:15` a `20:15`). No trae el objeto `instructor`.
- Julián: `200` con la Danza urbana solamente. Valentina: `200` con `[]`.
- Estudiante: `403` con `error.code = "FORBIDDEN"` y mensaje "No tenés permiso para acceder a este recurso."; sin token: `401 UNAUTHORIZED`.
- La ruta responde a `/my-classes` y no se confunde con un id (`/:id` va declarado después).
- Incluye también las clases `cancelada` del instructor (no filtra por estado): en la pantalla se ven con el distintivo "Cancelada" y sin botones "Editar" ni "Cancelar" (solo "Ver").
- UI, Camila en `/instructor/clases`: dos filas ("Salsa" y "Bachata", ambas "Barranquilla" y "Presencial") con "Lunes 18:00 - 19:00" y "Miércoles 19:15 - 20:15", estudiantes "2 / 15" y "0 / 12", precios "$50.000" y "$45.000"; contadores "Total de clases" 2, "Clases activas" 2, "Estudiantes inscritos" 2. Julián: una fila (Danza urbana, "1 / 20", "$40.000"). Valentina: "No tienes clases todavía", "Crea tu primera clase para comenzar a ofrecer tus clases de danza." y el botón "Crear nueva clase".
- El orden del arreglo es el natural de la consulta; no hay "más recientes primero" porque `Clase` no tiene fecha de creación (OBS-01).

**Fuente:** `backend/src/routes/classes.routes.js`, `backend/src/controllers/class.controller.js` (`getMyClasses`), `backend/src/services/class.service.js` (`listarClasesDelInstructor`), `backend/src/repositories/class.repository.js` (`findByInstructor`), `frontend/src/screens/instructor/MyClasses.jsx`.

### CP-S5-007 — RF-008 / RF-009 — Caso: editar el cupo máximo recalcula `cupoDisponible` y no puede bajar de los inscritos
- **RF:** RF-008 / RF-009 · **Prioridad:** Alta · **Ejecución:** API + UI · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado; token de Camila. La Salsa tiene `cupoMaximo` 15, `cupoDisponible` 13, es decir **2 inscritos** (inscritos = cupo máximo − cupo disponible).

**Dado** una clase con 2 inscritos
**Cuando** Camila llama `PUT /api/classes/<ID_SALSA>` con distintos `cupoMaximo` (o los cambia en `/instructor/clases/<ID_SALSA>/editar`, campo "Cupo máximo", y pulsa "Guardar cambios")
**Entonces** el cupo disponible se recalcula y no se permite dejar menos cupos que inscritos

**Resultado esperado**
- `{"cupoMaximo": 1}`: `400` con `error.code = "INVALID_CAPACITY"` y mensaje "No puedes bajar el cupo a 1: la clase ya tiene 2 inscritos."; la clase no cambia. En la UI el recuadro de error del formulario (título "Error") muestra ese mismo texto y no se sale de la pantalla.
- `{"cupoMaximo": 20}`: `200` con `cupoMaximo: 20` y `cupoDisponible: 18` (20 − 2). En la UI, vuelve a `/instructor/clases` y la fila muestra "2" "/ 20"; el detalle `/instructor/clases/<ID_SALSA>` muestra "2/20" estudiantes inscritos, "18" cupos disponibles y "10%" de ocupación; el detalle público `/clases/<ID_SALSA>` dice "18 de 20 cupos".
- `{"cupoMaximo": 2}` (límite): `200` con `cupoDisponible: 0` (por lectura de código: solo rechaza si el nuevo cupo es menor que los inscritos); el detalle público pasa a "0 de 2 cupos" y el botón queda deshabilitado con "Sin cupos disponibles".
- `{"cupoMaximo": 0}`, `{"cupoMaximo": -3}` o `{"cupoMaximo": "20"}` (texto): `400 INVALID_CAPACITY` con "El cupo máximo debe ser un número entero mayor a 0.".
- `{"cupoDisponible": 99}`: el campo se descarta; `cupoDisponible` no cambia. Un `PUT` que no trae `cupoMaximo` (por ejemplo `{"precio": 55000}`) no toca el cupo.
- Otro instructor (Julián) sobre la Salsa: `403 FORBIDDEN` "No tenés permiso para modificar esta clase."; id inexistente: `404 CLASS_NOT_FOUND` "Clase no encontrada.".
- Verificado en ejecución por API: bajar a 1 con 2 inscritos (mensaje exacto de arriba) y subir a 20 (`cupoDisponible` 18). El resto por lectura de código y de `backend/tests/class.capacity.test.js`.

**Fuente:** `backend/src/services/class.service.js` (`editarClase`, `actualizarConNuevoCupo`), `backend/src/repositories/class.repository.js` (`update`), `frontend/src/screens/instructor/ClassForm.jsx`, `backend/tests/class.capacity.test.js`.

---

## RF-010 — Gestión de asistencia

Archivos revisados: `backend/src/routes/classes.routes.js`,
`backend/src/controllers/attendance.controller.js`,
`backend/src/services/attendance.service.js`,
`backend/src/repositories/attendance.repository.js`,
`backend/src/repositories/enrollment.repository.js` (`findAlumnosConfirmados`),
`frontend/src/screens/instructor/ClassDetailInstructor.jsx`,
`frontend/src/services/classes.service.js`.

Endpoints (solo rol instructor):
`GET /api/classes/:id/attendance?fecha=YYYY-MM-DD` (lista de alumnos con su
asistencia de esa fecha) y `POST /api/classes/:id/attendance` con
`{ "fechaSesion": "YYYY-MM-DD", "registros": [ { "inscripcionId": "...", "asistio": true } ] }`
(responde `201` con `{ "count": <filas guardadas> }`). La pantalla es la
sección "Registro de asistencia" del detalle `/instructor/clases/:id`; la entrada
"Asistencia" del menú lateral del instructor lleva a "Próximamente" (OBS-07).

### CP-S5-008 — RF-010 — Caso (5a): el instructor toma asistencia y al recargar ve los valores guardados
- **RF:** RF-010 · **Prioridad:** Alta · **Ejecución:** UI · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado; sesión de Camila. La Salsa tiene dos alumnos confirmados: Andrea Pérez y Mateo Sánchez (menor, inscrito por Laura). Si `<HOY>` coincide con `<FECHA_SEED>`, Andrea aparece marcada de entrada (la asistencia sembrada) y Mateo sin marcar.

**Dado** el detalle de la Salsa en `/instructor/clases/<ID_SALSA>` (Camila entra desde "Mis clases" con el botón "Ver")
**Cuando** en "Registro de asistencia" deja la fecha por defecto (hoy), marca solo a "Mateo Sánchez" (queda desmarcada "Andrea Pérez"), pulsa "Guardar asistencia" y después recarga la página (F5)
**Entonces** la asistencia queda guardada y, al volver a cargar, se ven los valores guardados

**Resultado esperado**
- Encabezado de la clase: "Clase de Salsa", "Barranquilla", "Presencial", distintivo "Activa"; tarjetas "2/15" (Estudiantes inscritos), "13" (Cupos disponibles), "13%" (Ocupación) y "$50.000" (Precio).
- Sección "Registro de asistencia" ("Marca los estudiantes que asistieron a la clase."): campo "Fecha de la sesión" con la fecha de hoy del navegador, lista con "Andrea Pérez" y "Mateo Sánchez" (este último con la etiqueta "Menor"), cada uno con una casilla.
- Al pulsar "Guardar asistencia" el botón muestra "Guardando..." y después aparece "Asistencia guardada correctamente.". Al marcar o desmarcar cualquier casilla el aviso desaparece.
- Tras recargar (la fecha vuelve a hoy): "Mateo Sánchez" marcada y "Andrea Pérez" desmarcada. Cambiar la fecha a otro día muestra las casillas sin marcar (sin registro) y volver al día guardado muestra de nuevo los valores. El valor se leyó del backend, no del navegador.
- API de contraste: `GET /api/classes/<ID_SALSA>/attendance?fecha=<HOY>` con el token de Camila devuelve Andrea con `asistio: false` y Mateo con `asistio: true`.
- La pantalla guarda a todos los alumnos de la lista: los que se dejan sin marcar se guardan como `asistio: false` (ausente); "sin registro" (`asistio: null`) solo existe antes del primer guardado (OBS-09).
- Si el backend rechaza el guardado, el mensaje aparece en un recuadro de error sobre la lista; si falla sin mensaje: "No se pudo guardar la asistencia.".
- Verificado en ejecución: la pantalla guardó y los valores persistieron.

**Fuente:** `frontend/src/screens/instructor/ClassDetailInstructor.jsx` (`handleSaveAttendance`, `toggleAttendance`, `fechaDeHoy`), `frontend/src/services/classes.service.js` (`getAttendance`, `registerAttendance`), `backend/src/services/attendance.service.js`.

### CP-S5-009 — RF-010 — Caso (5b): guardar dos veces la misma fecha no duplica filas (idempotente)
- **RF:** RF-010 · **Prioridad:** Alta · **Ejecución:** API · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado; token de Camila, token de estudiante1 y token del padre; `<ID_INSC_E1>` e `<ID_INSC_MATEO>` (de `GET /api/classes/<ID_SALSA>/attendance?fecha=2026-10-12`, campo `inscripcionId` de cada alumno). Se usa la fecha `2026-10-12` (distinta de la del seed salvo coincidencia, que no afecta el resultado).

**Dado** la Salsa con dos alumnos confirmados
**Cuando** Camila hace dos veces seguidas `POST /api/classes/<ID_SALSA>/attendance` con
```json
{ "fechaSesion": "2026-10-12",
  "registros": [
    { "inscripcionId": "<ID_INSC_E1>", "asistio": true },
    { "inscripcionId": "<ID_INSC_MATEO>", "asistio": false } ] }
```
y una tercera vez con los valores invertidos (`"asistio": false` para Andrea y `true` para Mateo)
**Entonces** la base conserva una sola fila por alumno para esa fecha, con los últimos valores

**Resultado esperado**
- Las tres llamadas responden `201` con `{ "count": 2 }`.
- `GET /api/classes/<ID_SALSA>/attendance?fecha=2026-10-12` devuelve 2 alumnos con los valores de la última llamada (Andrea `false`, Mateo `true`).
- Sin duplicados (el `GET` por sí solo no lo demuestra, porque agrupa por alumno): en Prisma Studio, tabla `asistencia`, hay exactamente una fila con `fecha_sesion` = 2026-10-12 por cada una de las dos inscripciones; o bien `GET /api/users/<ID_E1>/enrollments` con el token de estudiante1 (el arreglo de `asistencias` de esa inscripción tiene una sola entrada con `fechaSesion` 2026-10-12, además de la sembrada) y `GET /api/reports/attendance?dependent_id=<ID_MATEO>` con el token del padre (`resumen.sesiones` = 1, no 2; ver CP-S5-029).
- Guardar con la fecha del seed (`<FECHA_SEED>`) reemplaza la asistencia sembrada de Andrea: queda una sola fila para esa fecha, con el valor nuevo.
- El guardado solo afecta a los alumnos enviados y a esa fecha: las demás fechas y los alumnos no incluidos conservan lo que tenían. Si un mismo `inscripcionId` viene repetido en `registros`, gana el último valor.
- Doble clic simulado (opcional): dos `POST` simultáneos (`curl ... & curl ... & wait`) tampoco duplican filas (la clase se bloquea durante la transacción).
- Verificado en ejecución: guardar la misma fecha dos veces dejó una fila por alumno con los últimos valores.

**Fuente:** `backend/src/repositories/attendance.repository.js` (`registrarVarias`: bloquea la clase, `deleteMany` + `createMany` en una transacción), `backend/src/services/attendance.service.js` (`registrarAsistencia`), `backend/tests/attendance.repository.test.js`.

### CP-S5-010 — RF-010 — Caso: listado de alumnos de la sesión y fecha inválida
- **RF:** RF-010 · **Prioridad:** Media · **Ejecución:** API + UI · **Modifica datos** (solo la última parte)
- **Precondiciones / datos:** seed recién cargado; tokens de Camila y Julián; `<FECHA_SEED>`.

**Dado** las clases del seed
**Cuando** el instructor dueño llama `GET /api/classes/<id>/attendance?fecha=<fecha>` (o abre el detalle de la clase en la UI)
**Entonces** recibe a los alumnos con inscripción confirmada y su asistencia de esa fecha, o un error si la fecha no es válida

**Resultado esperado**
- Salsa con `fecha=2026-10-12` (sin registros): `200` con
  ```json
  { "claseId": "<ID_SALSA>", "fecha": "2026-10-12",
    "alumnos": [
      { "inscripcionId": "...", "nombre": "Andrea Pérez", "esMenor": false, "asistio": null },
      { "inscripcionId": "...", "nombre": "Mateo Sánchez", "esMenor": true, "asistio": null } ] }
  ```
  (orden: por fecha de inscripción; para un menor, `nombre` es el del menor y no el de su padre). Con `fecha=<FECHA_SEED>`, Andrea trae `asistio: true`.
- Solo cuentan las inscripciones `confirmada`: la Danza urbana de Julián devuelve `alumnos: []` mientras estudiante2 está `pendiente_pago` (en la UI: "Todavía no hay estudiantes inscritos en esta clase."); cuando estudiante2 paga (`POST /api/enrollments/<ID_INSC_E2>/simulate-payment` con su token) aparece "Santiago Mejía". La Bachata de Camila devuelve `alumnos: []`. Las inscripciones canceladas no aparecen.
- Fecha inválida: sin el parámetro `fecha`, `fecha=2026-02-30` (día inexistente), `fecha=2026-13-01` o `fecha=12-10-2026` responden `400` con `error.code = "INVALID_DATE"` y mensaje "Fecha inválida. Usá el formato YYYY-MM-DD.". La fecha se valida antes de buscar la clase y antes de comprobar quién es el dueño.
- Clase inexistente (con fecha válida): `404` con `error.code = "CLASS_NOT_FOUND"` y mensaje "Clase no encontrada.".
- En la UI, si la carga falla aparece el mensaje del backend o "No se pudo cargar la asistencia de la clase.".
- Verificado en ejecución: respuesta `200` del dueño con `alumnos[{inscripcionId, nombre, esMenor, asistio: null}]` y `400 INVALID_DATE` con una fecha imposible.

**Fuente:** `backend/src/services/attendance.service.js` (`obtenerAsistencia`, `esFechaValida`), `backend/src/repositories/enrollment.repository.js` (`findAlumnosConfirmados`), `backend/src/repositories/attendance.repository.js` (`findByClaseYFecha`), `frontend/src/screens/instructor/ClassDetailInstructor.jsx`.

### CP-S5-011 — RF-010 — Caso (6): un instructor intenta leer o registrar la asistencia de la clase de otro, `403`
- **RF:** RF-010 · **Prioridad:** Alta · **Ejecución:** API + UI
- **Precondiciones / datos:** seed recién cargado; token de Julián (no es dueño de la Salsa), de estudiante1 y de Camila; `<ID_INSC_E1>`.

**Dado** la Salsa, que pertenece a Camila, y un instructor distinto (Julián)
**Cuando** Julián hace `GET /api/classes/<ID_SALSA>/attendance?fecha=2026-10-12` y `POST /api/classes/<ID_SALSA>/attendance` con un cuerpo válido (`fechaSesion` e `<ID_INSC_E1>`), o abre `/instructor/clases/<ID_SALSA>` en el navegador
**Entonces** el sistema rechaza ambas operaciones y no guarda ninguna asistencia

**Resultado esperado**
- Lectura: `403` con `error.code = "FORBIDDEN"` y mensaje "No tenés permiso para consultar la asistencia de esta clase.".
- Registro: `403` con `error.code = "FORBIDDEN"` y mensaje "No tenés permiso para registrar asistencia en esta clase.".
- Con el token de Camila, `GET /api/classes/<ID_SALSA>/attendance?fecha=2026-10-12` sigue mostrando `asistio: null` para los dos alumnos: no se creó ninguna fila.
- Variantes: token de estudiante en cualquiera de los dos endpoints: `403 FORBIDDEN` "No tenés permiso para acceder a este recurso." (lo corta el guardián de rol); sin token: `401 UNAUTHORIZED`; clase inexistente con fecha válida: `404 CLASS_NOT_FOUND` "Clase no encontrada.".
- UI: con la sesión de Julián, `/instructor/clases/<ID_SALSA>` carga los datos de la clase (el detalle usa `GET /api/classes/:id`, que es público), pero la sección "Registro de asistencia" muestra el recuadro de error con "No tenés permiso para consultar la asistencia de esta clase." y no aparece la lista ni el botón "Guardar asistencia". La pantalla ofrece igualmente "Editar" y "Cancelar clase" sobre la clase ajena; al usarlos el backend responde `403` ("No tenés permiso para modificar esta clase." / "No tenés permiso para cancelar esta clase.") (OBS-10).
- Verificado en ejecución por API: `403` del otro instructor en la lectura y `403` del estudiante. La parte de la interfaz está por verificar en ejecución.

**Fuente:** `backend/src/services/attendance.service.js` (`clase.instructorId !== instructorId`), `backend/src/routes/classes.routes.js`, `backend/src/middleware/roleGuard.middleware.js`, `frontend/src/screens/instructor/ClassDetailInstructor.jsx`.

### CP-S5-012 — RF-010 — Caso: registro de asistencia con cuerpo inválido
- **RF:** RF-010 · **Prioridad:** Baja · **Ejecución:** API · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado; token de Camila; `<ID_INSC_E1>` (inscripción en la Salsa).

**Dado** una clase propia (la Bachata, sin inscritos) y una inscripción que pertenece a otra clase (la Salsa)
**Cuando** Camila hace `POST /api/classes/<ID_BACHATA>/attendance` con `{"fechaSesion":"2026-10-12","registros":[{"inscripcionId":"<ID_INSC_E1>","asistio":true}]}`, luego sin la propiedad `registros`, y luego con `"fechaSesion": "abc"`
**Entonces** el sistema ignora la inscripción ajena y, por lectura del código, falla ante los cuerpos incompletos

**Resultado esperado (comportamiento actual; el `500` sin `registros` está verificado en ejecución, el resto por verificar)**
- Primera llamada: `201` con `{ "count": 0 }`; no se crea ninguna fila y no se avisa que la inscripción fue descartada (solo se guardan inscripciones de la clase del `:id`).
- Sin `registros`: `500` con `error.code = "INTERNAL_ERROR"` y mensaje "Ocurrió un error inesperado" (el servicio no valida el cuerpo y el repositorio llama a `registros.map`). Debería ser un `400` de validación. Verificado en ejecución el 2026-10-18.
- `fechaSesion` inválida: no se valida el formato en el registro (sí en la lectura, CP-S5-010); el error de Prisma se traduce en `500 INTERNAL_ERROR`.
- Otras permisividades del registro: acepta inscripciones que no están `confirmada` y fechas futuras o de días en que la clase no se dicta, y no exige que la clase esté activa (la lectura de CP-S5-010 solo lista alumnos confirmados) (OBS-09).
- El defecto de Sprint 2 por el que guardar dos veces creaba filas duplicadas **ya no ocurre** (CP-S5-009).

**Estado conocido: DEFECTO leve (OBS-09).**

**Fuente:** `backend/src/services/attendance.service.js` (`registrarAsistencia` sin validación), `backend/src/repositories/attendance.repository.js` (`registrarVarias`), `backend/src/middleware/errorHandler.js`.

---

## RF-011 — Detalle público, búsqueda y flujo de inscripción conectados al backend

Archivos revisados: `backend/src/routes/classes.routes.js`,
`backend/src/controllers/class.controller.js` (`searchClasses`, `getClassById`),
`backend/src/services/class.service.js` (`obtenerClase`),
`backend/src/repositories/class.repository.js` (`searchClasses`, `findDetalleById`),
`frontend/src/screens/public/ExploreClasses.jsx`,
`frontend/src/screens/public/ClassDetail.jsx`,
`frontend/src/screens/student/ClassDetailStudent.jsx`,
`frontend/src/screens/student/EnrollmentProcess.jsx`.

### CP-S5-013 — RF-011 — Caso: detalle público de una clase, `200` con horarios e instructor y `404 CLASS_NOT_FOUND`
- **RF:** RF-011 · **Prioridad:** Alta · **Ejecución:** UI + API
- **Precondiciones / datos:** seed recién cargado; no hace falta iniciar sesión (ruta pública).

**Dado** un visitante sin sesión
**Cuando** abre `http://localhost:5173/clases/<ID_SALSA>` (o llama `GET /api/classes/<ID_SALSA>` sin token) y luego `http://localhost:5173/clases/00000000-0000-0000-0000-000000000000`
**Entonces** ve el detalle de la clase existente y un mensaje claro para la inexistente

**Resultado esperado**
- API, clase existente: `200` con la clase (`id`, `instructorId`, `tipoBaile: "Salsa"`, `ciudad: "Barranquilla"`, `modalidad: "presencial"`, `cupoMaximo: 15`, `cupoDisponible: 13`, `precio: "50000"`, `estado: "activa"`), `horarios` (`diaSemana: 1`, `horaInicio: "1970-01-01T18:00:00.000Z"`, `horaFin: "1970-01-01T19:00:00.000Z"`) e `instructor: { "id": "<ID_CAMILA>", "nombre": "Camila Rodríguez" }`.
- API, id inexistente: `404` con `error.code = "CLASS_NOT_FOUND"` y mensaje "Clase no encontrada.". Una clase cancelada **sí** se devuelve (`200`, `estado: "cancelada"`): no se filtra por estado.
- UI, clase existente: etiqueta "DETALLE DE LA CLASE", título "Clase de Salsa", datos "Salsa", "Barranquilla", "Presencial", "Horario" con "Lunes 18:00 - 19:00", "PRECIO DE LA CLASE" con "$50.000", "CUPOS DISPONIBLES" con "13 de 15 cupos", sección "Instructor" con "Camila Rodríguez" / "Instructor de danza", y el botón "Inscribirme". La pantalla tiene el diseño público (sin menú lateral).
- UI, id inexistente: en lugar del detalle aparece el aviso con el título "Clase no encontrada." y el botón "Volver a clases" (lleva a `/clases`). Otros errores muestran el mensaje del backend o "No se pudo cargar la clase.". Mientras carga: "Cargando clase...".
- Verificado en ejecución: `200` con horarios e instructor `{id, nombre}`, `404 CLASS_NOT_FOUND` con id desconocido, y la pantalla pública con una clase real.

**Fuente:** `backend/src/services/class.service.js` (`obtenerClase`), `backend/src/repositories/class.repository.js` (`findDetalleById`), `frontend/src/screens/public/ClassDetail.jsx`, `backend/tests/class.detail.service.test.js`.

### CP-S5-014 — RF-011 — Caso: el botón de inscripción del detalle público según rol y estado de la clase
- **RF:** RF-011 / RF-012 · **Prioridad:** Media · **Ejecución:** UI · **Modifica datos** (las filas de clase cancelada o sin cupos)
- **Precondiciones / datos:** seed recién cargado; sesiones de estudiante1, del padre, de Camila y del admin, y una vista sin sesión. Para la fila "sin cupos": en CP-S5-007 poner el cupo máximo de la Salsa en 2 (`cupoDisponible` 0). Para la fila "cancelada": `DELETE /api/classes/<ID_BACHATA>` con el token de Camila.

**Dado** el detalle público de una clase en `/clases/<id>`
**Cuando** lo abren usuarios con distinto rol y para clases en distinto estado
**Entonces** el botón (y el segundo "Inscribirme" de la sección "¿Listo para comenzar?") se comporta según la tabla

**Resultado esperado**

| Situación | Texto del botón superior | Qué pasa |
| --------- | ------------------------ | -------- |
| Sin sesión | "Inscribirme" | Se abre el aviso "Inicia sesión para continuar" ("Necesitas una cuenta") con los botones "Iniciar sesión" (lleva a `/login`) y "Crear cuenta" (lleva a `/registro`) |
| Estudiante, clase activa con cupos | "Inscribirme" | Navega a `/estudiante/clases/<id>/inscribir` |
| Padre, clase activa con cupos | "Inscribirme" | Navega a `/padre/clases`, la pantalla "Explorar clases" del padre, que usa clases de ejemplo y no la clase abierta (OBS-05) |
| Instructor o administrador | "Solo para estudiantes y padres" | Botón deshabilitado |
| Clase `cancelada` | "Clase no disponible" | Botón deshabilitado |
| Clase con `cupoDisponible` 0 | "Sin cupos disponibles" | Botón deshabilitado |

- La prioridad de los textos es: clase no activa, luego sin cupos, luego rol no permitido. El segundo botón (sección "¿Listo para comenzar?") siempre dice "Inscribirme" y se deshabilita en las mismas situaciones.
- Una clase cancelada sigue abriéndose por su enlace directo (CP-S5-013) pero deja de listarse en `/clases`.

**Fuente:** `frontend/src/screens/public/ClassDetail.jsx` (`ENROLLMENT_ROUTES`, `getEnrollLabel`, `handleEnroll`), `frontend/src/screens/parent/ExploreClassesParent.jsx`.

### CP-S5-015 — RF-011 — Caso: filtro por tipo de baile, alias `?tipo=` y lista desplegable
- **RF:** RF-011 · **Prioridad:** Alta · **Ejecución:** API + UI · **Modifica datos** (solo la parte de Cumbia)
- **Precondiciones / datos:** seed recién cargado (Salsa y Bachata en Barranquilla, Danza urbana en Medellín); para la parte de Cumbia, crear la clase de CP-S5-001.

**Dado** el buscador público de clases
**Cuando** se filtra por tipo, con el parámetro `tipo` (el que envía la pantalla) o `tipoBaile` (el nombre original), y con el desplegable "Tipo de baile" de `/clases`
**Entonces** ambos parámetros dan el mismo resultado y la pantalla filtra por el tipo elegido

**Resultado esperado**
- API: `GET /api/classes/search?tipo=Salsa` y `GET /api/classes/search?tipoBaile=Salsa` devuelven lo mismo: un arreglo con la Salsa (solo clases `activa`). Cada elemento trae `horarios` (con las horas ISO) e `instructor: { id, nombre }`. Si vienen los dos parámetros, `tipoBaile` tiene prioridad (`?tipoBaile=Salsa&tipo=Bachata` devuelve la Salsa). `?tipo=Bachata&ciudad=Medell%C3%ADn` devuelve `[]` (no es un error); sin parámetros devuelve las 3 clases del seed.
- Un valor vacío (`?tipo=`) se trata como un tipo vacío no devuelve clases: `GET /api/classes/search?tipo=` responde `200` con `[]` (verificado en ejecución el 2026-10-18; la pantalla nunca envía el parámetro vacío, por eso "Todos los tipos" sí lista las clases).
- UI: en `http://localhost:5173/clases` el desplegable "Tipo de baile" ofrece "Todos los tipos", "Salsa", "Bachata", "Danza urbana", "Contemporánea" y "Folclor". Elegir "Salsa" pide `GET /api/classes/search?tipo=Salsa` (pestaña Red) y la lista queda con "Clase de Salsa" (el contador dice "1 clases"). Abrir `http://localhost:5173/clases?tipo=Salsa` entra con el filtro ya aplicado, y `?ciudad=Barranquilla` hace lo mismo con la ciudad. "Limpiar" restablece los filtros.
- Limitación: la lista de tipos es fija (OBS-06). Una clase creada con otro tipo (por ejemplo "Cumbia", CP-S5-001) no tiene opción en el desplegable. Abrir `/clases?tipo=Cumbia` sí la lista (el parámetro llega al backend y la pantalla la conserva), aunque el desplegable no tiene esa opción (qué texto muestra el campo en ese caso, por confirmar en el navegador); y escribir "cumbia" en el buscador de texto también la encuentra. La comparación de la pantalla distingue mayúsculas: una clase creada como "salsa" (minúscula) la devuelve el backend para `?tipo=Salsa` pero la pantalla la oculta (OBS-06).
- Verificado en ejecución por API: `?tipo=Salsa` equivale a `?tipoBaile=Salsa` y los ítems incluyen horarios e instructor.

**Fuente:** `backend/src/controllers/class.controller.js` (`searchClasses`: `req.query.tipoBaile ?? req.query.tipo`), `backend/src/repositories/class.repository.js` (`searchClasses`), `frontend/src/services/classes.service.js` (`searchClasses`), `frontend/src/screens/public/ExploreClasses.jsx` (`danceTypeOptions`, `filteredClasses`), `backend/tests/class.controller.test.js`.

### CP-S5-016 — RF-011 / RF-012 / RF-013 — Caso: flujo integrado de explorar, ver detalle, inscribirse y pagar
- **RF:** RF-011 / RF-012 / RF-013 (integración con RF-010 y RF-015) · **Prioridad:** Alta · **Ejecución:** UI + API · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado; sesión de `estudiante1@danzas.app`, que no está inscrita en la Bachata (12 de 12 cupos libres, miércoles 19:15-20:15, $45.000).

**Dado** una estudiante con sesión iniciada que busca una clase nueva
**Cuando** entra a `/clases`, pulsa "Ver clase →" en "Clase de Bachata", en el detalle pulsa "Inscribirme", en "Confirma tu inscripción" pulsa "Confirmar y continuar al pago" y en "Confirmar inscripción" pulsa "Confirmar pago (simulado)"
**Entonces** queda inscrita y con el pago aprobado, y el resto del sistema refleja la inscripción

**Resultado esperado**
- `/clases/<ID_BACHATA>` (detalle público): datos reales (Camila Rodríguez, "Miércoles 19:15 - 20:15", "$45.000", "12 de 12 cupos"). "Inscribirme" navega a `/estudiante/clases/<ID_BACHATA>/inscribir`.
- "Confirma tu inscripción" ("Inscripción", "Revisa la información antes de continuar con el pago."): "Clase de Bachata", "Presencial", instructor "Camila Rodríguez", ciudad "Barranquilla", horario "Miércoles 19:15 - 20:15", Resumen con "$45.000" en "Inscripción" y en "Total". Al confirmar el botón dice "Procesando..." y se pasa al pago.
- Pago: la pantalla "Confirmar inscripción" muestra el resumen ($45.000); tras "Confirmar pago (simulado)" aparece "¡Pago aprobado!" y "Tu inscripción fue confirmada correctamente." (detalle completo en CP-S4-001, `casos-prueba-sprint4.md`).
- Datos: `/estudiante/inscripciones` muestra la inscripción "Confirmada"; `GET /api/classes/<ID_BACHATA>` pasa a `cupoDisponible: 11` (el cupo se descuenta al inscribirse y no cambia al pagar); en `/clases` la tarjeta dice "11 disponibles".
- Integración con el resto del sprint: (a) Camila ve "1/12" en `/instructor/clases/<ID_BACHATA>` y "Andrea Pérez" aparece en su lista de asistencia (antes del pago, con la inscripción `pendiente_pago`, no aparecía); (b) el reporte de pagos del administrador (`/admin/reportes`) pasa a 3 pagos y $145.000 (100.000 + 45.000) y `/instructor/pagos` de Camila también (CP-S5-018, CP-S5-028).
- Verificado en ejecución: explorador, detalle público, detalle del estudiante, inscripción y pago simulado funcionaron. Los efectos (a) y (b) están por verificar en ejecución.

**Fuente:** `frontend/src/screens/public/ExploreClasses.jsx`, `frontend/src/screens/public/ClassDetail.jsx`, `frontend/src/screens/student/EnrollmentProcess.jsx`, `frontend/src/screens/student/PaymentCheckout.jsx`, `backend/src/services/enrollment.service.js` (`crearInscripcion`), `backend/src/services/payment.service.js`, `backend/src/repositories/enrollment.repository.js` (`findAlumnosConfirmados`).

### CP-S5-017 — RF-011 / RF-012 — Caso: detalle del estudiante y reinscripción duplicada, `409 ENROLLMENT_ALREADY_EXISTS`
- **RF:** RF-011 / RF-012 · **Prioridad:** Media · **Ejecución:** UI + API
- **Precondiciones / datos:** seed recién cargado; sesión de `estudiante1@danzas.app`, que ya tiene una inscripción confirmada en la Salsa.

**Dado** una estudiante ya inscrita en la Salsa
**Cuando** abre `/estudiante/clases/<ID_SALSA>`, pulsa "Inscribirme" y en "Confirma tu inscripción" pulsa "Confirmar y continuar al pago" (o llama `POST /api/enrollments` con `{"class_id":"<ID_SALSA>"}` y su token)
**Entonces** el backend rechaza la inscripción duplicada

**Resultado esperado**
- El detalle del estudiante carga datos reales: "Clase de Salsa", estado "Disponible", horario "Lunes 18:00 - 19:00", ciudad, modalidad "Presencial", "13 de 15" cupos, instructor "Camila Rodríguez", "Valor de la clase" con "$50.000" y el botón "Inscribirme". La pantalla no sabe que ya está inscrita y sigue ofreciendo el botón (OBS-04).
- Al confirmar: `409` con `error.code = "ENROLLMENT_ALREADY_EXISTS"` y mensaje "Ya existe una inscripción activa en esta clase."; en `EnrollmentProcess.jsx` el mensaje aparece en un recuadro de error sobre el resumen y no se descuenta ningún cupo (`cupoDisponible` sigue en 13).
- Id inexistente en la URL: el detalle muestra el recuadro "No se encontró la clase.".
- El botón "← Volver a mis clases" lleva a `/estudiante/clases`, que es una pantalla "Próximamente" (OBS-07). La pantalla `/estudiante/clases/:id` no se enlaza desde el explorador público (que lleva a `/clases/:id`), solo desde el panel del estudiante y por URL.
- Una inscripción cancelada no cuenta como activa: tras cancelarla (CP-S4-003) la estudiante puede volver a inscribirse.
- Verificado en ejecución: el detalle del estudiante cargó con datos reales. La inscripción duplicada y su mensaje están por verificar en ejecución.

**Fuente:** `backend/src/services/enrollment.service.js` (`ERRORES_DE_CREACION.INSCRIPCION_DUPLICADA`), `backend/src/repositories/enrollment.repository.js` (`crearConDecrementoDeCupo`), `frontend/src/screens/student/ClassDetailStudent.jsx`, `frontend/src/screens/student/EnrollmentProcess.jsx`.

---

## RF-015 — Reportes de pagos (administrador e instructor)

Archivos revisados: `backend/src/routes/reports.routes.js`,
`backend/src/controllers/report.controller.js`,
`backend/src/services/report.service.js` (`reportePagos`),
`backend/src/repositories/payment.repository.js` (`buscarParaReporte`),
`frontend/src/screens/admin/reports/ReportsAdmin.jsx`,
`frontend/src/screens/instructor/PaymentsInstructor.jsx`,
`frontend/src/components/reports/PaymentsReportResults/PaymentsReportResults.jsx`,
`frontend/src/hooks/usePaymentsReport.js`,
`frontend/src/services/reports.service.js`.

Endpoint: `GET /api/reports/payments` (roles `admin` e `instructor`) con los
parámetros opcionales `desde` y `hasta` (`YYYY-MM-DD`, días de Colombia,
ambos extremos inclusivos), `instructor_id` y `academia` (texto exacto). Los
filtros se combinan con "y". Solo cuenta pagos con `estado = aprobado`; el
reembolso no cambia el estado, solo marca `reembolsado`.

Forma de la respuesta (el seed sin filtros, con el token del admin):
```json
{
  "filtros": { "desde": null, "hasta": null, "instructorId": null, "academia": null },
  "resumen": { "cantidad": 2, "totalRecibido": 100000, "totalReembolsado": 0, "neto": 100000 },
  "pagos": [
    { "id": "...", "inscripcionId": "...", "monto": 50000, "estado": "aprobado",
      "reembolsado": false, "motivoReembolso": null, "procesadoEn": "2026-10-18T...Z",
      "inscripcion": { "id": "...", "claseId": "...", "estado": "confirmada",
        "clase": { "id": "...", "tipoBaile": "Salsa", "instructor": { "id": "...", "nombre": "Camila Rodríguez" } },
        "usuario": { "id": "...", "nombre": "Laura Sánchez" },
        "menor": { "id": "...", "nombre": "Mateo Sánchez" } } } ]
}
```
`monto` y los totales son números (no texto); `menor` es `null` cuando el pago
es de un adulto; los pagos vienen del más reciente al más antiguo.

### CP-S5-018 — RF-015 — Caso: el administrador ve el reporte de pagos sin filtros
- **RF:** RF-015 · **Prioridad:** Alta · **Ejecución:** UI + API
- **Precondiciones / datos:** seed recién cargado; sesión del admin; `<TOKEN_ADMIN>`.

**Dado** los dos pagos aprobados del seed (Andrea y Mateo en la Salsa de Camila, $50.000 cada uno)
**Cuando** el admin abre `http://localhost:5173/admin/reportes` (o llama `GET /api/reports/payments` con su token)
**Entonces** ve los dos pagos y los totales calculados

**Resultado esperado**
- API: `200` con `resumen = { "cantidad": 2, "totalRecibido": 100000, "totalReembolsado": 0, "neto": 100000 }`, `filtros` con los cuatro campos en `null` y `pagos` con 2 elementos (`monto: 50000`, `estado: "aprobado"`, `reembolsado: false`, `motivoReembolso: null`, `clase.tipoBaile: "Salsa"`, `clase.instructor.nombre: "Camila Rodríguez"`). Uno tiene `menor: null` y `usuario.nombre: "Andrea Pérez"`; el otro tiene `menor.nombre: "Mateo Sánchez"` y `usuario.nombre: "Laura Sánchez"` (el acudiente).
- UI: el reporte se genera solo al abrir la pantalla (sin pulsar nada); mientras carga dice "Generando reporte...". Encabezado "Administración" / "Reporte de pagos" ("Consulta los pagos recibidos y los reembolsos, filtrando por fechas, instructor o academia."). Tarjetas: "Pagos" 2, "Total recibido" $100.000, "Total reembolsado" $0 y "Neto" $100.000. Tabla con las columnas "Fecha", "Estudiante o menor", "Clase", "Instructor", "Monto" y "Estado": una fila con "Andrea Pérez", "Salsa", "Camila Rodríguez", "$50.000" y la insignia "Pagado", y otra con "Mateo Sánchez" y, debajo, "Acudiente: Laura Sánchez". La columna "Fecha" muestra día y hora de Colombia.
- Verificado en ejecución: `cantidad` 2, `totalRecibido` 100000, `totalReembolsado` 0, `neto` 100000, y en la UI los 2 pagos, $100.000 y "Acudiente: Laura Sánchez" bajo Mateo.

**Fuente:** `backend/src/services/report.service.js` (`reportePagos`, `proyectarPago`), `backend/src/repositories/payment.repository.js` (`buscarParaReporte`), `frontend/src/screens/admin/reports/ReportsAdmin.jsx`, `frontend/src/components/reports/PaymentsReportResults/PaymentsReportResults.jsx`, `backend/tests/report.service.test.js`.

### CP-S5-019 — RF-015 — Caso (1a): reporte de pagos filtrado por fecha
- **RF:** RF-015 · **Prioridad:** Alta · **Ejecución:** UI + API
- **Precondiciones / datos:** seed recién cargado el mismo día de la prueba (los pagos tienen la fecha y hora de sembrar); `<HOY>`, `<AYER>` y `<MANANA>` (fechas de Colombia, ver "Cómo preparar el entorno"); `<TOKEN_ADMIN>`.

**Dado** dos pagos procesados hoy
**Cuando** el admin filtra con distintos rangos de `desde` y `hasta` (en `/admin/reportes`: campos "Desde" y "Hasta" y botón "Generar reporte"; en la API: `GET /api/reports/payments?desde=...&hasta=...`)
**Entonces** el reporte incluye solo los pagos cuya fecha de proceso cae dentro del rango, contado por días de Colombia y con ambos extremos incluidos

**Resultado esperado**

| Filtro | Resultado |
| ------ | --------- |
| `desde=<HOY>&hasta=<HOY>` | 2 pagos, `totalRecibido` 100000, `neto` 100000 |
| `desde=<HOY>` solo | 2 pagos |
| `hasta=<HOY>` solo | 2 pagos |
| `hasta=<AYER>` | `pagos: []`, `resumen` todo en 0 (`cantidad`, `totalRecibido`, `totalReembolsado` y `neto`) |
| `desde=<MANANA>` (rango futuro) | `pagos: []`, `resumen` todo en 0 |
| `desde=` (vacío) | se ignora el filtro: 2 pagos |

- La respuesta repite los filtros aplicados en `filtros.desde` y `filtros.hasta`.
- UI: con el rango del primer renglón se ven las tarjetas y las dos filas; con los rangos sin pagos se muestra el bloque vacío "No hay pagos para esos filtros" (ver CP-S5-027). Los filtros no se aplican hasta pulsar "Generar reporte".
- Borde del día (opcional, con Prisma Studio): el día va de las 00:00:00 a las 23:59:59.999 de Colombia (UTC-5). Un pago con `procesado_en` = `<HOY>T23:30:00-05:00` (es decir, `<MANANA>T04:30:00Z` en UTC) aparece con `desde=hasta=<HOY>` y no con `desde=hasta=<MANANA>`.
- Verificado en ejecución: un rango futuro devolvió 0 pagos. Los demás rangos están por verificar en ejecución.

**Fuente:** `backend/src/repositories/payment.repository.js` (`inicioDelDia`, `finDelDia`, `buscarParaReporte`), `backend/src/services/report.service.js` (`normalizarFecha`), `frontend/src/screens/admin/reports/ReportsAdmin.jsx`, `backend/tests/report.repositories.test.js`.

### CP-S5-020 — RF-015 — Caso (1b): reporte de pagos filtrado por instructor
- **RF:** RF-015 · **Prioridad:** Alta · **Ejecución:** UI + API · **Modifica datos** (solo la parte B)
- **Precondiciones / datos:** seed recién cargado; `<TOKEN_ADMIN>`, `<ID_CAMILA>`, `<ID_JULIAN>`, `<ID_VALENTINA>`. Parte B: estudiante2 paga su inscripción (`POST /api/enrollments/<ID_INSC_E2>/simulate-payment` con `<TOKEN_E2>`; $40.000 en la Danza urbana de Julián), para que el filtro discrimine entre dos instructores.

**Dado** pagos de clases de distintos instructores
**Cuando** el admin elige un instructor en el campo "Instructor" de `/admin/reportes` (o llama `GET /api/reports/payments?instructor_id=<id>`)
**Entonces** el reporte incluye solo los pagos de las clases de ese instructor

**Resultado esperado**
- Parte A (seed intacto): `instructor_id=<ID_CAMILA>` devuelve los 2 pagos (`cantidad` 2, `totalRecibido` 100000, `filtros.instructorId` = `<ID_CAMILA>`); `instructor_id=<ID_JULIAN>` y `instructor_id=<ID_VALENTINA>` devuelven `pagos: []` con el resumen en 0. Un id que no existe también devuelve `pagos: []` (no es un error).
- Parte B (tras el pago de estudiante2): sin filtros, `cantidad` 3, `totalRecibido` 140000, `neto` 140000. Con `<ID_JULIAN>`: `cantidad` 1, `totalRecibido` 40000 y un pago de "Santiago Mejía" en "Danza urbana" con instructor "Julián Torres". Con `<ID_CAMILA>`: `cantidad` 2, `totalRecibido` 100000.
- UI: el campo "Instructor" lista a "Camila Rodríguez", "Julián Torres" y "Valentina Gómez" (todos los usuarios con rol instructor, tomados de `GET /api/admin/users`) y la opción "Todos los instructores". Elegir uno y pulsar "Generar reporte" muestra solo sus pagos; con un instructor sin pagos aparece "No hay pagos para esos filtros". Si la lista de instructores no se puede cargar, un aviso "Lista de instructores no disponible" explica que el filtro por instructor no está disponible.
- Se combina con las fechas (por ejemplo `instructor_id=<ID_CAMILA>&desde=<MANANA>` devuelve `pagos: []`).
- Verificado en ejecución: el admin filtrando por `instructor_id` funciona.

**Fuente:** `backend/src/repositories/payment.repository.js` (`buscarParaReporte`: `instructorId` en `inscripcion.clase`), `backend/src/services/report.service.js` (`reportePagos`), `frontend/src/screens/admin/reports/ReportsAdmin.jsx` (`getUsers`, selector "Instructor").

### CP-S5-021 — RF-015 — Caso (1c): reporte de pagos filtrado por academia
- **RF:** RF-015 · **Prioridad:** Alta · **Ejecución:** UI + API · **Modifica datos** (solo la parte B)
- **Precondiciones / datos:** seed recién cargado; `<TOKEN_ADMIN>`. Academias del seed: "Academia Ritmo Caribe" (solicitud `aprobada` de Camila) y "Academia Nuevos Pasos" (solicitud `pendiente` de Valentina). Julián es independiente (solicitud aprobada sin nombre de academia). Parte B: estudiante2 paga como en CP-S5-020.

**Dado** pagos de instructores con y sin academia
**Cuando** el admin escribe el nombre en el campo "Academia" de `/admin/reportes` y pulsa "Generar reporte" (o llama `GET /api/reports/payments?academia=Academia%20Ritmo%20Caribe`)
**Entonces** el reporte incluye los pagos de las clases de los instructores con una solicitud **aprobada** de esa academia

**Resultado esperado**
- `academia=Academia Ritmo Caribe`: `200` con `cantidad` 2, `totalRecibido` 100000 (los pagos de Camila). `filtros.academia` repite el texto.
- `academia=Academia Nuevos Pasos`: `pagos: []` (la solicitud está pendiente y Valentina no tiene pagos). `academia=Academia Inexistente`: `pagos: []`.
- Parte B (Julián con un pago de $40.000): `academia=Academia Ritmo Caribe` sigue devolviendo solo los 2 pagos de Camila (Julián no pertenece a ninguna academia y no aparece con ningún nombre). Combinado, `academia=Academia Ritmo Caribe&instructor_id=<ID_JULIAN>` devuelve `pagos: []` (los filtros se suman con "y").
- Un valor vacío o de solo espacios en `academia` se ignora (devuelve todos los pagos).
- La coincidencia es por el texto exacto del nombre; si distingue mayúsculas depende del collation de la base (por confirmar en ejecución).
- La academia de un pago se deduce de la solicitud aprobada del instructor, porque la clase no guarda a qué academia pertenece (OBS-08). Un instructor con varias academias aprobadas aparecería en el filtro de cada una.
- Por verificar en ejecución.

**Fuente:** `backend/src/repositories/payment.repository.js` (`instructor.solicitudes.some({ estado: "aprobada", nombreAcademia })`), `backend/src/services/report.service.js` (`normalizarTexto`), `frontend/src/screens/admin/reports/ReportsAdmin.jsx`, `backend/prisma/seed.js`.

### CP-S5-022 — RF-015 — Caso: pagos reembolsados en el reporte (cancelación de la clase por el instructor)
- **RF:** RF-015 (RF-009) · **Prioridad:** Media · **Ejecución:** API + UI · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado; `<TOKEN_CAMILA>`, `<TOKEN_ADMIN>`. Anotar en Prisma Studio (tabla `pago`) el valor de `procesado_en` de los dos pagos antes de cancelar.

**Dado** los dos pagos aprobados de la Salsa
**Cuando** Camila cancela la Salsa (`DELETE /api/classes/<ID_SALSA>`, que reembolsa automáticamente a todos; ver CP-S4-005 en `casos-prueba-sprint4.md`) y el admin consulta el reporte
**Entonces** los pagos siguen contando como recibidos y además como reembolsados

**Resultado esperado**
- El `DELETE` responde `200` con `inscripcionesCanceladas: 2` y `reembolsosProcesados: 2`.
- Reporte (API): `cantidad` 2, `totalRecibido` 100000, `totalReembolsado` 100000, `neto` 0. Cada pago conserva `estado: "aprobado"` y tiene `reembolsado: true` y `motivoReembolso: "cancelacion_instructor"`.
- UI (`/admin/reportes`): tarjetas "Total recibido" $100.000, "Total reembolsado" $100.000 y "Neto" $0; en la columna "Estado" cada fila muestra la insignia "Reembolsado" con la nota "Cancelación del instructor". Si el motivo fuera `cancelacion_estudiante_anticipada` la nota diría "Cancelación anticipada del estudiante".
- Limitación conocida: el reembolso sobrescribe `procesado_en` del pago con la fecha del reembolso; en Prisma Studio ese valor cambió respecto de lo anotado. En el reporte, un pago reembolsado cae en el rango de fechas del reembolso y no en el del cobro (OBS-02). Con el seed del mismo día no se nota en pantalla.
- Por verificar en ejecución.

**Fuente:** `backend/src/repositories/enrollment.repository.js` (`cancelarPorClaseDeInstructor`), `backend/src/repositories/payment.repository.js` (`marcarComoReembolsado`), `backend/src/services/report.service.js` (`totalReembolsado`), `frontend/src/components/reports/PaymentsReportResults/PaymentsReportResults.jsx` (`REFUND_REASONS`).

### CP-S5-023 — RF-015 — Caso: el instructor solo ve los pagos de sus propias clases
- **RF:** RF-015 · **Prioridad:** Alta · **Ejecución:** API · **Modifica datos** (solo la parte B)
- **Precondiciones / datos:** seed recién cargado; `<TOKEN_CAMILA>`, `<TOKEN_JULIAN>`, `<ID_CAMILA>`, `<ID_JULIAN>`. Parte B: estudiante2 paga su inscripción (CP-S5-020).

**Dado** un instructor con pagos (Camila) y otro sin ellos (Julián)
**Cuando** cada uno llama `GET /api/reports/payments` sin ningún filtro de instructor
**Entonces** el backend limita el reporte al instructor autenticado

**Resultado esperado**
- Camila: `200` con `cantidad` 2, `totalRecibido` 100000 y `filtros.instructorId` igual a `<ID_CAMILA>` (el backend lo fija aunque no se envíe). Los dos pagos son de la Salsa.
- Julián (seed intacto): `200` con `pagos: []` y el resumen en 0. Parte B: `cantidad` 1 y `totalRecibido` 40000 (solo el pago de su Danza urbana); Camila sigue viendo solo sus 2 pagos.
- Enviar el propio id (`?instructor_id=<ID_CAMILA>` con el token de Camila) da el mismo resultado. Un `instructor_id` vacío se ignora.
- Camila puede usar `desde`, `hasta` y `academia` (por ejemplo `academia=Academia Ritmo Caribe` devuelve sus 2 pagos y `academia=Otra` ninguno); siempre dentro de sus pagos.
- Verificado en ejecución: el instructor ve solo sus pagos.

**Fuente:** `backend/src/services/report.service.js` (`reportePagos`: rama `usuario.rol === "instructor"`), `backend/tests/report.service.test.js`.

### CP-S5-024 — RF-015 — Caso (2): un instructor intenta ver los pagos de otro instructor, `403 FORBIDDEN`
- **RF:** RF-015 · **Prioridad:** Alta · **Ejecución:** API
- **Precondiciones / datos:** seed recién cargado; `<TOKEN_JULIAN>`, `<TOKEN_CAMILA>`, `<TOKEN_ADMIN>`, `<ID_CAMILA>`, `<ID_JULIAN>`.

**Dado** los pagos de Camila
**Cuando** Julián llama `GET /api/reports/payments?instructor_id=<ID_CAMILA>`
**Entonces** el sistema rechaza la consulta y no devuelve ningún dato

**Resultado esperado**
- `403` con `error.code = "FORBIDDEN"` y mensaje "No podés ver los pagos de otro instructor.". La respuesta no incluye `pagos` ni `resumen`.
- Lo mismo con el token de Camila y `instructor_id=<ID_JULIAN>`, o con un `instructor_id` inexistente: `403` (solo se permite el propio id).
- Control: el admin con `instructor_id=<ID_CAMILA>` recibe `200` con los 2 pagos (CP-S5-020).
- La interfaz del instructor (`/instructor/pagos`) no envía `instructor_id` ni ofrece el filtro; este caso se prueba por API o editando la petición.
- Orden de validación: las fechas se validan antes de comprobar el instructor, así que `?desde=2026-10-19&hasta=2026-10-18&instructor_id=<ID_CAMILA>` con el token de Julián responde `400 INVALID_DATE_RANGE` y no `403`.
- Verificado en ejecución: un instructor pidiendo otro `instructor_id` recibe `403`.

**Fuente:** `backend/src/services/report.service.js` (`No podés ver los pagos de otro instructor.`), `backend/src/controllers/report.controller.js` (`instructor_id`), `backend/tests/report.service.test.js`.

### CP-S5-025 — RF-015 — Caso (3): rango de fechas invertido o fecha imposible, `400 INVALID_DATE_RANGE`
- **RF:** RF-015 · **Prioridad:** Alta · **Ejecución:** API + UI
- **Precondiciones / datos:** seed recién cargado; `<TOKEN_ADMIN>` (la validación es idéntica con el token de un instructor).

**Dado** el reporte de pagos
**Cuando** se envían fechas con el rango invertido, fechas que no existen en el calendario o con un formato distinto de `YYYY-MM-DD`
**Entonces** el sistema rechaza la consulta con un error de validación

**Resultado esperado** (todas con `400`, `error.code = "INVALID_DATE_RANGE"` y mensaje "Rango de fechas inválido.")
- Rango invertido: `?desde=2026-10-19&hasta=2026-10-18`.
- Fecha imposible: `?desde=2026-02-30`, `?hasta=2026-02-30`, `?desde=2026-13-01`.
- Formato incorrecto: `?desde=18-10-2026`, `?desde=2026-1-5`, `?desde=hoy`, `?desde=2026-10-18T10:00`.
- Parámetro repetido: `?desde=2026-10-18&desde=2026-10-19`.
- Límite que sí es válido: `?desde=2026-10-18&hasta=2026-10-18` responde `200` (mismo día). Una fecha vacía (`?desde=`) se ignora y también responde `200`.
- Ninguna consulta inválida llega a la base de datos.
- UI: los campos "Desde" y "Hasta" son selectores de fecha del navegador, con `max` = "Hasta" en "Desde" y `min` = "Desde" en "Hasta"; elegir un rango invertido hace que el navegador bloquee el envío con su aviso nativo y no se hace la petición. Si el backend respondiera `INVALID_DATE_RANGE`, la pantalla mostraría el recuadro "No se pudo generar el reporte" con "El rango de fechas no es válido. La fecha inicial no puede ser posterior a la final." (no se alcanza con el uso normal).
- Verificado en ejecución: el rango invertido responde `400 INVALID_DATE_RANGE`. Fechas imposibles y formatos, por lectura de código y de `backend/tests/report.service.test.js`.

**Fuente:** `backend/src/services/report.service.js` (`esFechaValida`, `normalizarFecha`, `fechaInvalida`), `frontend/src/hooks/usePaymentsReport.js` (`ERROR_MESSAGES`), `frontend/src/screens/admin/reports/ReportsAdmin.jsx`.

### CP-S5-026 — RF-015 — Caso: acceso al reporte de pagos según el rol
- **RF:** RF-015 · **Prioridad:** Alta · **Ejecución:** API + UI
- **Precondiciones / datos:** seed recién cargado; `<TOKEN_E1>`, `<TOKEN_PADRE>`, `<TOKEN_ADMIN>`, `<TOKEN_CAMILA>`.

**Dado** el reporte de pagos, reservado a administrador e instructor
**Cuando** lo consultan un estudiante, un padre, un usuario sin sesión y un token inválido
**Entonces** solo se atiende a administrador e instructor

**Resultado esperado**
- Estudiante (`<TOKEN_E1>`) y padre (`<TOKEN_PADRE>`): `403` con `error.code = "FORBIDDEN"` y mensaje "No tenés permiso para acceder a este recurso.".
- Sin cabecera `Authorization`: `401` con `error.code = "UNAUTHORIZED"` y mensaje "Token no provisto o con formato inválido."; token mal formado o vencido: `401 UNAUTHORIZED` "Token inválido o expirado.".
- Administrador e instructor: `200`.
- UI: un estudiante, un padre o un instructor que abre `/admin/reportes` es redirigido a `/no-autorizado` (título "No autorizado", texto "No tenés permiso para ver esta sección."); un administrador que abre `/instructor/pagos` también. Sin sesión, ambas rutas llevan a `/login`.
- Verificado en ejecución: el estudiante recibe `403`.

**Fuente:** `backend/src/routes/reports.routes.js` (`requireRole("admin", "instructor")`), `backend/src/middleware/roleGuard.middleware.js`, `backend/src/middleware/auth.middleware.js`, `frontend/src/routes/ProtectedRoute.jsx`, `frontend/src/routes/AppRouter.jsx`.

### CP-S5-027 — RF-015 — Caso: pantalla `/admin/reportes`, filtros combinados y estado vacío
- **RF:** RF-015 · **Prioridad:** Media · **Ejecución:** UI
- **Precondiciones / datos:** seed recién cargado; sesión del admin en `http://localhost:5173/admin/reportes`.

**Dado** el reporte de pagos en pantalla
**Cuando** el admin cambia filtros, genera el reporte con rangos sin pagos y los vuelve a vaciar
**Entonces** la pantalla muestra los resultados, el estado vacío o el error según corresponda

**Resultado esperado**
- Campos: "Desde" y "Hasta" (fecha), "Instructor" (opción "Todos los instructores") y "Academia" (texto, indicación "Nombre de la academia"), con el botón "Generar reporte". Cambiar un campo no actualiza el reporte hasta pulsar el botón; durante la carga el botón queda deshabilitado.
- Combinar filtros aplica la lógica "y" (por ejemplo "Instructor: Julián Torres" y "Academia: Academia Ritmo Caribe" da vacío).
- Estado vacío (por ejemplo "Desde" y "Hasta" con una fecha futura): se reemplazan las tarjetas y la tabla por el bloque con el título "No hay pagos para esos filtros" y el texto "Prueba con otro rango de fechas o con otros filtros.". Al dejar los campos vacíos y volver a pulsar "Generar reporte" reaparece el reporte completo.
- Error del backend (por ejemplo si se detiene el servidor): recuadro con el título "No se pudo generar el reporte" y el mensaje del error.
- Los importes salen con formato colombiano (ejemplo `$50.000`) y la fecha de cada fila en hora de Colombia.
- Verificado en ejecución: con un rango de fechas futuro aparece "No hay pagos para esos filtros".

**Fuente:** `frontend/src/screens/admin/reports/ReportsAdmin.jsx`, `frontend/src/components/reports/PaymentsReportResults/PaymentsReportResults.jsx`, `frontend/src/hooks/usePaymentsReport.js`.

### CP-S5-028 — RF-015 — Caso: pantalla `/instructor/pagos`, solo pagos propios y sin columna Instructor
- **RF:** RF-015 · **Prioridad:** Alta · **Ejecución:** UI
- **Precondiciones / datos:** seed recién cargado; sesiones de Camila y de Julián (una por vez). Opcional: estudiante2 paga su inscripción (CP-S5-020, parte B) para que Julián tenga un pago.

**Dado** pagos de Camila y ninguno de Julián
**Cuando** cada uno abre `http://localhost:5173/instructor/pagos` (entrada "Pagos" del menú lateral)
**Entonces** ve únicamente los pagos de sus clases

**Resultado esperado**
- Encabezado "Instructor" / "Pagos recibidos" ("Consulta los pagos de tus clases, filtrando por fechas."). Solo hay dos filtros, "Desde" y "Hasta", y el botón "Filtrar". No hay filtros de instructor ni de academia.
- Camila: tarjetas "Pagos" 2, "Total recibido" $100.000, "Total reembolsado" $0 y "Neto" $100.000; tabla con las columnas "Fecha", "Estudiante o menor", "Clase", "Monto" y "Estado" (**no** existe la columna "Instructor"), con las filas "Andrea Pérez" ("Pagado") y "Mateo Sánchez" con "Acudiente: Laura Sánchez".
- Julián (seed intacto): el bloque "No hay pagos para esos filtros". Con el pago de estudiante2: 1 pago, $40.000, "Santiago Mejía" y "Danza urbana".
- La pantalla pide `GET /api/reports/payments` sin `instructor_id` (pestaña Red): el backend es quien limita el reporte al instructor.
- Filtrar con una fecha futura vacía el reporte, igual que en CP-S5-027.
- Verificado en ejecución: el instructor ve solo sus pagos y sin la columna Instructor.

**Fuente:** `frontend/src/screens/instructor/PaymentsInstructor.jsx` (`showInstructor={false}`), `frontend/src/components/reports/PaymentsReportResults/PaymentsReportResults.jsx`, `frontend/src/routes/AppRouter.jsx`.

---

## RF-016 — Reporte de asistencia para padres

Archivos revisados: `backend/src/routes/reports.routes.js`,
`backend/src/services/report.service.js` (`reporteAsistencia`),
`backend/src/repositories/attendance.repository.js` (`findByMenor`),
`backend/src/repositories/dependent.repository.js`,
`frontend/src/screens/parent/AttendanceReport.jsx`,
`frontend/src/services/reports.service.js`.

Endpoint: `GET /api/reports/attendance?dependent_id=<id del menor>` (solo rol
`padre`). Cuenta las sesiones que tienen asistencia registrada (CP-S5-009); el
porcentaje es `presentes / sesiones × 100` con un decimal y vale 0 si no hay
sesiones.

### CP-S5-029 — RF-016 — Caso: el padre consulta la asistencia de su menor, con sesiones, presentes y porcentaje
- **RF:** RF-016 · **Prioridad:** Alta · **Ejecución:** API · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado; `<TOKEN_CAMILA>`, `<TOKEN_PADRE>`, `<ID_MATEO>`, `<ID_SALSA>`. Obtener `<ID_INSC_E1>` e `<ID_INSC_MATEO>` con `GET /api/classes/<ID_SALSA>/attendance?fecha=2026-09-28` (token de Camila). Registrar tres sesiones con `POST /api/classes/<ID_SALSA>/attendance` (token de Camila), todas con `registros` para ambos alumnos: `fechaSesion` `2026-09-28` (Andrea `true`, Mateo `true`), `2026-10-05` (Andrea `true`, Mateo `true`) y `2026-10-12` (Andrea `true`, Mateo `false`). Cada `POST` responde `201 { "count": 2 }`.

**Dado** Mateo con 3 sesiones de asistencia en la Salsa (2 presente y 1 ausente)
**Cuando** Laura llama `GET /api/reports/attendance?dependent_id=<ID_MATEO>` con su token
**Entonces** recibe el resumen y el detalle de la asistencia de Mateo

**Resultado esperado**
- `200` con
  ```json
  { "menor": { "id": "<ID_MATEO>", "nombre": "Mateo Sánchez" },
    "resumen": { "sesiones": 3, "presentes": 2, "ausentes": 1, "porcentaje": 66.7 },
    "clases": [ { "claseId": "<ID_SALSA>", "tipoBaile": "Salsa", "ciudad": "Barranquilla",
      "instructor": { "nombre": "Camila Rodríguez" },
      "sesiones": 3, "presentes": 2, "ausentes": 1, "porcentaje": 66.7,
      "detalle": [ { "fecha": "2026-10-12", "asistio": false },
                   { "fecha": "2026-10-05", "asistio": true },
                   { "fecha": "2026-09-28", "asistio": true } ] } ] }
  ```
  El `detalle` va de la sesión más reciente a la más antigua. La asistencia de Andrea (adulta) y la de otros menores no entra en el reporte de Mateo.
- Variantes del porcentaje: 1 presente de 3 sesiones da 33.3; 3 de 3 da 100; 0 sesiones da 0.
- Si un menor tiene asistencia en dos clases, `clases` trae una entrada por clase, ordenadas por su sesión más reciente, y `resumen` suma todas.
- Verificado en ejecución: con 3 sesiones (2 presentes y 1 ausente) el porcentaje fue 66.7.

**Fuente:** `backend/src/services/report.service.js` (`reporteAsistencia`, `calcularPorcentaje`), `backend/src/repositories/attendance.repository.js` (`findByMenor`), `backend/tests/report.service.test.js`.

### CP-S5-030 — RF-016 — Caso: menor sin asistencia registrada, resumen en cero y estado vacío
- **RF:** RF-016 · **Prioridad:** Media · **Ejecución:** API + UI
- **Precondiciones / datos:** seed recién cargado (ni Isabella ni Mateo tienen asistencias; la única asistencia sembrada es la de Andrea); `<TOKEN_PADRE>`, `<ID_ISABELLA>`, `<ID_MATEO>`.

**Dado** una menor sin inscripciones (Isabella) y un menor con inscripción pero sin asistencia registrada (Mateo)
**Cuando** Laura consulta la asistencia de cada uno (`GET /api/reports/attendance?dependent_id=<id>` o `/padre/asistencia`)
**Entonces** el reporte responde correctamente con todo en cero y la pantalla lo informa

**Resultado esperado**
- API: `200` con `menor: { id, nombre }` (`"Isabella Sánchez"` / `"Mateo Sánchez"`), `resumen = { "sesiones": 0, "presentes": 0, "ausentes": 0, "porcentaje": 0 }` y `clases: []`. No hay división por cero.
- UI (`http://localhost:5173/padre/asistencia`, con el hijo elegido en el selector "Hijo"): en lugar de las tarjetas aparece el bloque con el título "Todavía no hay asistencia registrada" y el texto "Isabella Sánchez aún no tiene sesiones con asistencia registrada." (con el nombre del hijo elegido).
- Verificado en ejecución: Isabella muestra el estado vacío.

**Fuente:** `backend/src/services/report.service.js` (`estadisticas`), `frontend/src/screens/parent/AttendanceReport.jsx` (`resumen.sesiones === 0`).

### CP-S5-031 — RF-016 — Caso (4): un padre intenta ver la asistencia de un menor que no es suyo, `403`
- **RF:** RF-016 · **Prioridad:** Alta · **Ejecución:** API + UI · **Modifica datos** (registra un segundo padre)
- **Precondiciones / datos:** seed recién cargado. Registrar un segundo padre: `POST /api/auth/register` con `{"rol":"padre","nombre":"Padre Dos","correo":"padre2@danzas.app","contraseña":"Prueba1234","ciudad":"Cali"}` (`201`) e iniciar sesión con él (`<TOKEN_PADRE2>`). `<ID_MATEO>` (de la sesión de Laura).

**Dado** Mateo, que pertenece a Laura
**Cuando** Padre Dos llama `GET /api/reports/attendance?dependent_id=<ID_MATEO>` con `<TOKEN_PADRE2>`
**Entonces** el sistema rechaza la consulta y no entrega ningún dato del menor

**Resultado esperado**
- `403` con `error.code = "FORBIDDEN"` y mensaje "No tenés permiso para ver la asistencia de este menor.". El cuerpo no incluye el nombre del menor ni su asistencia.
- Menor inexistente (`dependent_id=00000000-0000-0000-0000-000000000000`): `404` con `error.code = "DEPENDENT_NOT_FOUND"` y mensaje "Menor no encontrado.".
- Sin `dependent_id` (o vacío, o repetido): `400` con `error.code = "MISSING_DEPENDENT"` y mensaje "Indicá el hijo a consultar.".
- Control: con el token de Laura y `dependent_id=<ID_MATEO>` la respuesta es `200` (CP-S5-029).
- Un `404` para un menor inexistente y un `403` para uno ajeno permiten saber si un id existe; no es explotable en la práctica porque los ids son UUID.
- UI: con `<TOKEN_PADRE2>` (sin menores registrados), `/padre/asistencia` muestra el bloque "No tienes menores registrados" ("Registra a tus hijos para consultar su asistencia.", botón "Registrar menor" que lleva a `/padre/menores/nuevo`) y no hay forma de elegir a Mateo. Si la petición llegara a devolver estos códigos, la pantalla mostraría el recuadro "No se pudo cargar la asistencia" con "No tienes permiso para ver la asistencia de este menor.", "No se encontró al menor seleccionado." o "Selecciona un hijo para consultar su asistencia." según el código.
- Verificado en ejecución: `400` sin `dependent_id`, `404` con un menor desconocido y `403` con un menor ajeno.

**Fuente:** `backend/src/services/report.service.js` (`reporteAsistencia`: `MISSING_DEPENDENT`, `DEPENDENT_NOT_FOUND`, `menor.padreId !== usuario.id`), `frontend/src/screens/parent/AttendanceReport.jsx` (`ERROR_MESSAGES`), `backend/tests/report.service.test.js`.

### CP-S5-032 — RF-016 — Caso: pantalla `/padre/asistencia`, selector de hijo, resumen y detalle por clase
- **RF:** RF-016 · **Prioridad:** Media · **Ejecución:** UI · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado y las tres sesiones de CP-S5-029 registradas; sesión de `padre@danzas.app` (Laura).

**Dado** Mateo con 3 sesiones registradas e Isabella sin ninguna
**Cuando** Laura entra a `http://localhost:5173/padre/asistencia` (entrada "Asistencia" del menú lateral) y cambia de hijo en el selector "Hijo"
**Entonces** ve la asistencia del hijo elegido

**Resultado esperado**
- Encabezado "Padre de familia" / "Asistencia de mis hijos" ("Consulta la asistencia de cada uno de tus hijos a sus clases."). Mientras cargan los datos: "Cargando menores..." y "Cargando asistencia...".
- El selector "Hijo" lista a "Mateo Sánchez" e "Isabella Sánchez" y, mientras no se elige, queda seleccionado el primero que devuelve `GET /api/users/dependents`.
- Mateo: tarjetas "Sesiones" 3, "Presentes" 2, "Ausentes" 1 y "Asistencia" 66,7%; una tarjeta de clase "Salsa" con "Barranquilla · Instructor: Camila Rodríguez", "66,7%", una barra de progreso, el texto "2 presentes y 1 ausentes en 3 sesiones" (con ese plural, OBS-14) y la lista de sesiones: "12 de octubre de 2026" con la insignia "Ausente", "5 de octubre de 2026" "Presente" y "28 de septiembre de 2026" "Presente". Las fechas no se corren un día.
- Isabella: el bloque "Todavía no hay asistencia registrada" (CP-S5-030). Al cambiar de hijo se recarga el reporte.
- Padre sin menores: ver CP-S5-031.
- Verificado en ejecución: Isabella con estado vacío y el resumen de Mateo.

**Fuente:** `frontend/src/screens/parent/AttendanceReport.jsx`, `frontend/src/services/reports.service.js` (`getAttendanceReport`), `backend/src/controllers/dependent.controller.js` (`getDependents`).

### CP-S5-033 — RF-016 — Caso: acceso al reporte de asistencia según el rol
- **RF:** RF-016 · **Prioridad:** Media · **Ejecución:** API
- **Precondiciones / datos:** seed recién cargado; `<TOKEN_E1>`, `<TOKEN_ADMIN>`, `<TOKEN_CAMILA>`, `<ID_MATEO>`.

**Dado** el reporte de asistencia, reservado al rol padre
**Cuando** lo consultan un estudiante, un administrador, un instructor y un usuario sin sesión (`GET /api/reports/attendance?dependent_id=<ID_MATEO>`)
**Entonces** solo se atiende al padre

**Resultado esperado**
- Estudiante, administrador e instructor: `403` con `error.code = "FORBIDDEN"` y mensaje "No tenés permiso para acceder a este recurso." (lo corta el guardián de rol antes de mirar el menor).
- Sin token: `401 UNAUTHORIZED` "Token no provisto o con formato inválido.".
- En la UI, `/padre/asistencia` solo se abre con el rol `padre`; otros roles van a `/no-autorizado` y sin sesión a `/login`.
- Verificado en ejecución: el estudiante recibe `403`.

**Fuente:** `backend/src/routes/reports.routes.js` (`requireRole("padre")`), `backend/src/middleware/roleGuard.middleware.js`, `frontend/src/routes/AppRouter.jsx`.

---

## Transversales: sesión, seguridad y navegación

### CP-S5-034 — RF-007 — Caso: el token de un usuario suspendido deja de servir (`403 ACCOUNT_SUSPENDED`)
- **RF:** RF-007 · **Prioridad:** Alta · **Ejecución:** API · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado; `<TOKEN_E1>` obtenido **antes** de suspender; `<TOKEN_ADMIN>`; `<ID_E1>`.

**Dado** estudiante1 con una sesión abierta y un token todavía vigente
**Cuando** el admin la suspende (`PATCH /api/admin/users/<ID_E1>/suspend` con `<TOKEN_ADMIN>`, responde `200` con "Usuario suspendido correctamente") y estudiante1 usa su token anterior en cualquier endpoint protegido (por ejemplo `GET /api/users/<ID_E1>/enrollments`)
**Entonces** el backend rechaza el token en el acto, sin esperar a que expire

**Resultado esperado**
- Token anterior: `403` con `error.code = "ACCOUNT_SUSPENDED"` y mensaje "Tu cuenta está suspendida.". Vale para todos los endpoints con sesión (clases, inscripciones, reportes, asistencia).
- Un nuevo inicio de sesión (`POST /api/auth/login`): `403` con `error.code = "ACCOUNT_SUSPENDED"` y mensaje distinto, "Tu cuenta está suspendida. Contacta al administrador." (OBS-11).
- El rol y la suspensión se leen de la base en cada petición: un token cuyo usuario fue eliminado responde `401 UNAUTHORIZED` "Token inválido o expirado.".
- Un usuario con `estado = pendiente` (Valentina) no se bloquea.
- Una cuenta no puede suspenderse a sí misma: el admin suspendiéndose a sí mismo recibe un error (mensaje "No puedes suspender tu propia cuenta.").
- Cómo reacciona la interfaz con la sesión abierta de un usuario suspendido (qué pantalla ve) por confirmar en el navegador.
- Verificado en ejecución: el token de un usuario suspendido responde `403 ACCOUNT_SUSPENDED` "Tu cuenta está suspendida.".

**Fuente:** `backend/src/middleware/auth.middleware.js` (`usuario.estado === "suspendido"`), `backend/src/services/auth.service.js` (`login`), `backend/src/services/user.service.js` (`suspenderUsuario`), `backend/tests/auth.middleware.test.js`.

### CP-S5-035 — RF-003 — Caso: el token de recuperación de contraseña no sirve como sesión (`401 UNAUTHORIZED`)
- **RF:** RF-003 (seguridad) · **Prioridad:** Alta · **Ejecución:** API
- **Precondiciones / datos:** seed recién cargado; `<ID_E1>` y `<TOKEN_E1>`. En desarrollo el enlace de recuperación no se imprime en la consola del backend (solo la línea `[correo simulado]`), así que se firma un token igual al de recuperación con el secreto del entorno, desde `backend/`: `node -e "require('dotenv').config(); console.log(require('jsonwebtoken').sign({id:'<ID_E1>',tipo:'recuperacion_password'}, process.env.JWT_SECRET, {expiresIn:'30m'}))"` (se obtiene `<TOKEN_RECUPERACION>`). No usarlo en `POST /api/auth/reset-password`, que cambiaría la contraseña de la cuenta.

**Dado** un token firmado con el secreto del servidor y con `tipo: "recuperacion_password"` (el que emite `POST /api/auth/forgot-password`)
**Cuando** se usa como `Authorization: Bearer <TOKEN_RECUPERACION>` en endpoints protegidos (`GET /api/users/<ID_E1>/enrollments`, `GET /api/classes/my-classes`, `GET /api/reports/payments`)
**Entonces** el backend lo rechaza como sesión

**Resultado esperado**
- `401` con `error.code = "UNAUTHORIZED"` y mensaje "Token inválido o expirado." en todos los casos; el middleware ni siquiera consulta al usuario.
- Control: `<TOKEN_E1>` (el de `POST /api/auth/login`, con `{ id, rol }`) en `GET /api/users/<ID_E1>/enrollments` responde `200`.
- Variantes: un token firmado con `{id}` sin `rol` y un token firmado con otro secreto también responden `401 UNAUTHORIZED` "Token inválido o expirado.". Sin cabecera: `401` "Token no provisto o con formato inválido.".
- Motivo: el rol se lee de la base, así que un token de recuperación habría quedado autenticado como el usuario real.
- Verificado en ejecución el 2026-10-18 (token `{ id, tipo: "recuperacion_password" }` firmado con el secreto del entorno contra `GET /api/classes/my-classes`: `401`); además cubierto por `backend/tests/auth.middleware.test.js`.

**Fuente:** `backend/src/middleware/auth.middleware.js` (`payload.tipo || !payload.rol`), `backend/src/services/auth.service.js` (`recuperarPassword`), `backend/tests/auth.middleware.test.js`.

### CP-S5-036 — RF-005 — Caso: cada enlace del menú lateral de cada rol lleva a una pantalla real o a "Próximamente"
- **RF:** RF-005 / navegación por rol · **Prioridad:** Alta · **Ejecución:** UI
- **Precondiciones / datos:** seed cargado; una sesión por rol (estudiante1, padre, Camila y admin), una a la vez. Abrir el menú de `frontend/src/components/layout/Sidebar/Sidebar.jsx` (sección "MENÚ PRINCIPAL" más el enlace "Mi perfil" de la parte inferior) y pulsar cada entrada.

**Dado** el menú lateral de cada rol
**Cuando** se pulsa cada enlace
**Entonces** ninguno cae en la página de inicio (`/`) ni en `/no-autorizado`: se abre su pantalla o la pantalla provisoria

**Resultado esperado**
- Una pantalla provisoria muestra el área en pequeño (Administración, Estudiante, Padre de familia o Instructor), el título de la sección, el bloque "Próximamente" con la descripción de la tabla y el botón "Volver al panel" (lleva al panel del rol: `/admin`, `/estudiante`, `/padre` o `/instructor`).
- Resultado por enlace (33 enlaces: 16 pantallas reales y 17 "Próximamente"):

| Rol | Enlace | Ruta | Resultado |
| --- | ------ | ---- | --------- |
| Estudiante | Dashboard | `/estudiante` | Pantalla real |
| Estudiante | Explorar clases | `/clases` | Pantalla real (pública; sale del panel y del menú) |
| Estudiante | Mis inscripciones | `/estudiante/inscripciones` | Pantalla real |
| Estudiante | Mis clases | `/estudiante/clases` | Próximamente: "Aquí verás las clases en las que estás inscrito y sus horarios." |
| Estudiante | Asistencia | `/estudiante/asistencia` | Próximamente: "Aquí podrás consultar tu asistencia a las clases." |
| Estudiante | Pagos | `/estudiante/pagos` | Próximamente: "Aquí podrás consultar el historial de tus pagos." |
| Estudiante | Notificaciones | `/estudiante/notificaciones` | Próximamente: "Por ahora los avisos del sistema se envían por correo electrónico." |
| Estudiante | Mi perfil | `/estudiante/perfil` | Próximamente: "La gestión de tu perfil estará disponible más adelante." |
| Padre | Dashboard | `/padre` | Pantalla real |
| Padre | Explorar clases | `/padre/clases` | Pantalla real con clases de ejemplo (OBS-03) |
| Padre | Mis hijos | `/padre/menores` | Pantalla real |
| Padre | Inscripciones | `/padre/inscripciones` | Pantalla real |
| Padre | Asistencia | `/padre/asistencia` | Pantalla real (CP-S5-032) |
| Padre | Pagos | `/padre/pagos` | Próximamente: "Aquí podrás consultar el historial de pagos de las inscripciones de tus hijos." |
| Padre | Notificaciones | `/padre/notificaciones` | Próximamente (mismo texto de avisos por correo) |
| Padre | Mi perfil | `/padre/perfil` | Próximamente (texto del perfil) |
| Instructor | Dashboard | `/instructor` | Pantalla real |
| Instructor | Mis clases | `/instructor/clases` | Pantalla real |
| Instructor | Estudiantes | `/instructor/estudiantes` | Próximamente: "Aquí verás los estudiantes inscritos en tus clases." |
| Instructor | Asistencia | `/instructor/asistencia` | Próximamente: "Aquí podrás registrar la asistencia de tus clases." (OBS-07: la asistencia real se toma en el detalle de cada clase) |
| Instructor | Calendario | `/instructor/calendario` | Próximamente: "Aquí verás el calendario semanal de tus clases." |
| Instructor | Pagos | `/instructor/pagos` | Pantalla real (CP-S5-028) |
| Instructor | Reportes | `/instructor/reportes` | Próximamente: "Aquí podrás generar reportes de los pagos de tus clases." |
| Instructor | Notificaciones | `/instructor/notificaciones` | Próximamente (mismo texto de avisos por correo) |
| Instructor | Mi perfil | `/instructor/perfil` | Próximamente (texto del perfil) |
| Administrador | Dashboard | `/admin` | Pantalla real |
| Administrador | Usuarios | `/admin/usuarios` | Pantalla real |
| Administrador | Academias | `/admin/academias` | Pantalla real |
| Administrador | Clases | `/admin/classes` | Pantalla real con clases de ejemplo (OBS-03) |
| Administrador | Pagos | `/admin/pagos` | Próximamente: "Aquí podrás consultar los pagos recibidos en la plataforma." (OBS-07) |
| Administrador | Reportes | `/admin/reportes` | Pantalla real (CP-S5-018) |
| Administrador | Notificaciones | `/admin/notificaciones` | Próximamente (mismo texto de avisos por correo) |
| Administrador | Mi perfil | `/admin/perfil` | Próximamente (texto del perfil) |

- La lista de las secciones aún "Próximamente" sale de `frontend/src/routes/comingSoonSections.js`: administrador 3 (Pagos, Notificaciones, Mi perfil), estudiante 5 (Mis clases, Asistencia, Pagos, Notificaciones, Mi perfil), padre 3 (Pagos, Notificaciones, Mi perfil) e instructor 6 (Estudiantes, Asistencia, Calendario, Reportes, Notificaciones, Mi perfil). Cada `path` de ese archivo coincide con un enlace del menú.
- Fuera del menú lateral, las acciones rápidas del panel del padre apuntan a `/padre/hijos` y `/padre/explorar-clases`, rutas que no existen: caen en el comodín y vuelven a `/` (OBS-12, por verificar en el navegador).
- Comprobar también que un rol no puede abrir las rutas de otro (se redirige a `/no-autorizado`).
- La auditoría la hizo con un script quien armó el router; no se verificó en un navegador.

**Fuente:** `frontend/src/components/layout/Sidebar/Sidebar.jsx` (`menuItems` y el enlace "Mi perfil"), `frontend/src/routes/comingSoonSections.js`, `frontend/src/routes/AppRouter.jsx` (`renderComingSoonRoutes`), `frontend/src/components/common/SectionComingSoon/SectionComingSoon.jsx`, `frontend/src/screens/parent/DashboardParent.jsx`.

### CP-S5-037 — RF-006 / RF-008 — Caso: script de backfill de solicitudes de academia (opcional)
- **RF:** RF-006 / RF-008 · **Prioridad:** Baja · **Ejecución:** consola (`backend/`) · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado. En Prisma Studio, tabla `solicitud_academia`, borrar la fila de Valentina para dejarla como una instructora registrada antes de que el alta creara la solicitud.

**Dado** una instructora sin ninguna solicitud de academia
**Cuando** se ejecuta `npm run backfill:solicitudes -- --dry-run`, luego `npm run backfill:solicitudes`, y otra vez `npm run backfill:solicitudes`
**Entonces** el script crea la solicitud faltante una sola vez

**Resultado esperado**
- Antes: Valentina recibe `403 ACADEMY_NOT_APPROVED` con "Aún no tienes una solicitud de academia aprobada. No puedes publicar clases hasta que el administrador la apruebe." al crear una clase.
- `--dry-run`: escribe "[dry-run] Se crearían 1 solicitudes pendientes. No se escribió nada." y no cambia la base.
- Ejecución real: "Instructores sin solicitud: 1. Solicitudes creadas: 1." Se crea una solicitud `pendiente` sin nombre de academia (independiente) para Valentina; el admin la ve en `GET /api/admin/academy-requests`.
- Segunda ejecución real: "Instructores sin solicitud: 0. Solicitudes creadas: 0." (idempotente). Solo toca a instructores sin ninguna solicitud.
- Después: el mismo intento de crear una clase responde `403` con "Tu solicitud de academia sigue pendiente de aprobación. No puedes publicar clases hasta que el administrador la apruebe." (CP-S5-004).
- Verificado en ejecución el 2026-10-18 (con la solicitud de Valentina borrada temporalmente): el `--dry-run` no escribe, la primera ejecución real crea una solicitud `pendiente` con `nombreAcademia` nula y la segunda no crea nada. Además cubierto por `backend/tests/backfill-solicitudes.test.js`.

**Fuente:** `backend/scripts/backfill-solicitudes.js`, `backend/package.json` (script `backfill:solicitudes`), `backend/tests/backfill-solicitudes.test.js`.

---

## Observaciones (discrepancias ERS ↔ código)

**Observaciones anteriores que este sprint resuelve (informativo).** Con las cuatro ramas integradas dejan de ser ciertas: el detalle público `ClassDetail.jsx` ya no es una maqueta y existe `GET /api/classes/:id` (OBS-04 de Sprint 2-3); las pantallas `ClassForm`, `MyClasses`, `ClassDetailInstructor`, `ClassDetailStudent` y `EnrollmentProcess` leen y escriben en el backend y existe `GET /api/classes/my-classes` (OBS-09 de Sprint 1-2); el filtro por tipo del explorador llega al backend (`?tipo=`, OBS-05 (c) de Sprint 2-3); editar `cupoMaximo` recalcula `cupoDisponible` (parte de OBS-10 de Sprint 1-2); el registro de asistencia ya no crea filas duplicadas y la lectura del backend alimenta la pantalla (parte de OBS-11 de Sprint 1-2). Siguen vigentes: la edición acepta `estado` (OBS-10 de Sprint 1-2), el filtro de modalidad en la pantalla pese al ERS y el parpadeo de carga al filtrar (OBS-05 (b) y (d) de Sprint 2-3).

**OBS-01 — RF-008: "Mis clases" no se ordena por "más recientes primero" (Baja).**
`GET /api/classes/my-classes` devuelve las clases en el orden natural de la consulta: el modelo `Clase` no tiene columna de fecha de creación, y ordenar por creación requeriría una migración (lo reconoce un comentario en `class.service.js#listarClasesDelInstructor`). La clase recién creada no queda necesariamente primera. El ERS no fija un orden. Afecta CP-S5-006.

**OBS-02 — RF-015: un reembolso mueve el pago a la fecha del reembolso (Media).**
`marcarComoReembolsado` y `cancelarPorClaseDeInstructor` sobrescriben `procesado_en` con la fecha del reembolso. Un pago reembolsado cae en el rango de fechas del reembolso y no en el del cobro, y la columna "Fecha" del reporte muestra la fecha del reembolso. Los totales del rango "mensual" del cobro pueden no cuadrar con lo recibido ese mes. Es la misma limitación que OBS-02 de Sprint 4 y queda documentada en `report.service.js`. Afecta CP-S5-019 y CP-S5-022.

**OBS-03 — Pantallas de clases del administrador y "Explorar clases" del padre siguen con datos de ejemplo (Alta para la demo).**
`ClassesAdmin.jsx` (`MOCK_CLASSES`) y `ClassDetailAdmin.jsx` (`MOCK_CLASS_DETAIL`, que muestra siempre la misma clase sea cual sea el `:id`) no leen el backend; `ExploreClassesParent.jsx` usa `demoClasses` con ids numéricos (101 a 103), que el backend rechaza al inscribir. Además el botón "Nueva clase" de `/admin/classes` navega a `/admin/classes/create`, que no es una ruta propia: coincide con `/admin/classes/:id` y abre el detalle de ejemplo. Estas pantallas no reflejan las clases creadas en el sprint (por ejemplo, una clase nueva de Camila no aparece en `/admin/classes`). Afecta CP-S5-002 y CP-S5-036; el flujo del padre ya estaba descrito en OBS-06 de Sprint 4.

**OBS-04 — RF-012: el detalle del estudiante ofrece "Inscribirme" aunque ya esté inscrita (Baja).**
`ClassDetailStudent.jsx` no consulta las inscripciones del usuario, así que el botón "Inscribirme" sigue activo para una clase en la que ya tiene una inscripción activa. El backend rechaza el duplicado con `409 ENROLLMENT_ALREADY_EXISTS` ("Ya existe una inscripción activa en esta clase."), que se ve recién en "Confirma tu inscripción". Además la pantalla se alcanza solo desde el panel o por URL, y su "← Volver a mis clases" lleva a una pantalla "Próximamente". Afecta CP-S5-017.

**OBS-05 — RF-011 / RF-012: un padre que pulsa "Inscribirme" en el detalle público va a `/padre/clases` (Media).**
En `ClassDetail.jsx`, el rol `padre` se enruta a `/padre/clases` (la pantalla de ejemplo de OBS-03) y no a un flujo que inscriba a un menor en la clase que estaba mirando; la clase abierta se pierde. El ERS (RF-012) permite que el padre inscriba a un menor. Afecta CP-S5-014.

**OBS-06 — RF-011: el desplegable "Tipo de baile" es una lista fija (Media).**
`ExploreClasses.jsx` solo ofrece Salsa, Bachata, Danza urbana, Contemporánea y Folclor, mientras el formulario del instructor admite un texto libre en "Tipo de baile". Una clase de "Cumbia" o "Merengue" solo se encuentra con `?tipo=Cumbia` o con el buscador de texto. Además, la pantalla compara el tipo con igualdad exacta y distingue mayúsculas: una clase creada como "salsa" la devuelve el backend para `?tipo=Salsa`, pero la pantalla la oculta. Conviene que el desplegable se arme con los tipos existentes o que el formulario ofrezca la misma lista. Afecta CP-S5-001 y CP-S5-015.

**OBS-07 — Secciones del menú todavía "Próximamente" (informativo, Media).**
Hay 17 enlaces del menú sin pantalla (CP-S5-036). Interesan especialmente: `/admin/pagos` (el admin ve los pagos en `/admin/reportes`, pero su entrada "Pagos" del menú es "Próximamente"), `/instructor/reportes` (el instructor ve sus pagos en `/instructor/pagos`), y `/instructor/asistencia`: la entrada "Asistencia" del instructor no abre la asistencia, que en realidad se toma dentro del detalle de cada clase (`/instructor/clases/:id`), con lo que la función es difícil de descubrir. Son rutas provisorias a propósito: no hay que contarlas como defectos de navegación.

**OBS-08 — RF-015: el ERS dice "fecha, academia o instructor"; el código combina los filtros y deduce la academia (Media).**
(a) Los filtros se suman con "y": enviar academia e instructor a la vez devuelve la intersección, no "uno u otro". Para el ERS bastaría con que se pueda filtrar por cada criterio, y eso se cumple. (b) El filtro "academia" es un texto exacto contra el `nombreAcademia` de una solicitud **aprobada** del instructor dueño de la clase: la clase no guarda a qué academia pertenece, así que un instructor con varias academias aprobadas aparece en todas y un instructor independiente (sin nombre de academia) no aparece en ninguna. No hay un selector de academias: el administrador debe escribir el nombre exacto. (c) El reporte incluye solo pagos `aprobado`; los rechazados no se ven. (d) El ERS limita el reporte del instructor a "pagos recibidos" sin precisar el alcance; el código lo limita a sus propias clases (lo esperable, por confirmar con el cliente). Afecta CP-S5-021.

**OBS-09 — RF-010: el registro de asistencia es permisivo y la pantalla guarda "ausente" por omisión (Baja).**
(a) La pantalla envía `asistio: false` para todo alumno que quede sin marcar, de modo que "sin registro" (`null`) solo existe antes del primer guardado. (b) El `POST` acepta cualquier fecha (futura o de un día en que la clase no se dicta) y no exige que la clase esté activa. (c) El `GET` lista solo inscripciones `confirmada`, pero el `POST` acepta cualquier inscripción de la clase, incluidas `pendiente_pago` y `cancelada`. (d) No se valida el cuerpo: sin `registros` o con una `fechaSesion` mal escrita responde `500 INTERNAL_ERROR` en lugar de `400`; las inscripciones ajenas a la clase se descartan sin avisar (`201 { "count": 0 }`). El ERS (RF-010) solo pide "registrar la asistencia de los estudiantes inscritos en cada sesión de clase". Es la parte que sigue vigente de OBS-11 de Sprint 1-2. Afecta CP-S5-008 y CP-S5-012.

**OBS-10 — RF-008 / RF-010: el detalle del instructor muestra clases ajenas con botones de acción (Baja).**
`ClassDetailInstructor.jsx` carga la clase con `GET /api/classes/:id` (público) y no comprueba que sea del instructor: un instructor que abre la URL de la clase de otro ve sus datos y los botones "Editar" y "Cancelar clase"; el backend sí protege las operaciones (`403` en edición, cancelación y asistencia, CP-S5-011) y la sección de asistencia muestra el error. Es una cuestión de pulido, no de seguridad. Afecta CP-S5-011.

**OBS-11 — Los mensajes de la interfaz no siempre son los del backend (informativo).**
(a) Conflicto de horario: la pantalla muestra "Este horario se cruza con otra de tus clases o queda a menos de 15 minutos de una." y la API responde "El horario se cruza con otra clase del instructor.". (b) Cupo máximo inválido: la pantalla dice "mayor que 0" y la API "mayor a 0". (c) Suspensión: el token de un usuario suspendido recibe "Tu cuenta está suspendida." y el inicio de sesión "Tu cuenta está suspendida. Contacta al administrador.". (d) Los mensajes del backend usan voseo ("No tenés permiso...") y los de la pantalla tuteo ("No tienes permiso..."). Conviene unificar al revisar el texto con el cliente. Afecta CP-S5-003, CP-S5-005 y CP-S5-034.

**OBS-12 — Las acciones rápidas del panel del padre apuntan a rutas inexistentes (Media, por verificar en el navegador).**
`DashboardParent.jsx` navega a `/padre/hijos` y `/padre/explorar-clases`, pero el router define `/padre/menores` y `/padre/clases`; el comodín `*` redirige a `/` (la página de inicio). Las otras acciones rápidas del padre (`/padre/inscripciones`, `/padre/asistencia`, `/padre/pagos`, `/padre/notificaciones`) sí existen. Afecta CP-S5-036.

**OBS-13 — RF-008: la creación de clases por API no valida los campos obligatorios (Baja, verificada en ejecución).**
Es la parte que sigue vigente de OBS-08 de Sprint 1-2: `crearClase` solo valida el horario; con un horario correcto pero sin `precio`, `cupoMaximo` o `ciudad` el error de Prisma se convierte en `500`, `modalidad: "virtual"` se acepta (el ERS limita v1.0 a presencial; el formulario siempre envía presencial) y `PUT /api/classes/:id` acepta cambiar `estado`. El formulario sí valida los campos obligatorios, de modo que desde la pantalla el ERS se cumple. Afecta CP-S5-005.

**OBS-14 — RF-016: detalles del reporte de asistencia (Baja).**
(a) El porcentaje se calcula sobre las sesiones **con asistencia registrada**, no sobre las sesiones que la clase debía dictar: sin una sesión cargada por el instructor no existe ni como ausencia. (b) El texto de la tarjeta de clase dice "2 presentes y 1 ausentes en 3 sesiones" (concordancia de plural fija). (c) Mientras el padre no elige, la pantalla consulta al primer menor que devuelve la API. (d) El reporte incluye asistencias de inscripciones que luego se cancelaron. El ERS (RF-016) pide "consultar el reporte de asistencia de su(s) hijo(s) a las clases inscritas", lo que se cumple. Afecta CP-S5-029 y CP-S5-032.
