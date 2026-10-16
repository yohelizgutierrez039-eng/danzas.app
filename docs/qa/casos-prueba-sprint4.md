# Casos de prueba manuales — Sprint 4 (pago simulado, cancelación y reembolsos)

Casos de prueba en formato Dado/Cuando/Entonces para el flujo de pago simulado
(RF-013), la cancelación de inscripción con reembolso condicional (RF-018), la
cancelación de clase por el instructor con reembolso automático (RF-009) y las
notificaciones por correo asociadas (RF-017). Igual que en
`casos-prueba-sprint1.md`, los resultados esperados salen del comportamiento
real del código (`backend/src` y `frontend/src/screens`), no del ERS. Las
diferencias con el ERS (`docs/ERS_DanzasApp_v1.2.docx`) se marcan en "Estado
conocido" y se describen en
[Observaciones](#observaciones-discrepancias-ers--código).

> Alcance de la revisión: análisis estático del código; no se ejecutó la
> aplicación para escribir este documento.

## Índice de casos

| ID | RF | Caso | Prioridad | Cómo se ejecuta | Estado conocido |
| -- | -- | ---- | --------- | --------------- | --------------- |
| CP-S4-001 | RF-013 | (1) Pago simulado aprobado: la inscripción pasa a `confirmada` | Alta | UI + API | OK |
| CP-S4-002 | RF-013 | (2) Pago simulado rechazado: la inscripción pasa a `cancelada` y el cupo se libera | Alta | API (la UI no lo dispara) | OK / UI no operable (OBS-01) |
| CP-S4-003 | RF-018 | (3) Cancelación con 2 horas o más de anticipación: reembolso completo | Alta | UI + API | OK (UI no muestra el reembolso, OBS-02) |
| CP-S4-004 | RF-018 | (4) Cancelación con menos de 2 horas: sin reembolso, pero el cupo se libera | Alta | UI + API | OK |
| CP-S4-005 | RF-009 | (5) El instructor cancela una clase con inscritos pagados: reembolso automático a todos, sin importar la anticipación | Alta | API | OK |
| CP-S4-006 | RF-018 | (6) Un usuario intenta cancelar la inscripción de otro: `403` | Alta | API | OK |
| CP-S4-007 | RF-013 | Un usuario intenta pagar la inscripción de otro | Alta | API | OK |
| CP-S4-008 | RF-013 | Pagar una inscripción que ya no está pendiente de pago | Media | API | OK |
| CP-S4-009 | RF-018 | Cancelar una inscripción ya cancelada o con la clase en curso | Media | API | OK |
| CP-S4-010 | RF-013 / RF-018 | El padre paga y cancela inscripciones de su menor | Media | API (UI no operable) | OK / UI no operable (OBS-06) |
| CP-S4-011 | RF-018 | Cancelar una inscripción que todavía está pendiente de pago | Baja | API | DISCREPANCIA ERS (OBS-03) |
| CP-S4-012 | RF-017 | Cada evento de negocio emite su correo (`[correo simulado]`) | Alta | Consola del backend | OK |
| CP-S4-013 | RF-017 | Un fallo del proveedor de correo no rompe la operación | Baja | API + consola | OK (opcional) |
| CP-S4-014 | RF-017 | El registro de usuario no genera correo de confirmación | Baja | API + consola | DISCREPANCIA ERS (OBS-07) |

Los casos 1 a 6 son los seis escenarios obligatorios del pedido de QA y están
numerados entre paréntesis en el índice.

## Cómo preparar el entorno

1. **Variables de entorno.** El backend lee `backend/.env` y el frontend
   `frontend/.env` (cada carpeta tiene su `.env.example`; los `.env` no se
   versionan). Hace falta MySQL accesible y `DATABASE_URL`, `JWT_SECRET` y
   `JWT_EXPIRES_IN` definidos. `VITE_API_URL` del frontend debe apuntar al
   backend con el prefijo `/api` (por defecto `http://localhost:3000/api`; el
   backend escucha en `PORT`, por defecto 3000, y monta todo bajo `/api`).
   `NODE_ENV` no debe valer `production` (en producción el backend ignora
   `simularRechazo`, ver CP-S4-002).
2. **Sembrar la base:** `cd backend && npx prisma db seed`. **Todos los casos de
   este documento modifican datos: volver a sembrar antes de cada caso.** El
   seed regenera todos los usuarios con ids (UUID) nuevos, así que los tokens y
   los ids anteriores dejan de servir (hay que volver a iniciar sesión y a
   consultar los ids).
3. **Backend:** `cd backend && npm run dev` en `http://localhost:3000`. La
   consola del backend es donde se verifican los correos: sin `RESEND_API_KEY`
   ni `EMAIL_FROM` el backend no envía nada y escribe una línea
   `[correo simulado] Para: <correo> | Asunto: <asunto> (RESEND_API_KEY o EMAIL_FROM sin configurar)`.
4. **Frontend:** `cd frontend && npm run dev` en `http://localhost:5173`.
5. **Datos de prueba** (contraseña de todos: `Prueba1234`):

   | Usuario | Rol | Datos relevantes |
   | ------- | --- | ---------------- |
   | `admin@danzas.app` | admin | |
   | `instructor.aprobado@danzas.app` (Camila) | instructor | Salsa lunes 18:00-19:00 (cupo 13/15, $50.000) y Bachata miércoles 19:15-20:15 (12/12, $45.000), Barranquilla |
   | `instructor.independiente@danzas.app` (Julián) | instructor | Danza urbana martes 17:00-18:00 (19/20, $40.000), Medellín |
   | `estudiante1@danzas.app` (Andrea Pérez) | estudiante | Inscripción `confirmada` en Salsa, pago `aprobado` de $50.000 (simulado) y una asistencia |
   | `estudiante2@danzas.app` (Santiago Mejía) | estudiante | Inscripción `pendiente_pago` en Danza urbana (sin pago) |
   | `padre@danzas.app` (Laura Sánchez) | padre | Menores Mateo e Isabella; Mateo con inscripción `confirmada` y pago `aprobado` en Salsa |

6. **Llamadas a la API** (ejemplos con `curl` en Git Bash; en Postman, Thunder
   Client o Bruno se usa el mismo método, URL, header y cuerpo):

   ```bash
   API=http://localhost:3000/api
   curl -s -X POST $API/auth/login -H "Content-Type: application/json" \
     -d '{"correo":"estudiante1@danzas.app","contraseña":"Prueba1234"}'
   # => { "token": "...", "user": { "id": "...", ... } }
   curl -s -X POST $API/enrollments/<ID_INSCRIPCION>/simulate-payment \
     -H "Authorization: Bearer <TOKEN>"
   ```

   Placeholders: `<TOKEN_E1>`, `<TOKEN_E2>`, `<TOKEN_PADRE>`,
   `<TOKEN_CAMILA>`, `<TOKEN_JULIAN>`; `<ID_SALSA>`, `<ID_BACHATA>`,
   `<ID_URBANA>` (de `GET /api/classes/search`, público); `<ID_E1>`,
   `<ID_E2>`, `<ID_PADRE>` (`user.id` del login); `<ID_MATEO>`,
   `<ID_ISABELLA>` (de `GET /api/users/dependents` con el token del padre).
   Los ids de inscripción salen de `GET /api/users/<id del usuario>/enrollments`
   con el token de ese usuario (por ejemplo `<ID_INSC_E1>`, `<ID_INSC_E2>`,
   `<ID_INSC_MATEO>`). Esa misma respuesta muestra `estado`, `pago`
   (`estado`, `reembolsado`, `motivoReembolso`) y `canceladoPor`, que se usan
   para verificar los resultados sin abrir la base.
7. **Cuándo es "2 horas antes".** Las clases son semanales. Para decidir el
   reembolso el backend calcula el inicio de la **próxima sesión** a partir de
   `dia_semana` y `hora_inicio` en hora de Colombia (UTC-5, sin horario de
   verano): con 2 horas o más de diferencia hay reembolso completo; con menos
   no; si hay una sesión en curso (ya empezó y no terminó) no se puede
   cancelar. La Salsa del seed es lunes 18:00; por eso, en hora de Colombia:
   - Reembolso (CP-S4-003): cualquier momento salvo el lunes entre las 16:00 y
     las 19:00.
   - Sin reembolso (CP-S4-004): lunes entre las 16:00:01 y las 17:59:59.
   - Clase en curso (CP-S4-009): lunes entre las 18:00 y las 18:59:59.
   Para no depender del reloj, se edita el horario con **Prisma Studio**
   (`cd backend && npx prisma studio`, `http://localhost:5555`): tabla
   `horario`, fila de la Salsa. Poner `dia_semana` con el día de hoy en
   Colombia (0 domingo a 6 sábado) y `hora_inicio` / `hora_fin` como
   `1970-01-01T<hh>:<mm>:00.000Z` donde `<hh>:<mm>` es la hora de pared de
   Colombia (por ejemplo, si en Colombia son las 15:30 y se quiere una sesión
   dentro de una hora: `hora_inicio = 1970-01-01T16:30:00.000Z`,
   `hora_fin = 1970-01-01T17:30:00.000Z`). Evitar horarios que crucen la
   medianoche.

---

## RF-013 — Simulación de pago en línea

Archivos revisados: `backend/src/routes/enrollments.routes.js`,
`backend/src/controllers/payment.controller.js`,
`backend/src/services/payment.service.js`,
`backend/src/services/payment/paymentProvider.js`,
`backend/src/repositories/payment.repository.js`,
`frontend/src/screens/student/PaymentCheckout.jsx`.

### CP-S4-001 — RF-013 — Caso (1): pago simulado aprobado, la inscripción pasa a `confirmada`
- **RF:** RF-013 · **Prioridad:** Alta · **Ejecución:** UI + API · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado; sesión de `estudiante2@danzas.app` (inscripción `pendiente_pago` en Danza urbana, $40.000). Consola del backend visible.

**Dado** un estudiante con una inscripción en estado `pendiente_pago`
**Cuando** entra a `/estudiante/inscripciones`, pulsa "Completar pago" y luego "Confirmar pago (simulado)" (o llama `POST /api/enrollments/<ID_INSC_E2>/simulate-payment` sin cuerpo, con su token)
**Entonces** el pago se aprueba, se genera el comprobante y la inscripción queda `confirmada`

**Resultado esperado**
- API: `200` con `paymentStatus: "aprobado"`, `receiptId: "SIM-XXXXXXXXXX"` (10 caracteres hexadecimales en mayúscula), `pago` (`estado: "aprobado"`, `esSimulado: true`, `monto: "40000"`, `referenciaPasarela` igual al `receiptId`, `procesadoEn`), `inscripcion: { id, estado: "confirmada" }` y `comprobante` (`referencia`, `claseId`, `clase: "Danza urbana"`, `monto`, `fecha`, `estado: "aprobado"`, `esSimulado: true`).
- UI: la pantalla "Confirmar inscripción" muestra "Resumen de la inscripción" (Clase "Danza urbana", Precio "$40.000"); tras el pago, "¡Pago aprobado!", "Tu inscripción fue confirmada correctamente." y "Comprobante de pago" con Clase, Monto "$40.000", Fecha y Comprobante (`SIM-...`). El botón "Ir a mis inscripciones" lleva a la lista, donde la tarjeta muestra "Confirmada" y "Estado del pago: Pagado".
- El `cupoDisponible` de Danza urbana no cambia (el cupo ya se había descontado al inscribirse: 19).
- Consola: `[correo simulado] Para: estudiante2@danzas.app | Asunto: Pago aprobado: Danza urbana (RESEND_API_KEY o EMAIL_FROM sin configurar)`.
- No hay datos de tarjeta en ningún paso: el simulador no pide ni captura datos de pago.

**Fuente:** `backend/src/services/payment.service.js` (`simularPago`), `backend/src/services/payment/paymentProvider.js` (`SimulatedPaymentProvider`), `frontend/src/screens/student/PaymentCheckout.jsx`.

### CP-S4-002 — RF-013 — Caso (2): pago simulado rechazado, la inscripción pasa a `cancelada` y el cupo se libera
- **RF:** RF-013 · **Prioridad:** Alta · **Ejecución:** API · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado. Con el token de estudiante1 crear una inscripción nueva en Bachata: `POST /api/enrollments` `{"class_id":"<ID_BACHATA>"}` (`201`, `pendiente_pago`); anotar su `id` (`<ID_INSC_NUEVA>`) y el `cupoDisponible` de Bachata en `GET /api/classes/search` (pasó de 12 a 11). `NODE_ENV` distinto de `production`.

**Dado** una inscripción `pendiente_pago` que ocupa un cupo
**Cuando** el estudiante llama `POST /api/enrollments/<ID_INSC_NUEVA>/simulate-payment` con el cuerpo `{"simularRechazo": true}`
**Entonces** el pago se rechaza, la inscripción se cancela y el cupo vuelve a quedar disponible

**Resultado esperado**
- `200` (un pago rechazado es un resultado válido de la simulación, no un error HTTP) con `paymentStatus: "rechazado"`, `pago.estado: "rechazado"` y `inscripcion: { id, estado: "cancelada" }`.
- `cupoDisponible` de Bachata vuelve a 12.
- `GET /api/users/<ID_E1>/enrollments`: la inscripción figura `cancelada` con `pago.estado: "rechazado"`.
- Consola: `[correo simulado] Para: estudiante1@danzas.app | Asunto: Pago rechazado: Bachata (...)`.
- El estudiante puede volver a inscribirse desde cero: `POST /api/enrollments` con la misma clase responde `201` con un `id` nuevo (la inscripción cancelada no cuenta como activa).
- Enviar `{"simularRechazo": true}` con `NODE_ENV=production` no rechaza: el backend lo ignora y aprueba el pago.
- Desde la interfaz no se puede provocar este caso: el botón "Confirmar pago (simulado)" siempre llama sin cuerpo y por lo tanto siempre aprueba. La pantalla de pago rechazado existe en `PaymentCheckout.jsx` ("Pago rechazado", "El pago no pudo ser aprobado. El cupo de la clase fue liberado, por lo que puedes volver a realizar la inscripción desde cero." y el botón "Volver a intentar la inscripción") pero solo se verá si el backend devuelve un pago rechazado (OBS-01).

**Fuente:** `backend/src/controllers/payment.controller.js` (`simularRechazo`, `NODE_ENV`), `backend/src/services/payment.service.js` (rama `!aprobado` con `incrementarCupoDisponible`), `frontend/src/screens/student/PaymentCheckout.jsx`.

### CP-S4-007 — RF-013 — Caso: un usuario intenta pagar la inscripción de otro
- **RF:** RF-013 · **Prioridad:** Alta · **Ejecución:** API · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado; `<ID_INSC_E2>` (pendiente de pago de estudiante2); token de estudiante1.

**Dado** la inscripción `pendiente_pago` de estudiante2
**Cuando** estudiante1 llama `POST /api/enrollments/<ID_INSC_E2>/simulate-payment`
**Entonces** el sistema rechaza el pago y no cambia la inscripción

**Resultado esperado**
- `403` con `error.code = "FORBIDDEN"` y mensaje "No tenés permiso para pagar esta inscripción.".
- La inscripción de estudiante2 sigue `pendiente_pago` y no se crea ningún registro de pago.
- Id inexistente: `404 ENROLLMENT_NOT_FOUND` "Inscripción no encontrada."; token de instructor o admin: `403 FORBIDDEN` "No tenés permiso para acceder a este recurso."; sin token: `401 UNAUTHORIZED`.

**Fuente:** `backend/src/services/payment.service.js` (`inscripcion.usuarioId !== solicitante.id`), `backend/src/routes/enrollments.routes.js`.

### CP-S4-008 — RF-013 — Caso: pagar una inscripción que ya no está pendiente de pago
- **RF:** RF-013 · **Prioridad:** Media · **Ejecución:** API
- **Precondiciones / datos:** seed recién cargado; `<ID_INSC_E1>` (confirmada) y, para la segunda parte, una inscripción cancelada (por ejemplo la del rechazo de CP-S4-002).

**Dado** una inscripción `confirmada` (estudiante1 en Salsa) y otra `cancelada`
**Cuando** su dueño llama `POST /api/enrollments/<id>/simulate-payment` sobre cada una
**Entonces** el sistema rechaza el pago y no crea un segundo pago

**Resultado esperado**
- `409` con `error.code = "INVALID_ENROLLMENT_STATE"` y mensaje "Esta inscripción ya no está pendiente de pago." en ambos casos.
- El pago original (`aprobado` de $50.000) no cambia; la tabla `pago` tiene una sola fila por inscripción.
- Pagar dos veces seguidas la misma inscripción pendiente: la primera llamada responde `200` y la segunda `409` con el mismo código.

**Fuente:** `backend/src/services/payment.service.js` (`estadoYaCambio`), `backend/src/repositories/enrollment.repository.js` (`transicionarEstado`), `backend/prisma/schema.prisma` (`Pago.inscripcionId` único).

---

## RF-018 — Cancelación de inscripción por el estudiante

Archivos revisados: `backend/src/services/enrollment.service.js`
(`cancelarInscripcion`), `backend/src/utils/classSchedule.util.js`
(`proximaSesion`), `backend/src/repositories/enrollment.repository.js`,
`backend/src/repositories/payment.repository.js` (`marcarComoReembolsado`),
`frontend/src/screens/student/MyEnrollments.jsx`.

### CP-S4-003 — RF-018 — Caso (3): cancelación con 2 horas o más de anticipación, reembolso completo
- **RF:** RF-018 · **Prioridad:** Alta · **Ejecución:** UI + API · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado; sesión de `estudiante1@danzas.app` (inscripción `confirmada` en Salsa con pago aprobado de $50.000). La próxima sesión de la Salsa debe estar a 2 horas o más (ver el paso 7 de "Cómo preparar el entorno"; si el reloj no lo permite, editar el horario en Prisma Studio para que empiece, por ejemplo, dentro de 3 horas). Anotar `cupoDisponible` de Salsa (13).

**Dado** una inscripción `confirmada` con pago aprobado y una clase cuya próxima sesión empieza dentro de 2 horas o más
**Cuando** el estudiante entra a `/estudiante/inscripciones`, pulsa "Cancelar inscripción" y confirma "Sí, cancelar" (o llama `DELETE /api/enrollments/<ID_INSC_E1>` con su token)
**Entonces** la inscripción se cancela, el cupo se libera y el pago queda reembolsado por completo

**Resultado esperado**
- API: `200` con `{ "cancelada": true, "reembolsado": true, "inscripcion": { "id": "<ID_INSC_E1>", "estado": "cancelada" }, "mensaje": "Inscripción cancelada. Se generó un reembolso completo." }`.
- UI: el diálogo "Cancelar inscripción" dice: `¿Seguro que quieres cancelar tu inscripción en "Salsa"? Si faltan 2 horas o más para la próxima sesión, tu pago será reembolsado. Si falta menos tiempo, no se realizará el reembolso.`; al confirmar aparece el aviso "Inscripción cancelada" / "Tu inscripción fue cancelada y el pago será reembolsado." y la tarjeta pasa a "Cancelada" (el botón "Cancelar inscripción" desaparece).
- Datos (`GET /api/users/<ID_E1>/enrollments` o Prisma Studio): inscripción `cancelada` con `canceladoPor: "estudiante"`; `pago.reembolsado: true`, `pago.motivoReembolso: "cancelacion_estudiante_anticipada"` (`pago.estado` sigue `aprobado`); `cupoDisponible` de Salsa 13 → 14.
- Consola: `[correo simulado] Para: estudiante1@danzas.app | Asunto: Inscripción cancelada: Salsa (...)`. El cuerpo del correo (visible solo con proveedor real) dice "Se generó un reembolso completo de $50000.00.".
- La UI sigue mostrando "Estado del pago: Pagado" en la tarjeta cancelada: la pantalla no muestra el reembolso (OBS-02).

**Fuente:** `backend/src/services/enrollment.service.js` (`cancelarInscripcion`, `HORAS_MINIMAS_PARA_REEMBOLSO = 2`), `backend/src/repositories/payment.repository.js` (`marcarComoReembolsado`), `frontend/src/screens/student/MyEnrollments.jsx`.

### CP-S4-004 — RF-018 — Caso (4): cancelación con menos de 2 horas, sin reembolso pero el cupo se libera
- **RF:** RF-018 · **Prioridad:** Alta · **Ejecución:** UI + API · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado; sesión de `estudiante1@danzas.app`. Editar el horario de la Salsa en Prisma Studio para que la próxima sesión empiece en aproximadamente 1 hora y todavía no haya empezado (paso 7 de "Cómo preparar el entorno"). Anotar `cupoDisponible` de Salsa (13).

**Dado** una inscripción `confirmada` con pago aprobado y una clase que empieza en menos de 2 horas (pero todavía no empezó)
**Cuando** el estudiante cancela desde `/estudiante/inscripciones` ("Cancelar inscripción" > "Sí, cancelar") o con `DELETE /api/enrollments/<ID_INSC_E1>`
**Entonces** la inscripción se cancela y el cupo se libera, pero no se genera reembolso

**Resultado esperado**
- API: `200` con `"cancelada": true`, `"reembolsado": false`, `inscripcion.estado: "cancelada"` y `mensaje: "Inscripción cancelada sin reembolso: faltaban menos de 2 horas para la clase."`.
- UI: aviso "Inscripción cancelada" / "Tu inscripción fue cancelada. No aplica reembolso porque faltaban menos de 2 horas para la clase."; la tarjeta pasa a "Cancelada".
- Datos: inscripción `cancelada` (`canceladoPor: "estudiante"`); `pago.reembolsado: false` y `pago.motivoReembolso: null`; `cupoDisponible` de Salsa 13 → 14.
- Consola: `[correo simulado] Para: estudiante1@danzas.app | Asunto: Inscripción cancelada: Salsa (...)`; el cuerpo dice "No hay reembolso: la cancelación se hizo con menos de 2 horas de anticipación a la clase.".
- Límite: la regla es "2 horas o más reembolsa"; una sesión que empieza dentro de más de 2 horas reembolsa (CP-S4-003) y una que empieza dentro de menos no. Si la sesión ya empezó, ver CP-S4-009.

**Fuente:** `backend/src/services/enrollment.service.js` (`horasRestantes >= HORAS_MINIMAS_PARA_REEMBOLSO`, mensajes de retorno), `backend/src/utils/emailTemplates.js` (`inscripcionCancelada`), `frontend/src/screens/student/MyEnrollments.jsx`.

### CP-S4-006 — RF-018 — Caso (6): un usuario intenta cancelar la inscripción de otro, `403`
- **RF:** RF-018 · **Prioridad:** Alta · **Ejecución:** API
- **Precondiciones / datos:** seed recién cargado; `<ID_INSC_E1>` (inscripción confirmada de estudiante1 en Salsa) y `<ID_INSC_MATEO>`; tokens de estudiante2, padre y estudiante1.

**Dado** la inscripción de estudiante1 en Salsa, que pertenece a otra cuenta
**Cuando** estudiante2 llama `DELETE /api/enrollments/<ID_INSC_E1>`
**Entonces** el sistema rechaza la cancelación y la inscripción no cambia

**Resultado esperado**
- `403` con `error.code = "FORBIDDEN"` y mensaje "No tenés permiso para cancelar esta inscripción.".
- Verificación con el token de estudiante1: la inscripción sigue `confirmada`, `pago.reembolsado: false` y el `cupoDisponible` de Salsa no cambió (13). No se emite ningún correo.
- Variantes con el mismo `403` y mensaje: el padre intenta cancelar `<ID_INSC_E1>`; estudiante1 intenta cancelar `<ID_INSC_MATEO>` (la inscripción del menor pertenece al padre).
- Token de instructor o admin: `403 FORBIDDEN` "No tenés permiso para acceder a este recurso." (lo corta el guardián de rol); sin token: `401 UNAUTHORIZED`; id inexistente: `404 ENROLLMENT_NOT_FOUND` "Inscripción no encontrada." (la existencia se comprueba antes que la propiedad).
- Desde la UI no se puede forzar: `/estudiante/inscripciones` solo lista y cancela las inscripciones de la sesión.

**Fuente:** `backend/src/services/enrollment.service.js` (`inscripcion.usuarioId !== solicitante.id`), `backend/src/routes/enrollments.routes.js`, `backend/src/middleware/roleGuard.middleware.js`.

### CP-S4-009 — RF-018 — Caso: cancelar una inscripción ya cancelada o con la clase en curso
- **RF:** RF-018 · **Prioridad:** Media · **Ejecución:** API · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado. Parte A: la inscripción de estudiante1 cancelada en CP-S4-003. Parte B (re-sembrar): editar el horario de la Salsa en Prisma Studio para que hoy la sesión esté en curso (`dia_semana` = hoy, `hora_inicio` unos 10 minutos antes de la hora actual de Colombia y `hora_fin` 50 minutos después, formato del paso 7).

**Dado** una inscripción ya cancelada (parte A) y una inscripción confirmada cuya clase está en curso (parte B)
**Cuando** el dueño llama `DELETE /api/enrollments/<ID_INSC_E1>` en cada situación
**Entonces** el sistema rechaza la cancelación en ambas

**Resultado esperado**
- Parte A: `409` con `error.code = "ENROLLMENT_ALREADY_CANCELLED"` y mensaje "La inscripción ya está cancelada."; no se emite otro correo ni se vuelve a reembolsar.
- Parte B: `409` con `error.code = "CLASS_ALREADY_STARTED"` y mensaje "La clase ya comenzó, no se puede cancelar la inscripción."; la inscripción sigue `confirmada`, sin reembolso y con el cupo sin cambios.
- En la UI el mensaje del backend aparece en el recuadro de error de "Mis inscripciones" y el diálogo se cierra.

**Fuente:** `backend/src/services/enrollment.service.js` (`cancelarInscripcion`, `proximaSesion`), `backend/src/utils/classSchedule.util.js`, `frontend/src/screens/student/MyEnrollments.jsx`.

### CP-S4-010 — RF-013 / RF-018 — Caso: el padre paga y cancela inscripciones de su menor
- **RF:** RF-013, RF-018 · **Prioridad:** Media · **Ejecución:** API · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado; token del padre; `<ID_ISABELLA>`, `<ID_INSC_MATEO>`. La próxima sesión de la Salsa a 2 horas o más (paso 7).

**Dado** un padre con su menor Isabella sin inscripciones y Mateo con una inscripción confirmada y pagada en Salsa
**Cuando** inscribe a Isabella en Bachata (`POST /api/enrollments` `{"class_id":"<ID_BACHATA>","dependent_id":"<ID_ISABELLA>"}`), paga esa inscripción (`POST /api/enrollments/<id>/simulate-payment`) y cancela la de Mateo (`DELETE /api/enrollments/<ID_INSC_MATEO>`)
**Entonces** el padre puede pagar y cancelar en nombre de sus menores y los correos le llegan a él

**Resultado esperado**
- Inscripción de Isabella: `201`, `usuarioId` del padre, `menorId` de Isabella; pago: `200` con `paymentStatus: "aprobado"` e `inscripcion.estado: "confirmada"`.
- Cancelar la de Mateo: `200` con `reembolsado: true` y `mensaje: "Inscripción cancelada. Se generó un reembolso completo."` (`canceladoPor: "estudiante"` en los datos, aunque la haga el padre).
- Consola: `[correo simulado] Para: padre@danzas.app | Asunto: Pago aprobado: Bachata` y `... | Asunto: Inscripción cancelada: Salsa`; el cuerpo de ambos menciona al menor ("la inscripción de Isabella Sánchez" / "de Mateo Sánchez").
- Desde la UI esto no es operable: el flujo de inscripción del padre falla (CP-S23-018 en `casos-prueba-sprint2-3.md`) y `PaymentCheckout.jsx` no puede recuperar la inscripción de un padre si se recarga la página (OBS-06).

**Fuente:** `backend/src/services/enrollment.service.js`, `backend/src/services/payment.service.js` (`notificarResultadoPago`, `nombreMenor`), `backend/src/utils/emailTemplates.js` (`paraQuien`).

### CP-S4-011 — RF-018 — Caso: cancelar una inscripción que todavía está pendiente de pago
- **RF:** RF-018 · **Prioridad:** Baja · **Ejecución:** API · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado; token de estudiante2; `<ID_INSC_E2>`; `cupoDisponible` de Danza urbana (19). La próxima sesión de la Danza urbana (martes 17:00) no puede estar en curso.

**Dado** una inscripción `pendiente_pago` (sin pago registrado)
**Cuando** estudiante2 llama `DELETE /api/enrollments/<ID_INSC_E2>`
**Entonces** el backend la cancela y libera el cupo

**Resultado esperado**
- `200` con `cancelada: true`, `reembolsado: false` y `mensaje: "Inscripción cancelada."`.
- Inscripción `cancelada` (`canceladoPor: "estudiante"`), `cupoDisponible` de Danza urbana 19 → 20 y no existe fila de pago.
- Consola: `[correo simulado] Para: estudiante2@danzas.app | Asunto: Inscripción cancelada: Danza urbana`; el cuerpo dice "No había un pago aprobado, así que no corresponde reembolso.".
- El ERS (RF-018) describe la cancelación de una inscripción "previamente confirmada y pagada"; el backend también permite cancelar las pendientes y la UI no ofrece ese botón para ellas (OBS-03).

**Fuente:** `backend/src/services/enrollment.service.js` (`cancelarInscripcion` no restringe el estado de origen), `frontend/src/screens/student/MyEnrollments.jsx` (botón solo para `confirmada`).

---

## RF-009 — Cancelación de clase por el instructor

Archivos revisados: `backend/src/services/class.service.js` (`cancelarClase`),
`backend/src/repositories/enrollment.repository.js`
(`cancelarPorClaseDeInstructor`, `findActivasPorClase`),
`backend/src/utils/emailTemplates.js` (`claseCanceladaPorInstructor`).

### CP-S4-005 — RF-009 — Caso (5): el instructor cancela una clase con inscritos pagados, reembolso automático a todos sin importar la anticipación
- **RF:** RF-009 (RF-017) · **Prioridad:** Alta · **Ejecución:** API · **Modifica datos**
- **Precondiciones / datos:** seed recién cargado. La Salsa de Camila tiene dos inscripciones confirmadas con pago aprobado: estudiante1 y Mateo (del padre). Tokens de Camila, estudiante1 y padre. Parte A: sin tocar horarios. Parte B (re-sembrar): editar el horario de la Salsa en Prisma Studio para que empiece en 30 minutos (paso 7 de "Cómo preparar el entorno").

**Dado** una clase con inscripciones confirmadas y pagadas, y su instructor
**Cuando** Camila llama `DELETE /api/classes/<ID_SALSA>` con su token (en la parte A con la clase lejos en el tiempo, en la parte B con la clase empezando en menos de 2 horas)
**Entonces** la clase se cancela, todas las inscripciones activas se cancelan y todos los pagos aprobados se reembolsan por completo, en ambos escenarios

**Resultado esperado**
- `200` con la clase (`estado: "cancelada"`) más `inscripcionesCanceladas: 2` y `reembolsosProcesados: 2`.
- Datos: las dos inscripciones (`GET /api/users/<ID_E1>/enrollments` con estudiante1 y `GET /api/users/<ID_MATEO>/enrollments` con el padre) quedan `cancelada` con `canceladoPor: "instructor"`; ambos pagos `reembolsado: true` con `motivoReembolso: "cancelacion_instructor"`.
- Consola, dos líneas (una por inscripción afectada): `[correo simulado] Para: estudiante1@danzas.app | Asunto: Clase cancelada: Salsa (...)` y `[correo simulado] Para: padre@danzas.app | Asunto: Clase cancelada: Salsa (...)`. El cuerpo de cada correo dice que el instructor canceló la clase y "Se generó un reembolso completo de $50000.00."; el del padre nombra a Mateo Sánchez.
- La clase deja de aparecer en `GET /api/classes/search` y estudiante1 ya no puede cancelar su inscripción (`409 ENROLLMENT_ALREADY_CANCELLED`).
- En el escenario B el resultado es idéntico: el reembolso por cancelación del instructor no depende de la hora (a diferencia de CP-S4-004). La cancelación de la clase tampoco se bloquea porque la clase esté en curso.
- Las inscripciones `pendiente_pago` de la clase también se cancelan y se notifican, pero sin reembolso (no hay pago aprobado): ver CP-S12-019 en `casos-prueba-sprint1-2.md`. El `cupoDisponible` de la clase cancelada no se modifica.

**Fuente:** `backend/src/services/class.service.js` (`cancelarClase`, `notificarClaseCancelada`), `backend/src/repositories/enrollment.repository.js` (`cancelarPorClaseDeInstructor`), `backend/src/utils/emailTemplates.js`.

---

## RF-017 — Notificaciones por correo

Archivos revisados: `backend/src/services/email.service.js`,
`backend/src/events/emitirCorreo.js`, `backend/src/events/notificationEmitter.js`,
`backend/src/utils/emailTemplates.js`.

Funcionamiento: cada servicio de negocio emite el evento `correo` después de
confirmar la transacción y sin esperarlo; `email.service.js` lo recibe y, si
`RESEND_API_KEY` y `EMAIL_FROM` no están definidos (el caso normal en
desarrollo), solo escribe en la consola del backend la línea
`[correo simulado] Para: <destinatario> | Asunto: <asunto> (RESEND_API_KEY o EMAIL_FROM sin configurar)`.
El cuerpo del mensaje no se imprime: para revisarlo hay que leer
`backend/src/utils/emailTemplates.js` o usar un proveedor real.

| Evento | Se dispara con | Destinatario | Asunto |
| ------ | -------------- | ------------ | ------ |
| Pago aprobado | `POST /api/enrollments/:id/simulate-payment` aprobado | Dueño de la inscripción (el estudiante, o el padre si es de un menor) | `Pago aprobado: <tipoBaile>` |
| Pago rechazado | el mismo endpoint con `simularRechazo: true` | Dueño de la inscripción | `Pago rechazado: <tipoBaile>` |
| Inscripción cancelada | `DELETE /api/enrollments/:id` | Quien cancela (estudiante, o padre) | `Inscripción cancelada: <tipoBaile>` |
| Clase cancelada por el instructor | `DELETE /api/classes/:id` | Un correo por cada inscripción activa (`pendiente_pago` o `confirmada`) | `Clase cancelada: <tipoBaile>` |
| Solicitud de academia resuelta | `POST /api/admin/academy-requests/:id/approve` o `/reject` | Instructor solicitante | `Solicitud de academia aprobada` / `Solicitud de academia rechazada` |
| Recuperación de contraseña | `POST /api/auth/forgot-password` (ver OBS-07) | Correo indicado | `Recupera tu contraseña en Danzas.app` (antes `Verifica tu cuenta en Danzas.app`; corregido en `fix/horarios-iso-solicitud-instructor`) |

### CP-S4-012 — RF-017 — Caso: cada evento de negocio emite su correo
- **RF:** RF-017 · **Prioridad:** Alta · **Ejecución:** consola del backend, durante los casos anteriores

**Dado** el backend en marcha sin `RESEND_API_KEY` ni `EMAIL_FROM`
**Cuando** se ejecutan los casos CP-S4-001 (pago aprobado), CP-S4-002 (rechazado), CP-S4-003 y CP-S4-004 (cancelación con y sin reembolso), CP-S4-005 (cancelación de clase) y CP-S12-002/003 (solicitud de academia)
**Entonces** la consola muestra una línea `[correo simulado]` por cada notificación de la tabla anterior

**Resultado esperado**
- En cada caso aparece exactamente una línea con el destinatario y el asunto de la tabla (en CP-S4-005, una por inscripción cancelada).
- No se escribe ninguna línea cuando la operación falla (por ejemplo `403`, `409`): el correo se emite solo tras el éxito de la transacción (CP-S4-006 a CP-S4-009).
- Si el destinatario no tiene correo o la operación no lo requiere, no se emite nada y la operación no falla.
- Contenido de los cuerpos (ver `emailTemplates.js`): pago aprobado incluye clase, monto (formato `$50000.00`), referencia `SIM-...`, fecha y la leyenda "Este pago fue procesado en modo simulado."; los de cancelación explican si hubo reembolso completo, si no hubo por la regla de 2 horas, o si no había un pago aprobado.

**Fuente:** `backend/src/events/emitirCorreo.js`, `backend/src/services/email.service.js` (`enviarConProveedor`), `backend/src/utils/emailTemplates.js`.

### CP-S4-013 — RF-017 — Caso: un fallo del proveedor de correo no rompe la operación (opcional)
- **RF:** RF-017 · **Prioridad:** Baja · **Ejecución:** API + consola · **Modifica datos**
- **Precondiciones / datos:** reiniciar el backend con credenciales inválidas en el entorno del proceso (no se editan archivos `.env`; las variables ya definidas en el entorno tienen prioridad): `RESEND_API_KEY=clave_invalida EMAIL_FROM=prueba@example.com npm run dev` en `backend`. Requiere salida a internet. Seed recién cargado.

**Dado** un backend con proveedor de correo configurado pero con una clave que el proveedor rechaza
**Cuando** estudiante2 paga su inscripción pendiente (`POST /api/enrollments/<ID_INSC_E2>/simulate-payment`)
**Entonces** el pago se procesa con normalidad y el error del correo solo se registra en la consola

**Resultado esperado**
- La respuesta del pago es `200` con `paymentStatus: "aprobado"`, igual que sin proveedor.
- En la consola aparece una línea `[notificaciones] No se pudo enviar el correo: El proveedor de correo respondió <código HTTP>. ...` y no aparece `[correo simulado]` para ese envío.
- El proceso del backend no se cae.

**Fuente:** `backend/src/services/email.service.js` (`manejarEventoCorreo`, `enviarConProveedor`).

### CP-S4-014 — RF-017 — Caso: el registro de usuario no genera correo de confirmación
- **RF:** RF-017 (RF-001) · **Prioridad:** Baja · **Ejecución:** API + consola · **Modifica datos**
- **Precondiciones / datos:** backend sin `RESEND_API_KEY`/`EMAIL_FROM`.

**Dado** el ERS, que lista la "confirmación de registro" entre los eventos que deben notificarse
**Cuando** se registra un usuario con `POST /api/auth/register` `{"rol":"estudiante","nombre":"Prueba Correo","correo":"prueba.correo@danzas.app","contraseña":"Prueba1234","ciudad":"Cali"}`
**Entonces** el registro debería disparar un correo de confirmación

**Resultado esperado (comportamiento actual)**
- `201` con el usuario creado y **ninguna** línea `[correo simulado]` en la consola.

**Estado conocido: DISCREPANCIA ERS (OBS-07).**

**Fuente:** `backend/src/services/auth.service.js` (`registrar` no emite el evento), ERS RF-001 y RF-017.

---

## Observaciones (discrepancias ERS / código)

**OBS-01 — RF-013: la interfaz no puede provocar un pago rechazado (Media).**
`PaymentCheckout.jsx` llama a `simulatePayment` sin cuerpo, y el backend solo rechaza si recibe `simularRechazo: true` (y `NODE_ENV` no es `production`). El ERS pide "simula el resultado del pago (aprobado o rechazado)"; la pantalla de pago rechazado existe pero no se alcanza desde la UI. El rechazo solo se prueba por API (CP-S4-002).

**OBS-02 — RF-018: la UI no muestra el reembolso (Media).**
Tras un reembolso, `pago.estado` sigue siendo `aprobado` y se marca `reembolsado: true` / `motivoReembolso`; la tarjeta de `MyEnrollments.jsx` solo lee `pago.estado` (etiqueta "Pagado"), por lo que una inscripción cancelada con reembolso se ve igual que una pagada. El aviso con el resultado aparece una sola vez al cancelar. Además `marcarComoReembolsado` sobrescribe `procesadoEn` del pago con la fecha del reembolso (se pierde la fecha original del cobro).

**OBS-03 — RF-018: se pueden cancelar inscripciones pendientes de pago (Baja).**
El ERS limita la cancelación a una inscripción "previamente confirmada y pagada"; el backend acepta cualquier estado distinto de `cancelada` (también `pendiente_pago`), y la UI solo ofrece el botón para `confirmada`.

**OBS-04 — RF-018: "inicio de la clase" se interpreta como la próxima sesión semanal (informativo).**
El ERS habla de "2 horas de anticipación al inicio de la clase". Como las clases son semanales (un `Horario` con día y hora), el backend toma la próxima sesión desde "ahora" en hora de Colombia (UTC-5 fijo, `classSchedule.util.js`). No hay fechas de inicio y fin de la clase en el modelo, y el seed no marca clases `finalizada`. Confirmar con el cliente que es la lectura correcta. Si la clase está en curso la cancelación responde `409 CLASS_ALREADY_STARTED`.

**OBS-05 — RF-012 / RF-013: el cupo reservado no vence (Media).**
Una inscripción `pendiente_pago` conserva su cupo indefinidamente (ver OBS-08 en `casos-prueba-sprint2-3.md`); el ERS (CU-03) habla de una reserva temporal.

**OBS-06 — RF-013 / RF-018: el flujo del padre no es operable desde la UI (Alta para la demo).**
La pantalla "Explorar clases" del padre usa clases de ejemplo con ids numéricos y el backend rechaza la inscripción (OBS-04 de `casos-prueba-sprint2-3.md`); además `PaymentCheckout.jsx` solo recupera la inscripción desde el historial cuando el rol no es `padre`, así que recargar la página de pago de un padre muestra "Inscripción no encontrada". No existe pantalla para que el padre cancele inscripciones de sus menores. Por API todo funciona.

**OBS-07 — RF-017: no hay correo de confirmación de registro y la ruta de recuperación no está montada (Baja). La parte de rutas está CORREGIDA (corregido en `fix/auth-clases-cuatro-bugs`); el correo de confirmación de registro sigue pendiente. El asunto/cuerpo de recuperación y el enlace fijo a `localhost:5173` quedaron corregidos en `fix/horarios-iso-solicitud-instructor` (asunto "Recupera tu contraseña en Danzas.app", enlace desde `FRONTEND_URL`).**
`auth.service.js#registrar` no emite correo (el ERS RF-001 y RF-017 lo piden). `recuperarPassword` envía un correo con el asunto "Verifica tu cuenta en Danzas.app", pero `auth.routes.js` solo montaba `POST /register` y `POST /login` y las rutas de recuperación que llama el frontend no existían; ahora se montan `POST /forgot-password` y `POST /reset-password`.

**OBS-08 — RF-013: el comprobante en pantalla usa la fecha actual del navegador (Baja).**
`PaymentCheckout.jsx` muestra "Fecha" con `new Date()` del navegador y no con `pago.procesadoEn`; la respuesta de la API sí trae `comprobante.fecha` correcta. Coinciden salvo que se consulte el comprobante más tarde.
