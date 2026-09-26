# Casos de prueba — Sprint 1

Casos de prueba en formato Dado/Cuando/Entonces para los requisitos funcionales
implementados en el Sprint 1 (RF-001 a RF-005). Los casos se basan en el
comportamiento real de la implementación actual (frontend + backend), no en
comportamiento esperado o futuro.

Referencia Notion: `[Sprint 1 - 05] [01]`.

## RF-001 — Registro de usuario

Archivos revisados: `frontend/src/screens/auth/Register.jsx`,
`backend/src/services/auth.service.js` (`registrar`).

### RF-001 — Caso: Correo duplicado
**Dado** que ya existe un usuario registrado con el correo `usuario@correo.com`
**Cuando** un visitante intenta registrarse nuevamente usando ese mismo correo
**Entonces** el backend responde con error `409` y código `EMAIL_ALREADY_REGISTERED`, con el mensaje "El correo ya está registrado.", y el formulario muestra ese mensaje sin crear una cuenta nueva

### RF-001 — Caso: Contraseña débil
**Dado** que un visitante completa el formulario de registro con un correo válido y no registrado
**Cuando** ingresa una contraseña que tiene menos de 8 caracteres, o que tiene 8 o más caracteres pero solo letras (sin ningún dígito) o solo dígitos (sin ninguna letra)
**Entonces** el backend responde con error `400` y código `WEAK_PASSWORD`, con el mensaje "La contraseña debe tener mínimo 8 caracteres y combinar letras y números.", y no se crea la cuenta

> Nota: el campo de contraseña en `Register.jsx` solo indica en el HTML `minLength={6}` y el texto de ayuda "La contraseña debe tener mínimo 6 caracteres.", lo cual es inconsistente con la regla real del backend (mínimo 8 caracteres + letras y números). El formulario permite enviar una contraseña de 6 o 7 caracteres, pero el backend la rechazará igual con `WEAK_PASSWORD`.

### RF-001 — Caso: Registro exitoso
**Dado** que un visitante completa el formulario con rol (`student`, `parent` o `instructor`), nombre, correo no registrado previamente, ciudad, y una contraseña de al menos 8 caracteres que combina letras y números
**Cuando** envía el formulario de registro
**Entonces** el backend responde `201` con el usuario creado (sin `passwordHash`), y el frontend redirige a `/login` mostrando el mensaje "Registro exitoso. Ahora puedes iniciar sesión."

## RF-002 — Inicio de sesión

Archivos revisados: `frontend/src/screens/auth/Login.jsx`,
`backend/src/services/auth.service.js` (`login`).

### RF-002 — Caso: Credenciales incorrectas
**Dado** un usuario registrado con correo `usuario@correo.com`
**Cuando** intenta iniciar sesión con el correo correcto pero una contraseña incorrecta (o con un correo que no existe en el sistema)
**Entonces** el backend responde `401` con código `INVALID_CREDENTIALS` y el mensaje "Correo o contraseña incorrectos" (el mismo mensaje genérico en ambos casos, sin indicar si el correo existe), y se incrementa el contador `intentosFallidos` del usuario cuando el correo sí existe

### RF-002 — Caso: 5 intentos fallidos consecutivos → bloqueo de cuenta
**Dado** un usuario registrado que ya acumuló 4 intentos fallidos consecutivos de inicio de sesión
**Cuando** falla un quinto intento consecutivo con contraseña incorrecta
**Entonces** el backend marca `bloqueadoHasta` en 15 minutos a partir de ese momento y responde `423` con código `ACCOUNT_LOCKED` y el mensaje "Cuenta bloqueada durante 15 minutos por demasiados intentos fallidos."; cualquier intento adicional de login mientras la cuenta sigue bloqueada responde `423` `ACCOUNT_LOCKED` con el mensaje "Cuenta bloqueada. Intenta nuevamente en X minuto(s)." (X = minutos restantes redondeados hacia arriba)

### RF-002 — Caso: Login exitoso con redirección según rol
**Dado** un usuario registrado con credenciales correctas y una cuenta no bloqueada
**Cuando** inicia sesión con su correo y contraseña correctos
**Entonces** el backend responde `200` con un token y reinicia `intentosFallidos` a 0 y `bloqueadoHasta` a `null`, y el frontend redirige según el rol devuelto: `admin` → `/admin`, `instructor` → `/instructor`, `estudiante`/`student` → `/estudiante`, `padre`/`parent` → `/padre`; si el rol no coincide con ninguno de esos valores, redirige a `/`

## RF-003 — Recuperación de contraseña

Archivos revisados: `frontend/src/screens/auth/ForgotPassword.jsx`,
`frontend/src/screens/auth/ResetPassword.jsx`,
`backend/src/services/auth.service.js` (`recuperarPassword`, `restablecerPassword`).

