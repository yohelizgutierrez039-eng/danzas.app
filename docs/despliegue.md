# Guía de despliegue (Plan A: todo en planes gratuitos)

Esta guía permite que cualquier integrante del equipo despliegue Danzas.app sin preguntar nada. Cubre la tarjeta de Notion **"[Sprint 0 - Despliegue] [01] DevOps: Despliegue a producción y proveedor de MySQL"**.

**Fechas de referencia:** UAT del 19 al 30/10/2026 y entrega el 31/10/2026.

> **Cómo leer esta guía.** Los hechos tomados de la documentación oficial (revisada el 18/10/2026) están escritos sin marca. Todo lo que **no pudimos confirmar** aparece como **"por confirmar"**: no lo des por cierto, pruébalo y corrígelo aquí si resulta distinto.

## Contenido

1. [Arquitectura](#1-arquitectura)
2. [Qué cuenta crea cada persona](#2-qué-cuenta-crea-cada-persona)
3. [Orden de pasos](#3-orden-de-pasos)
4. [Variables de entorno](#4-variables-de-entorno)
5. [Checklist de verificación](#5-checklist-de-verificación)
6. [Límites y cuidados del plan gratuito](#6-límites-y-cuidados-del-plan-gratuito)
7. [Problemas frecuentes](#7-problemas-frecuentes)
8. [Seguridad](#8-seguridad)
9. [Plan de salida y escala](#9-plan-de-salida-y-escala)

---

## 1. Arquitectura

```text
  Navegador
     |
     v
 +-----------+   VITE_API_URL    +-----------------+   DATABASE_URL   +----------------+
 |  Vercel   | ----------------> |  Render (free)  | ---------------> | Aiven (free)   |
 | frontend/ |   https + /api    |  backend/       |   MySQL + TLS    | MySQL 1 nodo   |
 | React+Vite|                   |  Express+Prisma |                  | defaultdb      |
 +-----------+                   +--------+--------+                  +----------------+
                                          |    ^
                          correos (HTTPS) |    | GET /api/prueba-db cada ~5 min
                                          v    |
                                    +--------+  +-------------------------+
                                    | Resend |  | Pinger (UptimeRobot o   |
                                    +--------+  | cron-job.org)           |
                                                +-------------------------+
```

| Pieza | Qué hace | Plan |
| --- | --- | --- |
| Vercel | Sirve el frontend (archivos estáticos de `frontend/`) | Hobby (gratis) |
| Render | Ejecuta la API de `backend/` | Web service `free` |
| Aiven | Base de datos MySQL | Free tier (1 servicio por organización) |
| Resend | Envía el correo de recuperación de contraseña | Plan gratuito (opcional) |
| Pinger | Mantiene despierta la API para evitar el arranque en frío | Gratuito (opcional, recomendado) |

Archivos del repositorio que lo hacen posible:

| Archivo | Para qué sirve |
| --- | --- |
| `render.yaml` (raíz) | Blueprint de Render: define el servicio `danzas-api` |
| `frontend/vercel.json` | Reescribe todas las rutas a `index.html` (el frontend es una SPA) |
| `backend/.env.example`, `frontend/.env.example` | Lista de variables con valores de ejemplo |
| `backend/scripts/check-db.js` (`npm run db:check`) | Prueba la conexión a la base desde tu computadora |
| `backend/scripts/create-admin.js` (`npm run create:admin`) | Crea el administrador real |

---

## 2. Qué cuenta crea cada persona

Basta con **una persona del equipo por plataforma**; las demás se agregan como colaboradoras si hace falta. Ninguna de estas plataformas pide tarjeta para el plan que usamos, salvo que se indique lo contrario.

| Plataforma | Quién la crea | Datos que se necesitan | Tarjeta |
| --- | --- | --- | --- |
| Aiven | Una persona (responsable de datos) | Correo | No |
| Render | Una persona (responsable del backend) | Cuenta de GitHub con acceso al repositorio | No para el plan `free` |
| Vercel | Una persona (responsable del frontend) | Cuenta de GitHub con acceso al repositorio | No para Hobby |
| Resend | Una persona (opcional) | Correo | No |
| UptimeRobot o cron-job.org | Cualquiera (opcional) | Correo | No (verificar en su sitio) |

Notas:

- Aiven permite **un solo servicio MySQL gratuito por organización**. No crees uno de prueba "por si acaso": gastarías el cupo.
- Vercel Hobby es solo para **uso personal y no comercial**. Es válido para este proyecto académico; si el proyecto se comercializa, hay que pasar a otro plan.
- Render debe tener permiso sobre el repositorio de GitHub. Si el repositorio es de otra cuenta u organización, esa persona debe autorizar la app de Render.
- Guarda las credenciales en el gestor de contraseñas del equipo, **no** en el repositorio ni en chats.

---

## 3. Orden de pasos

Respeta el orden: cada paso necesita un dato del anterior.

> **Antes de empezar:** estos archivos (`render.yaml`, `frontend/vercel.json`) deben estar en la rama que usarán Render y Vercel (normalmente `main`). Haz el merge de la rama `chore/despliegue-plan-a` primero.

### Paso 1. Crear la base en Aiven

1. Entra a la consola de Aiven y crea un servicio **MySQL** con el plan **Free**.
2. Anota la **región** del servicio (la necesitas en el paso 4).
3. Cuando el servicio esté en estado "Running", abre la página **Overview** y copia:
   - **Service URI** (tiene la forma `mysql://avnadmin:<contraseña>@<host>:<puerto>/defaultdb?...`)
   - Host, puerto, usuario (`avnadmin`) y base (`defaultdb`) por separado, por si necesitas armar la URL a mano.

Datos del plan gratuito: 1 nodo, 1 CPU, 1 GB de RAM, 1 GB de disco, con copias de seguridad, `max_connections` = 76, sin límite de tiempo. No hay VPC ni IP estática.

Documentación: <https://aiven.io/docs/products/mysql/concepts/mysql-free-tier>

### Paso 2. Probar la URL en tu computadora con `db:check`

Nunca despliegues sin haber probado la URL antes: es mucho más fácil depurar TLS desde tu terminal que desde los logs de Render.

1. Instala dependencias una sola vez:

   ```bash
   cd backend
   npm ci
   npx prisma generate
   ```

2. Define `DATABASE_URL` **solo para ese comando** y ejecuta la prueba. Usa comillas simples para que `$`, `&` o `?` de la contraseña/URL no se interpreten.

   **Git Bash:**

   ```bash
   DATABASE_URL='mysql://avnadmin:TU_CLAVE@TU_HOST:TU_PUERTO/defaultdb?ssl-mode=REQUIRED&connection_limit=5' npm run db:check
   ```

   **PowerShell:**

   ```powershell
   $env:DATABASE_URL='mysql://avnadmin:TU_CLAVE@TU_HOST:TU_PUERTO/defaultdb?ssl-mode=REQUIRED&connection_limit=5'
   npm run db:check
   Remove-Item Env:DATABASE_URL   # limpia la variable de esta sesión
   ```

3. Resultado esperado:

   ```text
   Probando conexión a <host>:<puerto> (base: defaultdb)...
   ✅ Conexión correcta: SELECT 1 respondió.
   ✅ La conexión va cifrada (TLS): <nombre del cifrado>
   ```

   El script **nunca imprime usuario ni contraseña**. Sale con código 0 si todo va bien y 1 si falla (con una lista de causas probables).

#### TLS: qué URL usar (por confirmar)

La documentación de Aiven que revisamos **no dice** si TLS es obligatorio ni cómo debe pasar Prisma el certificado de la CA. Por eso se prueba en este orden y se queda con la primera opción que funcione:

| Orden | Qué probar | Cuándo pasar a la siguiente |
| --- | --- | --- |
| 1 | La **Service URI tal cual se copió** de la consola (normalmente trae un parámetro `ssl-mode`) | Si Prisma rechaza un parámetro `ssl-mode` desconocido |
| 2 | Quitar `ssl-mode` y usar `?sslaccept=accept_invalid_certs` (es el valor por defecto de Prisma: **cifra pero no valida** el certificado) | Solo si necesitas validar el certificado |
| 3 | Validación estricta: descargar el certificado de la CA desde la consola de Aiven y usar `?sslaccept=strict&sslcert=<ruta-al-archivo>` | — |

Detalles de la opción 3:

- La CA es pública, pero **no la subas al repositorio** salvo que el equipo lo decida. En Render habría que dar una ruta que exista en el servidor, lo que obliga a decidir cómo se entrega el archivo (por confirmar).
- Para este proyecto académico, la opción 2 (cifrado sin validar el certificado) es un compromiso razonable; la opción 3 es la ideal.

Argumentos de URL de Prisma documentados: `sslcert`, `sslidentity`, `sslaccept` (por defecto `accept_invalid_certs`) y `connect_timeout`. Referencia: <https://www.prisma.io/docs/orm/overview/databases/mysql>

#### `connection_limit` (recomendado)

Agrega `connection_limit=5` a la URL (con `&`, o con `?` si no hay otros parámetros). Es un argumento estándar de Prisma para limitar el pool y mantenerse muy por debajo de las 76 conexiones del plan. **Verifícalo con `db:check`** (por confirmar que Aiven/Prisma no lo rechazan en esta combinación).

### Paso 3. Crear las tablas con `prisma db push`

El repositorio **no tiene carpeta `prisma/migrations`**: el equipo siempre trabajó con `prisma db push`. Por eso **no se usa `migrate deploy`** (no hay migraciones que aplicar). Crear una migración base es una mejora posterior.

Con la URL que ya probaste en el paso 2:

**Git Bash:**

```bash
cd backend
DATABASE_URL='mysql://avnadmin:TU_CLAVE@TU_HOST:TU_PUERTO/defaultdb?ssl-mode=REQUIRED&connection_limit=5' npx prisma db push
```

**PowerShell:**

```powershell
cd backend
$env:DATABASE_URL='mysql://avnadmin:TU_CLAVE@TU_HOST:TU_PUERTO/defaultdb?ssl-mode=REQUIRED&connection_limit=5'
npx prisma db push
Remove-Item Env:DATABASE_URL
```

Revisa que el encabezado que imprime Prisma (algo como `Datasource "db": MySQL database "defaultdb" at "<host>:<puerto>"`; el formato exacto puede variar) muestre el **host de Aiven** y no tu base local.

- En una base vacía no pide confirmaciones.
- **No uses `--accept-data-loss`.** Si Prisma advierte pérdida de datos, detente y consulta al equipo.

### Paso 4. Crear el servicio en Render

Elige la región **más cercana a la del servicio de Aiven** (paso 1). La región se define al crear el servicio y **no se puede cambiar después**; por defecto es `oregon`. Revisa ambas consolas antes de crear. Si la región cambia, edita el campo `region` de `render.yaml` antes de crear el Blueprint.

#### Opción A: Blueprint (recomendada)

1. En Render: **New > Blueprint** y conecta el repositorio de GitHub.
2. Render detecta `render.yaml` en la raíz y propone el servicio `danzas-api`.
3. Render pide el valor de las variables marcadas `sync: false`. Completa:

   | Variable | Valor |
   | --- | --- |
   | `DATABASE_URL` | La URL que ya probaste en el paso 2 |
   | `FRONTEND_URL` | Valor provisional `http://localhost:5173` (se corrige en el paso 6) |
   | `RESEND_API_KEY` | Tu clave de Resend, o déjala vacía si no usarás correos |
   | `EMAIL_FROM` | Remitente verificado en Resend, o vacío |

4. Crea el Blueprint y espera el primer despliegue.

> Render pide el valor de las variables `sync: false` **solo la primera vez** que se crea el Blueprint. Si más adelante se agrega otra variable secreta al `render.yaml`, hay que cargarla a mano en **Environment**.

`JWT_SECRET` lo genera Render automáticamente (`generateValue: true`). `PORT` lo inyecta Render: no lo definas.

#### Opción B: manual (mismos valores)

**New > Web Service**, elige el repositorio y completa:

| Campo | Valor |
| --- | --- |
| Name | `danzas-api` |
| Region | La misma que Aiven (o la más cercana) |
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `npm ci --include=dev && npx prisma generate` |
| Start Command | `npm start` |
| Instance Type | Free |
| Auto-Deploy | On Commit |
| Health Check Path | **Vacío** (ver más abajo) |

Y en **Environment**, las variables de la [sección 4](#4-variables-de-entorno).

#### Decisiones del `render.yaml` que conviene entender

- **`--include=dev` en el build:** `prisma` (la CLI) está en `devDependencies`. Si Render instala con `NODE_ENV=production`, `npm ci` omitiría esas dependencias y `npx prisma generate` fallaría. No hay script `postinstall`, así que el cliente de Prisma se genera en el build.
- **Sin `healthCheckPath`:** el único endpoint de salud (`/api/prueba-db`) consulta la base de datos. Si Aiven está apagado o despertando, Render daría el servicio por caído y lo reiniciaría. Sin health check, solo verifica que el puerto responda.
- **`NODE_VERSION=22`:** es la variable con la que fijamos la versión de Node. **Por confirmar en la documentación de Render** que sea la forma vigente. El CI del repositorio usa Node 20; si el build falla por la versión, prueba con `20`.

Referencia del Blueprint: <https://render.com/docs/blueprint-spec>

Cuando termine el despliegue, anota la URL pública, algo como `https://danzas-api.onrender.com`, y prueba:

```text
https://<servicio>.onrender.com/api/prueba-db
```

Debe responder 200 con `{"mensaje":"Conexión con MySQL correcta","datos":[{"resultado":1}]}`.

### Paso 5. Desplegar el frontend en Vercel

1. En Vercel: **Add New > Project** e importa el repositorio.
2. Configura:

   | Campo | Valor |
   | --- | --- |
   | Root Directory | `frontend` |
   | Framework Preset | Vite |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |

3. En **Environment Variables** agrega `VITE_API_URL` con la URL de Render **incluyendo `/api`**:

   ```text
   https://<servicio>.onrender.com/api
   ```

4. Despliega y anota la URL pública (por ejemplo `https://danzas-app.vercel.app`).

Importante:

- `VITE_API_URL` se **incrusta al compilar** (Vite). Si cambia, hay que **volver a desplegar** el frontend: editar la variable no basta.
- `frontend/vercel.json` reescribe todo a `/index.html`. Sin él, recargar una ruta como `/admin/reportes` da 404. Los archivos estáticos (JS, CSS, imágenes) se siguen sirviendo primero.

Referencia: <https://vercel.com/docs/project-configuration>

### Paso 6. Apuntar `FRONTEND_URL` al frontend real

1. En Render, servicio `danzas-api` > **Environment**: cambia `FRONTEND_URL` por la URL de Vercel, **sin "/" final**.
2. Guarda; Render redespliega solo.
3. Revisa CORS: abre el frontend con las herramientas del navegador (pestaña Network/Consola) y confirma que las llamadas a la API no muestran errores de CORS. Hoy el backend usa `cors()` abierto, así que no debería haber ninguno (ver [Seguridad](#8-seguridad)).

`FRONTEND_URL` se usa para armar el enlace del correo de recuperación de contraseña.

### Paso 7. Mantener despierta la API con un pinger

Render `free` se duerme tras unos 15 minutos sin tráfico y el primer acceso tarda cerca de 1 minuto. Un servicio externo que llame a la API cada ~5 minutos lo evita.

1. Crea un monitor en UptimeRobot o cron-job.org (ambos gratuitos; **verifica en su sitio** los límites actuales del plan gratuito, como el intervalo mínimo).
2. URL: `https://<servicio>.onrender.com/api/prueba-db`, método GET, cada 5 minutos.

Cuentas de horas: un servicio encendido 24/7 son ~744 h al mes y el plan incluye 750 h gratuitas **por workspace**. Cabe, pero **todos los servicios gratuitos del workspace comparten esas horas**: no crees otros servicios gratuitos en el mismo workspace.

Ese endpoint consulta la base, así que, **suponemos** que también cuenta como actividad para que Aiven no apague el servicio por inactividad. **Esto no está confirmado (por confirmar).** Revisa la consola de Aiven periódicamente.

### Paso 8. Crear el administrador (y política del seed)

El registro público solo permite `estudiante`, `padre` e `instructor`. **No existe forma de crear un admin por la API**, por eso existe `create:admin`.

#### Opción recomendada: `create:admin` (cuenta real)

Define `ADMIN_EMAIL` y `ADMIN_PASSWORD` (mínimo 10 caracteres) solo para el comando. El script es idempotente: si el correo ya es de un admin, cambia su contraseña. Se niega a convertir en admin a un usuario existente con otro rol. Nunca imprime la contraseña. `ADMIN_NOMBRE` es opcional.

Primero un ensayo (no escribe nada):

**Git Bash:**

```bash
cd backend
DATABASE_URL='mysql://avnadmin:TU_CLAVE@TU_HOST:TU_PUERTO/defaultdb?ssl-mode=REQUIRED&connection_limit=5' \
ADMIN_EMAIL='admin@tu-dominio.com' ADMIN_PASSWORD='una-clave-larga-y-unica' \
npm run create:admin -- --dry-run
```

**PowerShell:**

```powershell
cd backend
$env:DATABASE_URL='mysql://avnadmin:TU_CLAVE@TU_HOST:TU_PUERTO/defaultdb?ssl-mode=REQUIRED&connection_limit=5'
$env:ADMIN_EMAIL='admin@tu-dominio.com'
$env:ADMIN_PASSWORD='una-clave-larga-y-unica'
npm run create:admin -- --dry-run
```

Si el resultado es el esperado, repite el comando **sin** `-- --dry-run`. En PowerShell, al terminar limpia las variables:

```powershell
Remove-Item Env:DATABASE_URL, Env:ADMIN_EMAIL, Env:ADMIN_PASSWORD
```

#### Datos de prueba con el seed (solo UAT, solo base vacía)

Los casos de `docs/qa/casos-prueba-sprint5.md` usan las cuentas del seed. Para ejecutarlos contra el despliegue:

```bash
cd backend
DATABASE_URL='<tu URL de Aiven>' npx prisma db seed
```

> **PELIGRO.** `backend/prisma/seed.js` **BORRA todas las filas** (`deleteMany` en todas las tablas) y crea 7 cuentas con la contraseña conocida **`Prueba1234`**, incluido el admin `admin@danzas.app`.
>
> - Úsalo **solo en una base vacía** y solo durante el UAT.
> - **Nunca** en una base con datos reales: los destruye.
> - Antes de abrir el sistema a usuarios reales hay que **eliminar o inutilizar esas cuentas**, sobre todo la de admin.

Cómo retirar las cuentas del seed antes de la entrega:

1. Crea tu admin real con `create:admin` (con un correo distinto del del seed).
2. Inicia sesión con ese admin y suspende las cuentas del seed desde el panel de usuarios. Una cuenta suspendida no puede iniciar sesión. Que el panel permita suspender las 7 cuentas está **por confirmar**.
3. Alternativa drástica: dejar la base vacía y volver a crear solo el admin real. Es una acción destructiva; coordínala con el equipo.

Atajo: si ya existe `admin@danzas.app` del seed, `create:admin` con ese correo le cambia la contraseña (porque ya es admin), pero la cuenta sigue con un correo conocido. Es mejor un admin nuevo.

---

## 4. Variables de entorno

Ninguna variable sensible va en el código ni en el repositorio: todas se definen en la plataforma.

### Backend (Render)

| Variable | Dónde se define | Ejemplo | Secreto |
| --- | --- | --- | --- |
| `DATABASE_URL` | Render (`sync: false`) | `mysql://avnadmin:***@<host>:<puerto>/defaultdb?ssl-mode=REQUIRED&connection_limit=5` | **Sí** |
| `JWT_SECRET` | Render (se genera sola) | valor aleatorio | **Sí** |
| `JWT_EXPIRES_IN` | `render.yaml` | `1h` (formato de `jsonwebtoken`: `30m`, `1h`, `7d`) | No |
| `NODE_ENV` | `render.yaml` | `production` (ignora `simularRechazo` en el pago simulado) | No |
| `NODE_VERSION` | `render.yaml` | `22` (**por confirmar** en la documentación de Render) | No |
| `FRONTEND_URL` | Render (`sync: false`) | `https://danzas-app.vercel.app` (sin "/" final) | No |
| `RESEND_API_KEY` | Render (`sync: false`) | `re_...` | **Sí** |
| `EMAIL_FROM` | Render (`sync: false`) | `Danzas.app <no-reply@tu-dominio.com>` | No |
| `PORT` | La inyecta Render | — | No (no la definas) |

Sin `RESEND_API_KEY` **y** `EMAIL_FROM` a la vez, el backend no envía correos: solo registra `[correo simulado]` en los logs.

### Frontend (Vercel)

| Variable | Dónde se define | Ejemplo | Secreto |
| --- | --- | --- | --- |
| `VITE_API_URL` | Vercel > Settings > Environment Variables | `https://<servicio>.onrender.com/api` (con `/api`) | No (queda visible en el código compilado) |

### Solo en tu computadora (scripts)

| Variable | Para qué | Secreto |
| --- | --- | --- |
| `DATABASE_URL` | `db:check`, `prisma db push`, `create:admin`, seed | **Sí** |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NOMBRE` | `create:admin` | `ADMIN_PASSWORD` **sí** |

---

## 5. Checklist de verificación

### Criterios de la tarjeta de Notion

- [ ] **1.** La URL pública del frontend carga en Vercel.
- [ ] **2.** `GET https://<servicio>.onrender.com/api/prueba-db` responde **200** y conecta con la base real.
- [ ] **3.** No hay variables sensibles (`DATABASE_URL`, `JWT_SECRET`) en el código: todas están como variables de entorno de la plataforma. Comprobación rápida desde la raíz del repositorio:

  ```bash
  git grep -n "mysql://" -- . ':!docs' ':!*.example' ':!backend/tests'
  git grep -n "JWT_SECRET" -- backend/src
  ```

  La primera solo debe mostrar texto de ayuda con datos ficticios (mensajes de `backend/scripts/check-db.js`), nunca una URL con credenciales reales; la segunda solo debe mostrar lecturas de `process.env.JWT_SECRET`.

### Prueba de humo

- [ ] Abre la URL del frontend y recarga en una ruta interna (por ejemplo `/admin/reportes` estando autenticado): no debe dar 404.
- [ ] Registra una cuenta de **estudiante** nueva y entra con ella.
- [ ] Inicia sesión como **admin** y abre `/admin/reportes`: las pantallas cargan sin errores.
- [ ] Solicita la recuperación de contraseña: con Resend configurado llega el correo con enlace a la URL de Vercel; sin Resend aparece `[correo simulado]` en los logs de Render.

Los casos de `docs/qa/casos-prueba-sprint5.md` se pueden ejecutar contra las URLs desplegadas (cambiando `localhost:3000/api` y `localhost:5173` por las URLs públicas). Para eso hace falta el seed; ver el paso 8.

---

## 6. Límites y cuidados del plan gratuito

| Plataforma | Límite o comportamiento | Qué hacer |
| --- | --- | --- |
| Aiven | Los servicios inactivos pueden **apagarse** (Aiven avisa antes). Se pueden volver a encender desde la consola | Enciéndelo desde la consola; usa el pinger (supuesto, por confirmar) |
| Aiven | `max_connections` = 76, disco de 1 GB, 1 CPU, 1 GB RAM | Usa `connection_limit=5`; vigila el tamaño de la base |
| Aiven | Sin VPC ni IP estática | No restrinjas por IP; protege con credenciales y TLS |
| Render | Se duerme tras ~15 min sin tráfico; arranque en frío de ~1 min | Pinger; avisa al equipo de pruebas del primer retraso |
| Render | 750 horas gratuitas por mes por workspace; 0,1 CPU y 512 MB | No crear más servicios gratuitos en el workspace |
| Render | Sin MySQL gestionado (solo Postgres y Key Value) | Por eso la base está en Aiven |
| Vercel | Hobby: uso personal y no comercial; 100 GB/mes de transferencia | Suficiente para el UAT |
| Resend | Plan gratuito: 3.000 correos/mes y 100/día (verificar en Resend, puede cambiar) | Solo importa si se prueba la recuperación de contraseña masivamente |
| Resend | Si hace falta un dominio verificado para escribir a cualquier destinatario: **por confirmar, verificar en Resend** | Si hace falta y no se tiene, los envíos a otros destinatarios fallarían y el backend solo lo registra en el log (el usuario no ve error). Si no hace falta, llegan a cualquier destinatario |

---

## 7. Problemas frecuentes

| Síntoma | Causa probable | Qué hacer |
| --- | --- | --- |
| La primera petición tarda ~1 min o da 503/timeout | Render estaba dormido | Espera y reintenta; configura el pinger (paso 7) |
| `/api/prueba-db` da 500 (`Error al conectar con MySQL`) | Aiven apagado, URL o TLS incorrectos | Revisa los logs de Render; ejecuta `npm run db:check` con la URL; enciende Aiven si está apagado |
| Aiven aparece apagado | Inactividad | Enciéndelo desde la consola de Aiven y espera a que esté "Running" |
| `P1001: Can't reach database server` | Host/puerto mal copiados o servicio apagado | Revisa Overview de Aiven; enciende el servicio |
| `P1000` / "Access denied" | Usuario o contraseña incorrectos | Vuelve a copiar la URI. Si la contraseña tiene `@ : / # ?`, codifícalos (por ejemplo `@` = `%40`) |
| `P1011` o errores de TLS/certificado | Prisma no acepta la URL TLS tal cual | Aplica las opciones del paso 2 **en orden** (URI tal cual, luego `sslaccept=accept_invalid_certs`, luego `strict` con `sslcert`) |
| Timeout al conectar | Servicio despertando o red lenta | Reintenta; agrega `&connect_timeout=30` a la URL |
| Página en blanco o 404 al recargar `/admin/reportes` | Falta `frontend/vercel.json` en la rama desplegada | Confirma que está en la rama de Vercel y redespliega |
| Error de CORS en el navegador | Normalmente es otro error disfrazado (la API cayó o `VITE_API_URL` es incorrecta). El CORS actual es abierto | Revisa la pestaña Network: la URL llamada debe ser la de Render con `/api` |
| Cambié `VITE_API_URL` pero se sigue usando el valor viejo | Vite la incrusta al compilar | **Redespliega** el frontend en Vercel |
| El enlace del correo de recuperación apunta a `localhost` | `FRONTEND_URL` mal configurada | Corrígela en Render (paso 6) |
| El build de Render falla en `prisma generate` | Se omitieron las `devDependencies` | Verifica que el Build Command sea `npm ci --include=dev && npx prisma generate` |
| El build falla por la versión de Node | `NODE_VERSION` no se aplicó o no es compatible | Prueba `NODE_VERSION=20` (como el CI) y revisa la documentación de Render |
| Todos los usuarios quedaron deslogueados | Se cambió `JWT_SECRET` | Es esperado: invalida todas las sesiones |

---

## 8. Seguridad

- **No subir secretos al repositorio:** ni `.env`, ni URLs con contraseña, ni claves de Resend. Los `.env.example` solo llevan valores de ejemplo. Si un secreto se subió por error, **rótalo** (no basta con borrar el commit).
- **Rotar `JWT_SECRET` invalida todas las sesiones activas.** Hazlo si se filtró; avisa al equipo antes.
- **El seed borra datos y crea cuentas conocidas** (`Prueba1234`). Nunca sobre datos reales; las cuentas del seed, en especial `admin@danzas.app`, deben eliminarse o inutilizarse antes de abrir a usuarios reales (paso 8).
- **`ADMIN_PASSWORD`:** usa una clave larga y única; defínela solo para el comando y no la dejes en el historial ni en archivos.
- **CORS abierto (limitación conocida):** el backend usa `cors()` sin restricciones, así que cualquier sitio puede llamar a la API desde un navegador. Mejora futura: limitar el origen a `FRONTEND_URL`.
- **TLS:** con `sslaccept=accept_invalid_certs` la conexión va cifrada pero no se valida el certificado de Aiven. Es aceptable para el proyecto académico; para producción real conviene la validación estricta.
- **`NODE_ENV=production`** desactiva `simularRechazo` en el pago simulado: no lo quites.

---

## 9. Plan de salida y escala

Si el plan gratuito se queda corto (arranques en frío molestos, el límite de horas, o Aiven se apaga con frecuencia), el **Plan B** es mover backend y base a **Railway**, con costo por uso. Una **estimación** basada en las tarifas por recurso publicadas es de unos **US$8 a 10 al mes** para un servicio pequeño más MySQL; hay que recalcularla con los precios vigentes antes de decidir. La migración sería: crear MySQL en Railway, volcar los datos desde Aiven (`mysqldump`), apuntar `DATABASE_URL` al nuevo servicio y mover el backend, sin cambios de código (la API solo depende de variables de entorno). El frontend en Vercel no cambia salvo `VITE_API_URL`.

---

## Referencias oficiales

- Aiven, MySQL free tier: <https://aiven.io/docs/products/mysql/concepts/mysql-free-tier>
- Render, Blueprint spec: <https://render.com/docs/blueprint-spec>
- Vercel, configuración del proyecto: <https://vercel.com/docs/project-configuration>
- Prisma, MySQL: <https://www.prisma.io/docs/orm/overview/databases/mysql>
