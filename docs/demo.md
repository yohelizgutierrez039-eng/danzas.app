# Guía de la demostración

Guía para presentar el avance de **Danzas.app** (RF-001 a RF-018 implementados). Dura entre 12 y 15 minutos y usa los datos de `backend/prisma/seed-demo.js`.

> **Todas las cuentas usan la contraseña `Prueba1234`.** Son cuentas de prueba: antes de abrir la plataforma a usuarios reales hay que retirarlas (ver `docs/despliegue.md`, paso 8).

## Índice

1. [Preparación en 5 minutos](#1-preparación-en-5-minutos)
2. [Credenciales](#2-credenciales)
3. [Guion sugerido (12 a 15 minutos)](#3-guion-sugerido-12-a-15-minutos)
4. [Qué viene cargado y qué se hace en vivo](#4-qué-viene-cargado-y-qué-se-hace-en-vivo)
5. [Advertencias honestas: qué evitar o presentar como maqueta](#5-advertencias-honestas-qué-evitar-o-presentar-como-maqueta)
6. [Limitaciones conocidas](#6-limitaciones-conocidas)
7. [Restaurar los datos y solución de problemas](#7-restaurar-los-datos-y-solución-de-problemas)

---

## 1. Preparación en 5 minutos

Hazlo **la mañana de la presentación** (o la noche anterior): las fechas de la demo son relativas a "hoy", y la asistencia de la sesión de hoy queda vacía a propósito para tomarla en vivo.

| # | Paso | Comando o acción |
| - | ---- | ---------------- |
| 1 | Encender MySQL | El mismo servicio que usas para desarrollar. `backend/.env` debe tener `DATABASE_URL` apuntando a la base local |
| 2 | Cargar los datos | Desde `backend/`: `npm run seed:demo` (aditivo, no borra nada) |
| 2b | Alternativa: estado limpio y conocido | `npm run seed:demo -- --reset --yes` (**borra TODO** y deja el seed base + la demo; el `--` es obligatorio) |
| 3 | Levantar el backend | Desde `backend/`: `npm run dev` (escucha en `PORT`, por defecto **3000**) |
| 4 | Levantar el frontend | Desde `frontend/`: `npm run dev` (Vite en **5173**) |
| 5 | Probar | Abre `http://localhost:5173`, entra a **Explorar clases**: deben verse unas 15 clases |

Antes de empezar, ejecuta una vez `npm run seed:demo -- --dry-run`: muestra qué crearía sin escribir nada (lee la base). En la primera corrida real debe decir `Resumen (creados / ya existían / omitidos)` y, al repetirla, **0 creados**.

**Si 3000 o 5173 están ocupados** (otro proyecto): levanta Danzas en otros puertos y apunta el frontend al backend nuevo. Las variables de la terminal tienen prioridad sobre los `.env`.

| Terminal | Backend (`backend/`) | Frontend (`frontend/`) |
| -------- | -------------------- | ---------------------- |
| PowerShell | `$env:PORT=3001; npm run dev` | `$env:VITE_API_URL="http://localhost:3001/api"; npm run dev -- --port 5174` |
| Git Bash | `PORT=3001 npm run dev` | `VITE_API_URL=http://localhost:3001/api npm run dev -- --port 5174` |

Recomendaciones para el día:

- Usa **dos ventanas del navegador** (una normal y una de incógnito): así tienes al administrador y a otro rol a la vez, y el efecto "el estudiante paga y el admin lo ve en el reporte" se nota en vivo.
- Deja visible la **terminal del backend**: cada correo del sistema aparece como `[correo simulado] Para: ... | Asunto: ...` (ver [advertencias](#5-advertencias-honestas-qué-evitar-o-presentar-como-maqueta)).
- Si tienes `RESEND_API_KEY` y `EMAIL_FROM` configurados en `backend/.env`, **quítalos para la demo**: las cuentas `@demo.danzas.app` no existen y los correos reales rebotarían.
- Ten esta guía abierta en otra pantalla. No hay forma de "deshacer" desde la app: si algo sale mal, ve a la [sección 7](#7-restaurar-los-datos-y-solución-de-problemas).

---

## 2. Credenciales

Contraseña de **todas**: `Prueba1234`. Los correos `@demo.danzas.app` los crea la demo; los `@danzas.app` son del seed base (si ya existían, se reutilizan sin tocarlos).

### Administración y seed base

| Rol | Correo | Nombre | Qué mostrar |
| --- | ------ | ------ | ----------- |
| Admin | `admin@danzas.app` | Admin Danzas | Usuarios, solicitudes de academias, reporte de pagos |
| Instructor | `instructor.aprobado@danzas.app` | Camila Rodríguez | **Cuenta principal del instructor.** Academia Ritmo Caribe. Salsa (lun), Bachata (mié) y Folclor (jue, con 1 solo cupo). Aquí se toma asistencia en vivo |
| Instructor | `instructor.independiente@danzas.app` | Julián Torres | Independiente. Danza urbana (mar) y Contemporánea (jue) |
| Instructor | `instructor.pendiente@danzas.app` | Valentina Gómez | Solicitud pendiente (seed base): aún no puede publicar clases |
| Estudiante | `estudiante1@danzas.app` | Andrea Pérez | Historial: Folclor, Contemporánea y una cancelación con reembolso |
| Estudiante | `estudiante2@danzas.app` | Santiago Mejía | Inscripción pendiente de pago en Danza urbana (seed base) |
| Padre | `padre@danzas.app` | Laura Sánchez | Hijos Mateo (Contemporánea, 80 % de asistencia) e Isabella (Folclor, 67 %); una clase cancelada por el instructor |

### Instructores de la demo

| Estado de la solicitud | Correo | Nombre | Qué mostrar |
| ---------------------- | ------ | ------ | ----------- |
| Aprobada, **Academia Ritmo Paisa** | `daniela.ospina@demo.danzas.app` | Daniela Ospina | Medellín: Salsa (mar), Bachata (jue) y Danza urbana (sáb, **llena**). Segunda toma de asistencia en vivo |
| Aprobada, **Escuela Salsa Pacífico** | `andres.herrera@demo.danzas.app` | Andrés Herrera | Cali: Salsa, Bachata y Folclor (este último sin inscritos) |
| Aprobada, independiente | `mariana.castano@demo.danzas.app` | Mariana Castaño | Bogotá: Contemporánea, Bachata y una clase **cancelada** con reembolsos |
| Aprobada, independiente | `jhonatan.barrios@demo.danzas.app` | Jhonatan Barrios | Folclor en Cartagena y Danza urbana en Santa Marta (sin inscritos) |
| **Pendiente**, Academia Urban Flow | `sebastian.rojas@demo.danzas.app` | Sebastián Rojas | El admin la **aprueba** en vivo |
| **Pendiente**, independiente | `natalia.velez@demo.danzas.app` | Natalia Vélez | El admin la **rechaza** en vivo |
| **Rechazada**, Academia Fusión Latina | `carlos.mejia@demo.danzas.app` | Carlos Mejía | Intenta crear una clase y ve el motivo; luego el admin lo **suspende** en vivo |

### Estudiantes y padres de la demo

| Rol | Correo | Nombre | Qué mostrar |
| --- | ------ | ------ | ----------- |
| Estudiante | `valeria.acosta@demo.danzas.app` | Valeria Acosta | Medellín, 4 clases con asistencia |
| Estudiante | `daniel.cardenas@demo.danzas.app` | Daniel Cárdenas | Bogotá. Inscripción **pendiente de pago** (Bachata): para pagar en vivo |
| Estudiante | `monica.restrepo@demo.danzas.app` | Mónica Restrepo | Cali. Salsa y una inscripción **pendiente de pago** (Bachata) |
| Estudiante | `juan.rendon@demo.danzas.app` | Juan Camilo Rendón | Cali. Salsa y una cancelación **sin reembolso** (menos de 2 horas) |
| Estudiante | `felipe.ortega@demo.danzas.app` | Felipe Ortega | Barranquilla. Alumno de Folclor con Camila |
| Estudiante | `isabel.pineda@demo.danzas.app` | Isabel Pineda | Cartagena. Folclor con Camila y con Jhonatan |
| Estudiante | `sara.villamizar@demo.danzas.app` | Sara Villamizar | **Sin inscripciones**: para inscribirse y pagar en vivo desde cero |
| Estudiante | `esteban.quintero@demo.danzas.app` | Esteban Quintero | Cuenta **suspendida**: el login muestra que no puede iniciar sesión |
| Padre | `patricia.londono@demo.danzas.app` | Patricia Londoño | 3 hijos (Samuel, Valentina, Emilia). Asistencias de 40 %, 67 %, 80 % y 100 %; inscripción **pendiente** de Emilia para pagar en vivo |
| Padre | `ricardo.salcedo@demo.danzas.app` | Ricardo Salcedo | 2 hijos. Juan Pablo en Folclor (75 %); María José **sin inscripciones** para inscribirla en vivo |

---

## 3. Guion sugerido (12 a 15 minutos)

| Bloque | Rol | Tiempo |
| ------ | --- | ------ |
| A | Invitado | 2 min |
| B | Estudiante | 3 min |
| C | Padre | 3 min |
| D | Instructor | 3 min |
| E | Administrador | 3 min |
| F | Cierre | 1 min |

Después de iniciar sesión **siempre** se cae en el dashboard del rol, que muestra datos de ejemplo (ver [advertencias](#5-advertencias-honestas-qué-evitar-o-presentar-como-maqueta)). Pasa de largo y navega por el menú lateral.

### A. Invitado: explorar y registrarse (2 min)

1. Abre `http://localhost:5173` (inicio). Muestra clases reales desde la base.
2. Menú **Explorar clases** (`/clases`): usa los filtros **Tipo de baile** y **Ciudad** (por ejemplo Salsa + Cali). Muestra el contador de clases y los cupos.
3. Abre **Ver clase →** en la clase de Danza urbana de Medellín (la que está **llena**, sábado 10:00-11:30): el botón dice **Sin cupos disponibles** y está deshabilitado.
4. Abre cualquier otra clase y pulsa **Inscribirme** sin sesión: aparece el aviso para iniciar sesión o crear cuenta.
5. **Registrarse** (`/registro`, pantalla "Crear cuenta"): elige un rol, nombre, correo, contraseña (mínimo 8 caracteres con letras y números) y ciudad. Registra un **instructor** con un correo nuevo: nace con una solicitud de academia **pendiente** y la verás aparecer en el panel del admin (bloque E). Después del registro vuelve al login; en Danzas **no hay verificación de correo todavía**.

### B. Estudiante: explorar, inscribirse, pagar y cancelar (3 min)

Cuenta: `sara.villamizar@demo.danzas.app` (sin inscripciones) y, para el historial, `estudiante1@danzas.app`.

1. Entra como **Sara**. Ignora el dashboard.
2. Menú lateral **Explorar clases** (usa este y **no** el botón "+ Explorar clases" de Mis inscripciones; ver [advertencias](#5-advertencias-honestas-qué-evitar-o-presentar-como-maqueta)).
3. Filtra por la ciudad **Santa Marta** y abre la **Danza urbana de Jhonatan Barrios** (viernes 16:00-17:00, $32.000, 15 cupos, sin inscritos). **Ver clase →** y **Inscribirme**. (Usa una clase que **no sea de hoy**: si cancelas una clase que empieza en menos de 2 horas no hay reembolso, y si ya empezó no se puede cancelar. Ver [limitaciones](#6-limitaciones-conocidas).)
4. En "Confirma tu inscripción" revisa el resumen y pulsa **Confirmar y continuar al pago**. El cupo ya se descontó: en el explorador la clase pasa de 15 a 14 cupos.
5. En el checkout pulsa **Confirmar pago (simulado)**: aparece **¡Pago aprobado!** con el comprobante `SIM-XXXXXXXXXX`. En la terminal del backend aparece el `[correo simulado]`.
6. **Ir a mis inscripciones**: la inscripción figura **Confirmada** y **Pagado**.
7. Pulsa **Cancelar inscripción**. El diálogo explica la regla: con **2 horas o más** antes de la próxima sesión se reembolsa; con menos, no. Confirma y muestra el aviso verde "el pago será reembolsado". El cupo se libera (la clase vuelve a 15).
8. Para ver un historial con datos: cierra sesión y entra como `estudiante1@danzas.app` → **Mis inscripciones**: inscripciones **Confirmadas** y **Pagadas** con su asistencia ("X de Y sesiones") y una **Cancelada** (la que se canceló con reembolso).

### C. Padre: hijos, inscribir y asistencia (3 min)

Cuenta: `patricia.londono@demo.danzas.app` (3 hijos con asistencia) y `ricardo.salcedo@demo.danzas.app` (inscribir en vivo).

1. Entra como **Patricia** → **Mis hijos**: tres hijos. Muestra **Registrar menor** (nombre y fecha de nacimiento) sin guardar, o registra uno de prueba.
2. **Inscripciones**: elige el hijo en el selector. **Emilia** tiene una inscripción **Pago pendiente** (Danza urbana, la clase llena): pulsa **Completar pago** → **Confirmar pago (simulado)**. Como ya tenía el cupo retenido, el pago entra sin problema.
3. **Asistencia** (`/padre/asistencia`): elige **Samuel** y **Valentina**. Muestra el porcentaje por clase, la barra y el detalle por fecha (Presente/Ausente). Valentina tiene una clase con **40 %** (tasa baja) y otra con 100 %.
4. Para inscribir en vivo: cierra sesión y entra como **Ricardo** → **Explorar clases** → en la **Bachata de Camila** (Barranquilla, miércoles 19:15; sin inscritos) pulsa **Inscribir hijo/a** → elige a **María José** → **Confirmar y continuar al pago** → **Confirmar pago (simulado)**.
5. (Opcional) Entra como `padre@danzas.app` (Laura) → **Asistencia**: el reporte abre en uno de sus dos hijos (el orden no está definido), así que usa el selector **Hijo**: Mateo (80 % en Contemporánea) e Isabella (67 % en Folclor). Si en el bloque D Camila marca a Isabella presente hoy, su porcentaje sube a 75 %.

### D. Instructor: clases, crear clase, asistencia y pagos (3 min)

Cuenta: `instructor.aprobado@danzas.app` (Camila).

1. **Mis clases**: tres clases (Salsa, Bachata y Folclor) con estudiantes inscritos, precio, estado y acciones **Ver / Editar / Cancelar**.
2. **+ Nueva clase** → crea una de prueba: Tipo `Salsa`, Ciudad `Barranquilla`, **Viernes**, `17:00` a `18:00`, cupo `12`, precio `40000`. Antes, muestra la validación: un horario **lunes 19:10-20:00** se rechaza porque queda a menos de 15 minutos de la Salsa del lunes (18:00-19:00): "Este horario se cruza con otra de tus clases o queda a menos de 15 minutos de una." Las clases son **presenciales** (v1.0).
3. **Ver** la clase de **Folclor** (jueves): tarjetas de inscritos, cupos y ocupación. En **Registro de asistencia** la fecha por defecto es **hoy** y los 5 alumnos aparecen **sin marcar**: Felipe Ortega, Andrea Pérez, Juan Pablo Salcedo (Menor), Isabella Sánchez (Menor) e Isabel Pineda. Marca a algunos y pulsa **Guardar asistencia** ("Asistencia guardada correctamente").
4. Cambia la fecha a un jueves pasado: aparecen los registros históricos (5 semanas de datos). Esa misma lista es la que ven los padres en su reporte de asistencia.
5. **Pagos** (`/instructor/pagos`): "Pagos recibidos" con el total recibido, reembolsado y neto. Filtra con **Desde / Hasta** → **Filtrar**.
6. (Opcional) Cancelar una clase: en la de Jhonatan Barrios (Folclor Cartagena, 1 inscrito) pulsa **Cancelar**: la clase pasa a Cancelada, su inscripción se cancela y el pago se reembolsa ("Cancelación del instructor"). Hazlo al final: no se puede deshacer salvo con un reset.

Segunda cuenta de apoyo: `daniela.ospina@demo.danzas.app` también da clase los **jueves** (Bachata de Medellín, 18:30-19:30) con la asistencia de hoy vacía.

**Instructores con solicitud no aprobada** (para mostrar el bloqueo de RF-006): entra como `carlos.mejia@demo.danzas.app` (rechazada) o `sebastian.rojas@demo.danzas.app` (pendiente), intenta **+ Nueva clase**, completa el formulario y guarda: verás el mensaje "Tu solicitud de academia fue rechazada / sigue pendiente de aprobación. No puedes publicar clases hasta que el administrador la apruebe."

Espacios libres seguros para crear una clase en vivo (no chocan con ninguna clase de la demo ni del seed):

| Instructor | Día y hora libres |
| ---------- | ----------------- |
| Camila, Julián, Daniela, Andrés, Mariana | Viernes 17:00-18:00 o 18:00-19:00 |
| Jhonatan | Viernes 18:00-19:00 (su clase de Santa Marta es viernes 16:00-17:00) |

### E. Administrador: usuarios, solicitudes y reporte de pagos (3 min)

Cuenta: `admin@danzas.app`.

1. **Usuarios** (`/admin/usuarios`): total, activos, instructores y estudiantes. Usa la búsqueda y los filtros de **rol** y **estado** (por ejemplo `Suspendido`: aparece Esteban Quintero). Abre **Ver detalles**.
2. **Academias** (`/admin/academias`): "Solicitudes pendientes" (Sebastián Rojas, Natalia Vélez, Valentina Gómez del seed y el instructor que registraste en el bloque A como "Instructor independiente").
   - Abre **Revisar** en *Academia Urban Flow* → **Aprobar** → **Sí, aprobar**. En el backend aparece el correo de resolución simulado.
   - Revisa a *Natalia Vélez* → **Rechazar** → **Sí, rechazar**.
   - Vuelve a entrar como Sebastián: ahora **sí** puede crear clases (antes no).
3. **Suspender**: entra a **Usuarios** → **Ver detalles** de *Carlos Mejía* → **Suspender usuario** → **Sí, suspender**. Cierra sesión e intenta entrar como Carlos: "Tu cuenta está suspendida. Contacta al administrador." (Con **Editar usuario** el admin puede cambiar su estado de nuevo.)
4. **Reportes** (`/admin/reportes`, "Reporte de pagos"): sin filtros muestra todos los pagos. Prueba:
   - **Desde / Hasta**: por ejemplo las últimas 2 semanas → **Generar reporte**.
   - **Instructor**: elige *Mariana Castaño*: ve cobros y **reembolsos** (la clase cancelada y una cancelación anticipada) con el motivo.
   - **Academia** (texto exacto): `Academia Ritmo Caribe`, `Academia Ritmo Paisa` o `Escuela Salsa Pacífico`.
   - Explica las tarjetas **Total recibido**, **Total reembolsado** y **Neto**.

   Cifras esperadas si la base solo tiene el seed base + la demo y no has pagado nada en vivo todavía: **26 pagos, $1.181.000 recibidos, $118.000 reembolsados y $1.063.000 netos**. Por instructor: Camila $275.000 (incluye los $100.000 del seed base), Daniela $288.000, Mariana $313.000 (de los cuales $118.000 reembolsados), Julián $110.000, Andrés $165.000, Jhonatan $30.000. Cada pago nuevo que hagas en vivo suma a estos totales.

### F. Cierre (1 min)

Recapitula: 4 roles, inscripción con cupo controlado, pago simulado con comprobante, cancelación con regla de reembolso de 2 horas, asistencia por sesión visible para los padres, reportes y aprobación de academias. Menciona lo que **sigue** (dashboards con datos reales, perfil, notificaciones en la app, pasarela de pago real).

---

## 4. Qué viene cargado y qué se hace en vivo

### Precargado

| Qué | Detalle |
| --- | ------- |
| Usuarios | 5 del seed base reutilizados + 17 nuevos (4 instructores aprobados, 2 pendientes, 1 rechazado, 7 estudiantes activos, 1 suspendido, 2 padres) |
| Menores | 5 nuevos (3 de Patricia y 2 de Ricardo) + Mateo e Isabella de Laura |
| Clases nuevas | 13: 12 activas y 1 cancelada por su instructor (ver tabla) |
| Inscripciones | 27 nuevas: 20 confirmadas, 3 pendientes de pago y 4 canceladas (1 anticipada por el estudiante, con reembolso; 1 tardía por el estudiante, sin reembolso; y 2 por el instructor al cancelar su clase, con reembolso) |
| Pagos | 24 simulados (`SIM-…`) repartidos entre unas 5 semanas atrás y hace unos 4 días |
| Asistencia | Unas 70 filas: las últimas 5 sesiones semanales de las clases más concurridas, en el día de la semana correcto |

Cambios en cuentas del seed base (la demo **suma historial, no modifica ni borra** lo existente): Camila gana la clase de Folclor; Julián gana Contemporánea; Andrea gana 3 inscripciones; Laura gana inscripciones de Mateo (Contemporánea) e Isabella (Folclor y una clase cancelada). **No** se tocan las clases del seed base (Salsa, Bachata y Danza urbana), así que sus cupos siguen siendo 13, 12 y 19. Pero los **totales** de `/admin/reportes` y `/instructor/pagos` cambian respecto de lo que dicen los casos de `docs/qa/` (por ejemplo "2 pagos, $100.000" pasa a 26 pagos). Para volver a los números de QA corre solo el seed base (`npx prisma db seed` desde `backend/`), que **borra todo**, incluida la demo.

### Clases de la demo (más las 3 del seed base)

| Instructor | Clase | Ciudad | Horario | Precio | Cupos libres / máx. | Nota |
| ---------- | ----- | ------ | ------- | ------ | ------------------- | ---- |
| Camila | Folclor | Barranquilla | Jue 18:00-19:00 | $35.000 | **1** / 6 | Un solo cupo; asistencia en vivo |
| Julián | Contemporánea | Medellín | Jue 19:00-20:00 | $55.000 | 8 / 10 | |
| Daniela | Salsa | Medellín | Mar 19:00-20:00 | $45.000 | 16 / 18 | |
| Daniela | Bachata | Medellín | Jue 18:30-19:30 | $42.000 | 13 / 15 | Asistencia en vivo |
| Daniela | Danza urbana | Medellín | Sáb 10:00-11:30 | $38.000 | **0** / 4 | **Llena** (incluye una inscripción pendiente de pago) |
| Andrés | Salsa | Cali | Lun 19:00-20:30 | $60.000 | 12 / 14 | |
| Andrés | Bachata | Cali | Mié 19:00-20:00 | $45.000 | 11 / 12 | Una pendiente de pago (Mónica) |
| Andrés | Folclor | Cali | Sáb 15:00-16:30 | $50.000 | 8 / 8 | **Sin inscritos** |
| Mariana | Contemporánea | Bogotá | Mar 18:00-19:30 | $65.000 | 7 / 10 | |
| Mariana | Bachata | Bogotá | Jue 19:00-20:00 | $48.000 | 11 / 12 | Una pendiente de pago (Daniel) |
| Mariana | Danza urbana | Bogotá | Sáb 11:00-12:00 | $35.000 | (13 / 15) | **Cancelada** por la instructora, reembolsada; no aparece en el explorador |
| Jhonatan | Folclor | Cartagena | Mié 17:30-18:30 | $30.000 | 19 / 20 | |
| Jhonatan | Danza urbana | Santa Marta | Vie 16:00-17:00 | $32.000 | 15 / 15 | **Sin inscritos** |
| Camila (base) | Salsa / Bachata | Barranquilla | Lun 18:00-19:00 / Mié 19:15-20:15 | $50.000 / $45.000 | 13 / 15 y 12 / 12 | La Bachata no tiene inscritos |
| Julián (base) | Danza urbana | Medellín | Mar 17:00-18:00 | $40.000 | 19 / 20 | Santiago Mejía: pendiente de pago |

### Para hacer en vivo

| Acción | Con qué cuenta | Qué la habilita |
| ------ | -------------- | --------------- |
| Pagar una inscripción pendiente | `daniel.cardenas@...` (Bachata Bogotá), `monica.restrepo@...` (Bachata Cali), `estudiante2@danzas.app` (Danza urbana Medellín) | Inscripciones en estado "Pago pendiente" |
| Pagar la inscripción pendiente de un hijo | `patricia.londono@...` → Emilia | Inscripción pendiente en la clase llena |
| Inscribirse desde cero | `sara.villamizar@...` (estudiante), `ricardo.salcedo@...` → María José (padre) | Cuentas sin inscripciones; clases libres: Folclor Cali, Danza urbana Santa Marta, Bachata de Camila |
| Tomar asistencia hoy | Camila (Folclor, jueves) o Daniela (Bachata, jueves) | La sesión de hoy no tiene registros |
| Aprobar / rechazar solicitudes | Admin | Sebastián Rojas, Natalia Vélez (y Valentina Gómez del seed) |
| Suspender una cuenta | Admin | Carlos Mejía |
| Crear una clase | Cualquier instructor aprobado | Hueco del viernes (ver tabla del bloque D) |
| Cancelar una clase | Jhonatan Barrios | Folclor Cartagena (1 inscrito, con reembolso) |

### Cómo restaurar

| Situación | Comando (desde `backend/`) |
| --------- | -------------------------- |
| Faltan datos de la demo, sin perder lo que haya | `npm run seed:demo` (omite lo que ya existe) |
| Quedó "sucio" por los clics en vivo | `npm run seed:demo -- --reset --yes` (borra todo y recarga) |
| Ver qué haría sin escribir | `npm run seed:demo -- --dry-run` |
| Sembrar una base que no es localhost (p. ej. la desplegada) | agrega `--allow-remote` (la demo crea cuentas con contraseña conocida) |

`seed:demo` en modo aditivo **no revierte** lo que hiciste en vivo (aprobaciones, suspensiones, pagos, clases creadas): para eso usa `--reset --yes`.

---

## 5. Advertencias honestas: qué evitar o presentar como maqueta

### Pantallas con datos de ejemplo (no están conectadas al backend)

| Pantalla | Ruta | Cómo tratarla |
| -------- | ---- | ------------- |
| Los **cuatro dashboards** (estudiante, padre, instructor, admin) | `/estudiante`, `/padre`, `/instructor`, `/admin` | Es donde se cae tras el login. Los números y la actividad reciente son de ejemplo: no los comentes ni los uses como evidencia. Pasa directo al menú |
| **Clases** del admin | `/admin/classes`, `/admin/classes/:id` | Datos temporales: evitar |
| **Academias** para invitados | `/academias`, `/academias/:id` | Datos de demostración: no las muestres como reales (las academias reales están en el panel del admin y en el reporte) |

### Menú lateral con "Próximamente" (17 secciones)

Se ven en el menú pero abren una pantalla "Próximamente". **Evita pulsarlas** o preséntalas como el plan de trabajo.

| Rol | Secciones en "Próximamente" |
| --- | --------------------------- |
| Admin (3) | Pagos, Notificaciones, Mi perfil |
| Estudiante (5) | Mis clases, Asistencia, Pagos, Notificaciones, Mi perfil |
| Padre (3) | Pagos, Notificaciones, Mi perfil |
| Instructor (6) | Estudiantes, Asistencia, Calendario, Reportes, Notificaciones, Mi perfil |

Trampas concretas:

- En **Mis inscripciones** del estudiante, el botón **"+ Explorar clases"** (y el de la pantalla vacía) lleva a `/estudiante/clases`, que es "Próximamente". Usa el menú **Explorar clases**.
- El menú **Asistencia** del instructor es "Próximamente": la asistencia se toma dentro de **Mis clases → Ver** de cada clase.
- El reporte de pagos del admin está en **Reportes**, no en **Pagos** (que es "Próximamente").
- El **Mi perfil** del pie del menú es "Próximamente" en todos los roles.

### Lo que es simulado

- **Correos:** no se envía ninguno. Con `RESEND_API_KEY` o `EMAIL_FROM` sin configurar, el backend los imprime en su consola como `[correo simulado] Para: ... | Asunto: ...`. Se emiten al pagar, al cancelar una inscripción, al cancelar una clase y al aprobar o rechazar una academia. No hay bandeja de entrada en la app.
- **Pagos:** son simulados (`esSimulado`): siempre se aprueban, no hay tarjeta ni pasarela, y el comprobante es una referencia `SIM-XXXXXXXXXX`. La integración real queda para v2.0.
- **Sin verificación de correo:** quien se registra queda "Pendiente" y puede iniciar sesión sin confirmar el correo. Que un instructor tenga estado "Pendiente" no le impide crear clases: lo que cuenta es su solicitud de academia aprobada.
- **Modalidad virtual:** no está permitida en v1.0 (todas las clases son presenciales); el filtro del explorador sí lista "Virtual" pero no devolverá clases.

---

## 6. Limitaciones conocidas

Para que nada sorprenda en vivo:

- **Una inscripción pendiente de pago retiene un cupo** y el usuario **no puede cancelarla** desde la app (solo **Completar pago**). Si nadie la paga, el cupo queda ocupado. Por eso la Danza urbana de Medellín sigue "llena" aunque Emilia no haya pagado.
- Una vez pagada, la cancelación **solo reembolsa con 2 horas o más** de anticipación a la **próxima sesión**. Como las clases son semanales, casi siempre cae en reembolso. Para mostrar el caso "sin reembolso" no hay datos que dependan del reloj: hay una inscripción ya cancelada sin reembolso (Juan Camilo, Bachata de Cali) que se ve en el historial del admin y en el reporte.
- No se puede cancelar mientras la clase está en curso ("La clase ya comenzó"). **Ojo si presentas un jueves por la tarde**: las clases del jueves empiezan entre las 18:00 y las 19:00 (Folclor de Camila, Bachata de Daniela, Contemporánea de Julián, Bachata de Mariana). Entre las 16:00 y las 19:00 cancelar una de ellas no reembolsa y durante la clase da error. Para el flujo de cancelación usa clases de otros días (por eso el guion usa la de Santa Marta, del viernes).
- Cuando el **instructor cancela una clase**, las inscripciones se cancelan y se reembolsan, pero **el cupo no se libera** en la clase cancelada (por eso la de Mariana conserva "13 de 15"). No afecta nada visible: no aparece en el explorador.
- El reporte de pagos agrupa por la fecha de `procesadoEn`: un pago **reembolsado cae en la fecha del reembolso**, no en la del cobro (limitación documentada del código).
- El filtro **Academia** del reporte exige el **nombre exacto** de una academia con solicitud aprobada; no busca por parte del nombre.
- Después de **5 intentos fallidos** de contraseña la cuenta se **bloquea 15 minutos** ("Cuenta bloqueada"). Cuidado al teclear en vivo.
- El admin **no puede suspenderse ni eliminarse** a sí mismo, y **no puede eliminar** a un usuario con información asociada (casi todos los de la demo): suspéndelo.
- La lista de asistencia solo incluye alumnos con inscripción **confirmada** (las pendientes y las canceladas no aparecen).
- "Estudiantes inscritos" en Mis clases se calcula como cupo máximo menos cupo disponible, así que cuenta también las inscripciones pendientes de pago.

---

## 7. Restaurar los datos y solución de problemas

### Reset rápido

```bash
cd backend
npm run seed:demo -- --reset --yes
```

Corre primero `prisma/seed.js` (borra **todas** las tablas y crea los 7 usuarios base) y luego carga la demo. **Nunca** lo uses sobre datos reales ni sobre la base desplegada con un admin real (borra al admin real, ver `docs/despliegue.md`, paso 8).

### Problemas frecuentes

| Síntoma | Causa probable | Solución |
| ------- | -------------- | -------- |
| `P1001` o "No se pudo conectar a MySQL" | MySQL apagado, o `DATABASE_URL` mal | Enciende MySQL y revisa host y puerto en `backend/.env` |
| `P1003` / base inexistente | No se creó la base | Créala y aplica el esquema con `npx prisma db push` |
| `P2021` / `P2022` (falta tabla o columna) | Esquema sin aplicar o desactualizado | `npx prisma db push` desde `backend/` y repite |
| `[ABORTADO] El destino ... no es localhost` | `DATABASE_URL` apunta a una base remota | Si de verdad quieres sembrarla, agrega `--allow-remote` (crea cuentas con contraseña conocida) |
| `[ABORTADO] --reset BORRA TODOS los datos` | Falta `--yes` | `npm run seed:demo -- --reset --yes` (con el `--` antes de las opciones) |
| `Opción desconocida: --…` | Typo en una opción | El script rechaza opciones desconocidas para no escribir por error: corrige el nombre |
| "Resumen" con **omitidos** y avisos de "se cruza con otra clase" | Una clase hecha a mano ocupa ese horario del instructor | Es inofensivo: esa clase y sus inscripciones se omiten. Para un estado limpio usa `--reset --yes` |
| Login: "Correo o contraseña incorrectos" con una cuenta del seed | La cuenta ya existía con otra contraseña (el modo aditivo **no la pisa**) | `--reset --yes`, o entra con otra cuenta |
| Login: "Cuenta bloqueada" | 5 intentos fallidos | Espera 15 minutos o usa `--reset --yes` |
| El explorador no muestra clases / error de red | Backend apagado o `VITE_API_URL` incorrecta | Revisa que el backend corra y que `VITE_API_URL` termine en `/api` (por ejemplo `http://localhost:3000/api`); reinicia Vite tras cambiarla |
| `EADDRINUSE` en el backend | El puerto 3000 está ocupado | `PORT=3001` (ver sección 1) y ajusta `VITE_API_URL` |
| Los cupos o pagos ya no coinciden con la guía | Se hicieron inscripciones, pagos o cancelaciones en vivo | `--reset --yes` |
| No aparece la sesión de hoy vacía para tomar asistencia | La clase no es de hoy: la fecha se elige a mano | En **Registro de asistencia**, la fecha por defecto es la de hoy; puedes marcar asistencia de cualquier fecha |
| Correos que "no llegan" | Son simulados | Míralos en la terminal del backend (`[correo simulado]`) |

### Después de la presentación

Las cuentas de la demo y del seed tienen la contraseña pública `Prueba1234`. Si cargaste los datos en la base **desplegada**, retira o suspende esas cuentas antes de abrir la plataforma (ver `docs/despliegue.md`, paso 8).