### RF-003 — Caso: Solicitud de recuperación (mensaje siempre genérico)
**Dado** un visitante en la pantalla "¿Olvidaste tu contraseña?", con un correo que puede existir o no en el sistema
**Cuando** envía el formulario con ese correo
**Entonces** el backend responde `200` con el mismo mensaje en ambos casos: "Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña.", y el correo de recuperación solo se envía realmente cuando el correo sí existe (sin que el usuario pueda distinguir un caso del otro desde la respuesta)

### RF-003 — Caso: Token de recuperación vencido o inválido
**Dado** un enlace de restablecimiento de contraseña (`/restablecer-password?token=...`) cuyo token ya expiró (más de 30 minutos), fue alterado, o no corresponde a un token de tipo `recuperacion_password`
**Cuando** el usuario completa una nueva contraseña válida y envía el formulario de restablecimiento
**Entonces** el backend responde `400` con código `INVALID_TOKEN` y el mensaje "El enlace de recuperación no es válido o ha expirado." (o "Token de recuperación inválido." si el token es de otro tipo), y la contraseña no se actualiza; adicionalmente, si el usuario abre `/restablecer-password` sin ningún parámetro `token` en la URL, el frontend detecta esto sin llamar al backend y muestra "El enlace de recuperación no es válido o ha expirado. Solicita uno nuevo."

### RF-003 — Caso: Restablecimiento exitoso
**Dado** un enlace de restablecimiento con un token válido y vigente (menos de 30 minutos desde su emisión)
**Cuando** el usuario ingresa una nueva contraseña de al menos 8 caracteres, la confirma de forma idéntica, y envía el formulario
**Entonces** el backend responde `200`, actualiza el hash de la contraseña del usuario, y el frontend muestra "Tu contraseña ha sido actualizada correctamente. Ya puedes iniciar sesión." y redirige automáticamente a `/login` 1.8 segundos después

> Nota: a diferencia del registro (RF-001), el restablecimiento de contraseña solo exige un mínimo de 8 caracteres; no exige combinar letras y números (`restablecerPassword` en el backend solo valida `nuevaPassword.length < 8`).

## RF-004 — Registro de menores (dependientes)

Archivos revisados: `backend/src/controllers/dependent.controller.js`,
`backend/src/services/dependent.service.js`,
`backend/src/middleware/errorHandler.js`.

### RF-004 — Caso: Un padre registra un menor
**Dado** un usuario autenticado cuyo rol es `padre`
**Cuando** envía una solicitud para registrar un menor con `nombre` y `fechaNacimiento`
**Entonces** el backend responde `201` con el menor creado, asociado al `padreId` del usuario autenticado

### RF-004 — Caso: Un usuario que no es padre intenta registrar un menor (debe rechazar)
**Dado** un usuario autenticado cuyo rol NO es `padre` (por ejemplo `student` o `instructor`)
**Cuando** envía una solicitud para registrar un menor
**Entonces** la intención de negocio es rechazar la operación con `403` y el mensaje "Solo los usuarios con rol padre pueden registrar menores.", **pero el comportamiento actual observado en el código es distinto**: `dependent.service.js` lanza un `Error` estableciendo `error.status = 403` en vez de usar la clase `AppError` (que expone `statusCode`); como `errorHandler.js` solo lee `err.statusCode` (no `err.status`), la propiedad se ignora y el middleware responde `500` con código `INTERNAL_ERROR` y el mensaje genérico "Ocurrió un error inesperado" en lugar del `403` esperado

> Nota: este es el mismo patrón de bug que se corrigió para autenticación en el commit `04c90c6` ("fix(auth): usar AppError en vez de error.status para que errorHandler funcione"), pero sigue presente sin corregir en `dependent.service.js`. Se recomienda aplicar la misma corrección (usar `AppError` en `registrarMenor`) en un cambio aparte.

## RF-005 — Navegación como invitado

Archivos revisados: `frontend/src/routes/AppRouter.jsx`,
`frontend/src/screens/public/Academies.jsx`,
`frontend/src/screens/public/AcademyDetail.jsx`.

### RF-005 — Caso: Visitante ve el listado de academias sin botones de inscripción o pago
**Dado** un visitante no autenticado
**Cuando** navega a `/academias` (ruta pública, fuera de `ProtectedRoute`)
**Entonces** puede ver el listado de academias con sus filtros de búsqueda, ciudad, tipo de baile y modalidad, y cada tarjeta de academia solo muestra un botón "Ver academia →" que lleva al detalle; no se muestra ningún botón de inscripción ni de pago en esta pantalla

### RF-005 — Caso: Visitante ve el detalle de una academia sin poder inscribirse ni pagar
**Dado** un visitante no autenticado
**Cuando** navega a `/academias/:id` (ruta pública) y consulta la información de la academia y sus clases
**Entonces** puede ver la información de la academia, sus tipos de baile y la lista de clases con horario, duración, cupos y precio, con un botón "Ver clase" que solo navega al detalle de la clase; al final de la página se muestra un aviso "¿Quieres inscribirte en una clase?" con botones "Iniciar sesión" y "Crear cuenta" como único camino para continuar con la inscripción y el pago — no existe ningún botón de inscripción ni de pago accesible directamente desde esta vista de invitado
