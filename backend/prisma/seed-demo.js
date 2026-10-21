/**
 * Datos de DEMOSTRACIÓN para presentar el avance de Danzas.app.
 *
 * Carga una historia completa y realista: instructores con y sin academia,
 * solicitudes pendientes/rechazada, estudiantes, padres con hijos, clases en
 * varias ciudades (una llena, una con un solo cupo, una cancelada por su
 * instructor), inscripciones confirmadas, pendientes de pago y canceladas con
 * reembolso, pagos repartidos en las últimas 5 semanas y asistencia semanal.
 * Las fechas son RELATIVAS a "hoy" (hora de Colombia), así que los datos
 * siempre se ven recientes.
 *
 * Por defecto es ADITIVO e IDEMPOTENTE: nunca borra nada; crea lo que falta y
 * omite lo que ya existe (busca por claves naturales, no por ids). Correrlo
 * dos veces no duplica nada y funciona sobre la base del seed y sobre una base
 * con usuarios creados a mano. No pisa a los usuarios que ya existen.
 *
 * Uso (desde backend/):
 *   npm run seed:demo                         # aditivo (recomendado)
 *   npm run seed:demo -- --dry-run            # solo informa qué crearía; no escribe
 *   npm run seed:demo -- --reset --yes        # BORRA todo, corre el seed base y carga la demo
 *   npm run seed:demo -- --allow-remote       # permite una base que no sea localhost
 *
 * Todos los usuarios de la demo usan la contraseña "Prueba1234". Los correos
 * nuevos terminan en @demo.danzas.app para no chocar con los del seed base
 * (admin@danzas.app, instructor.aprobado@danzas.app, etc., que se reutilizan).
 *
 * La demo AGREGA historial a cuentas del seed base (Camila, Julián, Andrea,
 * Laura/Mateo/Isabella) pero a propósito NO toca las clases del seed base
 * (Salsa, Bachata, Danza urbana): sus cupos siguen como los que supone
 * docs/qa/. Sí cambian los totales de /admin/reportes y /instructor/pagos.
 */

const crypto = require("node:crypto");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { describirDestino, formatearDestino } = require("../scripts/lib/destino");

const PASSWORD_DEMO = "Prueba1234";
// Mismo costo que el registro (auth.service.js).
const BCRYPT_COSTO = 10;
const DOMINIO_DEMO = "demo.danzas.app";

// La hora de pared y los "días" del producto son los de Colombia (UTC-5, sin horario de verano).
const OFFSET_COLOMBIA_HORAS = 5;
const MS_HORA = 60 * 60 * 1000;
const MS_DIA = 24 * MS_HORA;
const MARGEN_MINUTOS = 15; // espacio mínimo entre clases de un instructor (schedule.service.js)
const SESIONES_DE_HISTORIAL = 5;

const MOTIVO_ESTUDIANTE = "cancelacion_estudiante_anticipada";
const MOTIVO_INSTRUCTOR = "cancelacion_instructor";

const ENTIDADES = [
  "usuarios",
  "menores",
  "solicitudes",
  "clases",
  "horarios",
  "inscripciones",
  "pagos",
  "asistencias",
];

// ---------------------------------------------------------------------------
// Datos de la historia (declarativos; buildDemoData los convierte en fechas reales)
// ---------------------------------------------------------------------------

/*
 * `base: true` son las cuentas del seed base (prisma/seed.js): solo se crean si
 * faltan, con los mismos datos; si ya existen no se tocan.
 * `diasCreado` = hace cuántos días se registró la cuenta.
 */
const USUARIOS = [
  { key: "admin", base: true, nombre: "Admin Danzas", correo: "admin@danzas.app", rol: "admin", ciudad: "Bogotá", estado: "activo", historia: "Panel de administración: usuarios, solicitudes de academias, reporte de pagos" },
  { key: "camila", base: true, nombre: "Camila Rodríguez", correo: "instructor.aprobado@danzas.app", rol: "instructor", ciudad: "Barranquilla", estado: "activo", historia: "Academia Ritmo Caribe. Salsa, Bachata y Folclor (jueves, con 1 solo cupo). Toma asistencia en vivo" },
  { key: "julian", base: true, nombre: "Julián Torres", correo: "instructor.independiente@danzas.app", rol: "instructor", ciudad: "Medellín", estado: "activo", historia: "Instructor independiente. Danza urbana y Contemporánea" },
  { key: "andrea", base: true, nombre: "Andrea Pérez", correo: "estudiante1@danzas.app", rol: "estudiante", ciudad: "Bogotá", estado: "activo", historia: "Estudiante con historial: Folclor, Contemporánea y una cancelación con reembolso" },
  { key: "laura", base: true, nombre: "Laura Sánchez", correo: "padre@danzas.app", rol: "padre", ciudad: "Bogotá", estado: "activo", historia: "Padre con 2 hijos: Mateo (Contemporánea, 80%) e Isabella (Folclor, 67%; una clase cancelada por el instructor)" },

  { key: "daniela", nombre: "Daniela Ospina", correo: "daniela.ospina@demo.danzas.app", rol: "instructor", ciudad: "Medellín", estado: "activo", diasCreado: 62, historia: "Academia Ritmo Paisa. Salsa, Bachata (jueves) y Danza urbana (sábado, LLENA). Segunda toma de asistencia en vivo" },
  { key: "andres", nombre: "Andrés Herrera", correo: "andres.herrera@demo.danzas.app", rol: "instructor", ciudad: "Cali", estado: "activo", diasCreado: 60, historia: "Escuela Salsa Pacífico. Salsa, Bachata y Folclor en Cali (Folclor sin inscritos)" },
  { key: "mariana", nombre: "Mariana Castaño", correo: "mariana.castano@demo.danzas.app", rol: "instructor", ciudad: "Bogotá", estado: "activo", diasCreado: 55, historia: "Instructora independiente. Contemporánea, Bachata y una clase CANCELADA con reembolsos" },
  { key: "jhonatan", nombre: "Jhonatan Barrios", correo: "jhonatan.barrios@demo.danzas.app", rol: "instructor", ciudad: "Cartagena", estado: "activo", diasCreado: 50, historia: "Instructor independiente. Folclor (Cartagena) y Danza urbana (Santa Marta, sin inscritos)" },
  { key: "sebastian", nombre: "Sebastián Rojas", correo: "sebastian.rojas@demo.danzas.app", rol: "instructor", ciudad: "Bogotá", estado: "pendiente", diasCreado: 4, historia: "Solicitud PENDIENTE de Academia Urban Flow: el admin la aprueba o rechaza en vivo" },
  { key: "natalia", nombre: "Natalia Vélez", correo: "natalia.velez@demo.danzas.app", rol: "instructor", ciudad: "Medellín", estado: "pendiente", diasCreado: 2, historia: "Solicitud PENDIENTE como instructora independiente: el admin la aprueba o rechaza en vivo" },
  { key: "carlos", nombre: "Carlos Mejía", correo: "carlos.mejia@demo.danzas.app", rol: "instructor", ciudad: "Barranquilla", estado: "pendiente", diasCreado: 20, historia: "Solicitud RECHAZADA (Academia Fusión Latina): no puede publicar clases" },

  { key: "valeria", nombre: "Valeria Acosta", correo: "valeria.acosta@demo.danzas.app", rol: "estudiante", ciudad: "Medellín", estado: "activo", diasCreado: 45, historia: "Estudiante muy activa en Medellín: 4 clases con asistencia" },
  { key: "daniel", nombre: "Daniel Cárdenas", correo: "daniel.cardenas@demo.danzas.app", rol: "estudiante", ciudad: "Bogotá", estado: "activo", diasCreado: 40, historia: "Tiene una inscripción PENDIENTE de pago (Bachata Bogotá) para pagar en vivo" },
  { key: "monica", nombre: "Mónica Restrepo", correo: "monica.restrepo@demo.danzas.app", rol: "estudiante", ciudad: "Cali", estado: "activo", diasCreado: 38, historia: "Salsa en Cali y una inscripción PENDIENTE de pago (Bachata) para pagar en vivo" },
  { key: "juancamilo", nombre: "Juan Camilo Rendón", correo: "juan.rendon@demo.danzas.app", rol: "estudiante", ciudad: "Cali", estado: "activo", diasCreado: 36, historia: "Salsa en Cali y una cancelación SIN reembolso (menos de 2 horas)" },
  { key: "felipe", nombre: "Felipe Ortega", correo: "felipe.ortega@demo.danzas.app", rol: "estudiante", ciudad: "Barranquilla", estado: "activo", diasCreado: 34, historia: "Alumno de Folclor con Camila (aparece en su lista de asistencia)" },
  { key: "isabel", nombre: "Isabel Pineda", correo: "isabel.pineda@demo.danzas.app", rol: "estudiante", ciudad: "Cartagena", estado: "activo", diasCreado: 30, historia: "Folclor con Camila y con Jhonatan" },
  { key: "sara", nombre: "Sara Villamizar", correo: "sara.villamizar@demo.danzas.app", rol: "estudiante", ciudad: "Santa Marta", estado: "activo", diasCreado: 3, historia: "Cuenta SIN inscripciones: para inscribirse y pagar en vivo desde cero" },
  { key: "esteban", nombre: "Esteban Quintero", correo: "esteban.quintero@demo.danzas.app", rol: "estudiante", ciudad: "Cali", estado: "suspendido", diasCreado: 25, historia: "Cuenta SUSPENDIDA: el login muestra que no puede iniciar sesión" },

  { key: "patricia", nombre: "Patricia Londoño", correo: "patricia.londono@demo.danzas.app", rol: "padre", ciudad: "Medellín", estado: "activo", diasCreado: 42, historia: "Padre con 3 hijos: asistencia 40%, 67%, 80% y 100%; una inscripción PENDIENTE (Emilia) para pagar en vivo" },
  { key: "ricardo", nombre: "Ricardo Salcedo", correo: "ricardo.salcedo@demo.danzas.app", rol: "padre", ciudad: "Barranquilla", estado: "activo", diasCreado: 33, historia: "Padre con 2 hijos: Juan Pablo en Folclor (75%); María José sin inscripciones, para inscribirla en vivo" },
];

const MENORES = [
  { key: "mateo", padre: "laura", nombre: "Mateo Sánchez", fechaNacimiento: "2015-03-10" },
  { key: "isabella", padre: "laura", nombre: "Isabella Sánchez", fechaNacimiento: "2017-07-22" },
  { key: "samuel", padre: "patricia", nombre: "Samuel Londoño", fechaNacimiento: "2013-05-14" },
  { key: "valentina", padre: "patricia", nombre: "Valentina Londoño", fechaNacimiento: "2016-09-03" },
  { key: "emilia", padre: "patricia", nombre: "Emilia Londoño", fechaNacimiento: "2019-01-20" },
  { key: "juanpablo", padre: "ricardo", nombre: "Juan Pablo Salcedo", fechaNacimiento: "2014-11-02" },
  { key: "mariajose", padre: "ricardo", nombre: "María José Salcedo", fechaNacimiento: "2018-04-27" },
];

// `diasRevision` = hace cuántos días revisó el admin (solo estados aprobada/rechazada).
const SOLICITUDES = [
  { instructor: "camila", base: true, nombreAcademia: "Academia Ritmo Caribe", estado: "aprobada", diasRevision: 70 },
  { instructor: "julian", base: true, nombreAcademia: null, estado: "aprobada", diasRevision: 70 },
  { instructor: "daniela", nombreAcademia: "Academia Ritmo Paisa", estado: "aprobada", diasRevision: 58 },
  { instructor: "andres", nombreAcademia: "Escuela Salsa Pacífico", estado: "aprobada", diasRevision: 56 },
  { instructor: "mariana", nombreAcademia: null, estado: "aprobada", diasRevision: 52 },
  { instructor: "jhonatan", nombreAcademia: null, estado: "aprobada", diasRevision: 48 },
  { instructor: "sebastian", nombreAcademia: "Academia Urban Flow", estado: "pendiente" },
  { instructor: "natalia", nombreAcademia: null, estado: "pendiente" },
  { instructor: "carlos", nombreAcademia: "Academia Fusión Latina", estado: "rechazada", diasRevision: 3 },
];

/*
 * dia: 0 = domingo ... 6 = sábado. inicio/fin: [hora, minuto] de pared (Colombia).
 * Respetan la regla de RF-008: sin cruces ni menos de 15 minutos entre clases
 * activas de un mismo instructor (incluidas las del seed base, ver HORARIOS_BASE).
 */
const CLASES = [
  { key: "c3", instructor: "camila", tipoBaile: "Folclor", ciudad: "Barranquilla", dia: 4, inicio: [18, 0], fin: [19, 0], precio: 35000, cupo: 6 },
  { key: "jj", instructor: "julian", tipoBaile: "Contemporánea", ciudad: "Medellín", dia: 4, inicio: [19, 0], fin: [20, 0], precio: 55000, cupo: 10 },
  { key: "d1", instructor: "daniela", tipoBaile: "Salsa", ciudad: "Medellín", dia: 2, inicio: [19, 0], fin: [20, 0], precio: 45000, cupo: 18 },
  { key: "d2", instructor: "daniela", tipoBaile: "Bachata", ciudad: "Medellín", dia: 4, inicio: [18, 30], fin: [19, 30], precio: 42000, cupo: 15 },
  { key: "d3", instructor: "daniela", tipoBaile: "Danza urbana", ciudad: "Medellín", dia: 6, inicio: [10, 0], fin: [11, 30], precio: 38000, cupo: 4 },
  { key: "a1", instructor: "andres", tipoBaile: "Salsa", ciudad: "Cali", dia: 1, inicio: [19, 0], fin: [20, 30], precio: 60000, cupo: 14 },
  { key: "a2", instructor: "andres", tipoBaile: "Bachata", ciudad: "Cali", dia: 3, inicio: [19, 0], fin: [20, 0], precio: 45000, cupo: 12 },
  { key: "a3", instructor: "andres", tipoBaile: "Folclor", ciudad: "Cali", dia: 6, inicio: [15, 0], fin: [16, 30], precio: 50000, cupo: 8 },
  { key: "m1", instructor: "mariana", tipoBaile: "Contemporánea", ciudad: "Bogotá", dia: 2, inicio: [18, 0], fin: [19, 30], precio: 65000, cupo: 10 },
  { key: "m2", instructor: "mariana", tipoBaile: "Bachata", ciudad: "Bogotá", dia: 4, inicio: [19, 0], fin: [20, 0], precio: 48000, cupo: 12 },
  { key: "m3", instructor: "mariana", tipoBaile: "Danza urbana", ciudad: "Bogotá", dia: 6, inicio: [11, 0], fin: [12, 0], precio: 35000, cupo: 15, estado: "cancelada" },
  { key: "j1", instructor: "jhonatan", tipoBaile: "Folclor", ciudad: "Cartagena", dia: 3, inicio: [17, 30], fin: [18, 30], precio: 30000, cupo: 20 },
  { key: "j2", instructor: "jhonatan", tipoBaile: "Danza urbana", ciudad: "Santa Marta", dia: 5, inicio: [16, 0], fin: [17, 0], precio: 32000, cupo: 15 },
];

/*
 * Clases del seed base (no las crea la demo; se usan solo para validar que las
 * nuevas no se crucen con ellas). Ver backend/prisma/seed.js.
 */
const HORARIOS_BASE = [
  { instructor: "camila", diaSemana: 1, inicio: [18, 0], fin: [19, 0] },
  { instructor: "camila", diaSemana: 3, inicio: [19, 15], fin: [20, 15] },
  { instructor: "julian", diaSemana: 2, inicio: [17, 0], fin: [18, 0] },
];

/*
 * Inscripciones. Una fila por (usuario, menor, clase).
 *  - dias: hace cuántos días se inscribió (y pagó, si pagó).
 *  - asistencia: patrón de 5 letras de la más antigua a la más reciente
 *    (P = presente, A = ausente). Solo cuenta para las sesiones posteriores a
 *    la inscripción: se toma el final del patrón.
 *  - estado: "pendiente_pago" (sin pago; retiene un cupo). Sin `estado` ni
 *    `cancelacion` es confirmada con pago aprobado.
 *  - cancelacion: { por, motivo, dias }. motivo = null no reembolsa (el pago
 *    queda aprobado); con motivo, el pago se marca reembolsado.
 */
const INSCRIPCIONES = [
  { usuario: "felipe", clase: "c3", dias: 36, asistencia: "PPPPP" },
  { usuario: "andrea", clase: "c3", dias: 35, asistencia: "PPAPP" },
  { usuario: "ricardo", menor: "juanpablo", clase: "c3", dias: 29, asistencia: "PPAPP" },
  { usuario: "laura", menor: "isabella", clase: "c3", dias: 22, asistencia: "PPPAP" },
  { usuario: "isabel", clase: "c3", dias: 18, asistencia: "PPPPP" },

  { usuario: "valeria", clase: "jj", dias: 30, asistencia: "PPAPP" },
  { usuario: "patricia", menor: "samuel", clase: "jj", dias: 4, asistencia: "PPPPP" },

  { usuario: "valeria", clase: "d1", dias: 33, asistencia: "PPPAP" },
  { usuario: "patricia", menor: "valentina", clase: "d1", dias: 22, asistencia: "PPPPP" },

  { usuario: "patricia", menor: "samuel", clase: "d2", dias: 22, asistencia: "PAPPA" },
  { usuario: "valeria", clase: "d2", dias: 15, asistencia: "PPPPP" },

  { usuario: "patricia", menor: "samuel", clase: "d3", dias: 36, asistencia: "PPPAP" },
  { usuario: "patricia", menor: "valentina", clase: "d3", dias: 36, asistencia: "APAPA" },
  { usuario: "valeria", clase: "d3", dias: 28, asistencia: "PPPAP" },
  { usuario: "patricia", menor: "emilia", clase: "d3", dias: 2, estado: "pendiente_pago" },

  { usuario: "monica", clase: "a1", dias: 35, asistencia: "PPPPA" },
  { usuario: "juancamilo", clase: "a1", dias: 34, asistencia: "PPAPP" },
  { usuario: "monica", clase: "a2", dias: 1, estado: "pendiente_pago" },
  { usuario: "juancamilo", clase: "a2", dias: 20, cancelacion: { por: "estudiante", motivo: null, dias: 5 } },

  { usuario: "laura", menor: "mateo", clase: "m1", dias: 36, asistencia: "PPPAP" },
  { usuario: "daniel", clase: "m1", dias: 27, asistencia: "PPAPP" },
  { usuario: "andrea", clase: "m1", dias: 6, asistencia: "PPPPP" },
  { usuario: "andrea", clase: "m2", dias: 20, cancelacion: { por: "estudiante", motivo: MOTIVO_ESTUDIANTE, dias: 8 } },
  { usuario: "daniel", clase: "m2", dias: 3, estado: "pendiente_pago" },
  { usuario: "daniel", clase: "m3", dias: 24, cancelacion: { por: "instructor", motivo: MOTIVO_INSTRUCTOR, dias: 10 } },
  { usuario: "laura", menor: "isabella", clase: "m3", dias: 23, cancelacion: { por: "instructor", motivo: MOTIVO_INSTRUCTOR, dias: 10 } },

  { usuario: "isabel", clase: "j1", dias: 12, asistencia: "PPPPP" },
];

// ---------------------------------------------------------------------------
// Fechas
// ---------------------------------------------------------------------------

// Medianoche UTC del día de CALENDARIO de Colombia en `now` (la fecha sin hora).
const diaDeColombia = (now) => {
  const local = new Date(now.getTime() - OFFSET_COLOMBIA_HORAS * MS_HORA);

  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()));
};

// Instante: hace `dias` días, a la hora de pared de Colombia indicada.
const instanteHaceDias = (hoyDia, dias, hora = 10, minuto = 0) =>
  new Date(hoyDia.getTime() - dias * MS_DIA + (hora + OFFSET_COLOMBIA_HORAS) * MS_HORA + minuto * 60 * 1000);

// Las columnas @db.Time(0) viajan como Date; solo importa la hora (UTC).
const hora = ([hh, mm]) => new Date(Date.UTC(1970, 0, 1, hh, mm, 0));

const aTextoFecha = (fecha) => fecha.toISOString().slice(0, 10);

// Las últimas `cantidad` fechas de ese día de la semana ESTRICTAMENTE anteriores a hoy (de la más antigua a la más reciente).
const ultimasSesiones = (hoyDia, diaSemana, cantidad) => {
  const sesiones = [];

  for (let atras = 1; sesiones.length < cantidad; atras += 1) {
    const fecha = new Date(hoyDia.getTime() - atras * MS_DIA);

    if (fecha.getUTCDay() === diaSemana) {
      sesiones.unshift(fecha);
    }
  }

  return sesiones;
};

// ---------------------------------------------------------------------------
// Regla de horarios (misma que schedule.service.js)
// ---------------------------------------------------------------------------

const aMinutos = (valor) => valor.getUTCHours() * 60 + valor.getUTCMinutes();

const seSuperponen = (a, b) => {
  if (a.diaSemana !== b.diaSemana) {
    return false;
  }

  return (
    aMinutos(b.horaInicio) < aMinutos(a.horaFin) + MARGEN_MINUTOS &&
    aMinutos(a.horaInicio) < aMinutos(b.horaFin) + MARGEN_MINUTOS
  );
};

// ---------------------------------------------------------------------------
// buildDemoData: función pura (sin base de datos)
// ---------------------------------------------------------------------------

const referenciaSimulada = (clave) =>
  `SIM-${crypto.createHash("sha1").update(`demo:${clave}`).digest("hex").slice(0, 10).toUpperCase()}`;

// Una inscripción ocupa un cupo salvo que la haya cancelado el estudiante (cancelarInscripcion lo libera).
// Si cancela el instructor, el código NO libera el cupo (cancelarPorClaseDeInstructor no lo toca).
const ocupaCupo = (estado, canceladoPor) => !(estado === "cancelada" && canceladoPor === "estudiante");

/**
 * Construye TODA la historia con fechas relativas a `now`. No toca la base.
 * Las entidades se referencian por `key`; `run` las traduce a ids reales.
 */
const buildDemoData = (now = new Date()) => {
  const hoyDia = diaDeColombia(now);

  const usuarios = USUARIOS.map(({ diasCreado, ...usuario }, indice) => ({
    ...usuario,
    ...(diasCreado != null && { creadoEn: instanteHaceDias(hoyDia, diasCreado, 9 + (indice % 8), (indice * 7) % 60) }),
  }));

  const menores = MENORES.map((menor) => ({ ...menor }));

  const solicitudes = SOLICITUDES.map(({ diasRevision, ...solicitud }, indice) => ({
    ...solicitud,
    revisada: solicitud.estado !== "pendiente",
    revisadoEn: diasRevision != null ? instanteHaceDias(hoyDia, diasRevision, 11, indice) : null,
  }));

  const clasesPorKey = new Map();

  const clases = CLASES.map((spec) => {
    const clase = {
      key: spec.key,
      instructor: spec.instructor,
      tipoBaile: spec.tipoBaile,
      ciudad: spec.ciudad,
      modalidad: "presencial",
      cupoMaximo: spec.cupo,
      precio: spec.precio,
      estado: spec.estado ?? "activa",
      horario: { diaSemana: spec.dia, horaInicio: hora(spec.inicio), horaFin: hora(spec.fin) },
      cupoDisponible: spec.cupo,
    };

    clasesPorKey.set(clase.key, clase);

    return clase;
  });

  const inscripciones = INSCRIPCIONES.map((spec, indice) => {
    const clase = clasesPorKey.get(spec.clase);
    const cancelacion = spec.cancelacion ?? null;
    const estado = spec.estado ?? (cancelacion ? "cancelada" : "confirmada");
    const canceladoPor = cancelacion ? cancelacion.por : null;
    const diaInscripcion = new Date(hoyDia.getTime() - spec.dias * MS_DIA);
    const creadoEn = instanteHaceDias(hoyDia, spec.dias, 8 + ((indice * 3) % 11), (indice * 7) % 60);
    const clave = `${spec.usuario}:${spec.menor ?? "-"}:${spec.clase}`;

    let pago = null;

    if (estado !== "pendiente_pago") {
      const reembolsado = Boolean(cancelacion && cancelacion.motivo);

      pago = {
        monto: clase.precio,
        estado: "aprobado",
        esSimulado: true,
        reembolsado,
        motivoReembolso: reembolsado ? cancelacion.motivo : null,
        referenciaPasarela: referenciaSimulada(clave),
        // Un reembolso sobrescribe procesadoEn (marcarComoReembolsado): el pago cae en la fecha del reembolso.
        procesadoEn: reembolsado
          ? instanteHaceDias(hoyDia, cancelacion.dias, 10 + (indice % 6), indice % 60)
          : new Date(creadoEn.getTime() + (4 + (indice % 9)) * 60 * 1000),
      };
    }

    let asistencias = [];

    if (estado === "confirmada" && spec.asistencia) {
      const sesiones = ultimasSesiones(hoyDia, clase.horario.diaSemana, SESIONES_DE_HISTORIAL).filter(
        (fecha) => fecha.getTime() > diaInscripcion.getTime(),
      );
      const patron = spec.asistencia.padStart(SESIONES_DE_HISTORIAL, "P");
      const cola = sesiones.length > 0 ? patron.slice(-sesiones.length) : "";

      asistencias = sesiones.map((fechaSesion, posicion) => ({ fechaSesion, asistio: cola[posicion] === "P" }));
    }

    return {
      usuario: spec.usuario,
      menor: spec.menor ?? null,
      clase: spec.clase,
      estado,
      canceladoPor,
      creadoEn,
      ocupaCupo: ocupaCupo(estado, canceladoPor),
      pago,
      asistencias,
    };
  });

  for (const inscripcion of inscripciones) {
    if (inscripcion.ocupaCupo) {
      clasesPorKey.get(inscripcion.clase).cupoDisponible -= 1;
    }
  }

  return {
    hoy: aTextoFecha(hoyDia),
    hoyDia,
    usuarios,
    menores,
    solicitudes,
    clases,
    inscripciones,
  };
};

// Cuántas filas de cada entidad crearía la demo sobre una base vacía.
const contarPlan = (datos) => ({
  usuarios: datos.usuarios.length,
  menores: datos.menores.length,
  solicitudes: datos.solicitudes.length,
  clases: datos.clases.length,
  horarios: datos.clases.length,
  inscripciones: datos.inscripciones.length,
  pagos: datos.inscripciones.filter((inscripcion) => inscripcion.pago).length,
  asistencias: datos.inscripciones.reduce((total, inscripcion) => total + inscripcion.asistencias.length, 0),
});

// ---------------------------------------------------------------------------
// Errores accionables
// ---------------------------------------------------------------------------

class ErrorDemo extends Error {
  constructor(entidad, etiqueta, causa) {
    super(`No se pudo procesar ${entidad} "${etiqueta}".`);
    this.name = "ErrorDemo";
    this.entidad = entidad;
    this.etiqueta = etiqueta;
    this.codigo = causa?.code ?? causa?.errorCode ?? null;
    // Solo la última línea del mensaje: los errores de Prisma traen un volcado de la consulta.
    this.detalle = String(causa?.message ?? causa)
      .split("\n")
      .map((linea) => linea.trim())
      .filter(Boolean)
      .pop();
  }
}

const AYUDAS = {
  P1000: "Usuario o contraseña de MySQL incorrectos: revisa DATABASE_URL en backend/.env.",
  P1001: "No se pudo conectar a MySQL: ¿está encendido el servidor? ¿Son correctos host y puerto de DATABASE_URL?",
  P1002: "MySQL no respondió a tiempo: revisa que el servidor esté encendido y accesible.",
  P1003: "La base de datos no existe: créala (por ejemplo con `npx prisma db push`) y vuelve a intentar.",
  P2002: "Ya existe un registro con esos datos únicos (¿correo repetido?). Es seguro volver a ejecutar el script: omite lo que ya existe.",
  P2003: "Falla de llave foránea: falta un registro relacionado. Ejecuta el script con --dry-run para ver qué falta.",
  P2021: "Falta una tabla: la base no tiene el esquema. Ejecuta `npx prisma db push` (o las migraciones) y reintenta.",
  P2022: "Falta una columna: la base está desactualizada respecto de schema.prisma. Ejecuta `npx prisma db push` y reintenta.",
};

const describirError = (error) => {
  if (error instanceof ErrorDemo) {
    const codigo = error.codigo ? ` (código Prisma ${error.codigo})` : "";
    const ayuda = error.codigo && AYUDAS[error.codigo] ? ` Qué hacer: ${AYUDAS[error.codigo]}` : "";

    return `${error.message}${codigo} Detalle: ${error.detalle}.${ayuda} Es idempotente: puedes volver a ejecutarlo.`;
  }

  const codigo = error?.code ?? error?.errorCode;
  const detalle = String(error?.message ?? error)
    .split("\n")
    .map((linea) => linea.trim())
    .filter(Boolean)
    .pop();

  return `${codigo ? `(código ${codigo}) ` : ""}${detalle}${codigo && AYUDAS[codigo] ? ` Qué hacer: ${AYUDAS[codigo]}` : ""}`;
};

const paso = async (entidad, etiqueta, accion) => {
  try {
    return await accion();
  } catch (error) {
    throw new ErrorDemo(entidad, etiqueta, error);
  }
};

// ---------------------------------------------------------------------------
// run: aplica la historia sobre la base (aditivo e idempotente)
// ---------------------------------------------------------------------------

const hashPasswordDefault = (password) => require("bcrypt").hash(password, BCRYPT_COSTO);

const crearContadores = () =>
  Object.fromEntries(ENTIDADES.map((entidad) => [entidad, { creados: 0, existentes: 0, omitidos: 0 }]));

const mismaHora = (a, b) => aMinutos(new Date(a)) === aMinutos(new Date(b));

/**
 * Aplica la demo. `prisma` y `hashPassword` se inyectan para probar sin base
 * de datos (ver tests/seed-demo.test.js). Con `dryRun` solo LEE la base (para
 * saber qué existe) y cuenta lo que crearía; no escribe nada.
 */
const run = async ({ prisma, dryRun = false, now = new Date(), hashPassword = hashPasswordDefault } = {}) => {
  const datos = buildDemoData(now);
  const contadores = crearContadores();
  const advertencias = [];
  const usuarioIds = new Map();
  const menorIds = new Map();
  const claseInfo = new Map(); // key -> { id, cupoDisponible } (id null = aún no existe, solo en dry-run)

  const escribe = !dryRun;

  // --- Usuarios -----------------------------------------------------------
  const passwordHash = escribe ? await hashPassword(PASSWORD_DEMO) : null;

  for (const usuario of datos.usuarios) {
    await paso("el usuario", usuario.correo, async () => {
      const existente = await prisma.usuario.findUnique({ where: { correo: usuario.correo } });

      if (existente) {
        usuarioIds.set(usuario.key, existente.id);
        contadores.usuarios.existentes += 1;
        return;
      }

      contadores.usuarios.creados += 1;

      if (!escribe) {
        usuarioIds.set(usuario.key, null);
        return;
      }

      const creado = await prisma.usuario.create({
        data: {
          nombre: usuario.nombre,
          correo: usuario.correo,
          passwordHash,
          rol: usuario.rol,
          ciudad: usuario.ciudad,
          estado: usuario.estado,
          ...(usuario.creadoEn && { creadoEn: usuario.creadoEn }),
        },
      });

      usuarioIds.set(usuario.key, creado.id);
    });
  }

  // Quien "revisó" las solicitudes: el admin del seed base, o cualquier admin que haya en la base.
  let adminId = usuarioIds.get("admin") ?? null;

  if (!adminId && escribe) {
    const algunAdmin = await prisma.usuario.findFirst({ where: { rol: "admin" } });
    adminId = algunAdmin ? algunAdmin.id : null;
  }

  // --- Menores ------------------------------------------------------------
  for (const menor of datos.menores) {
    await paso("el menor", menor.nombre, async () => {
      const padreId = usuarioIds.get(menor.padre);

      if (padreId) {
        const existente = await prisma.menor.findFirst({ where: { padreId, nombre: menor.nombre } });

        if (existente) {
          menorIds.set(menor.key, existente.id);
          contadores.menores.existentes += 1;
          return;
        }
      }

      contadores.menores.creados += 1;

      if (!escribe) {
        menorIds.set(menor.key, null);
        return;
      }

      const creado = await prisma.menor.create({
        data: {
          padreId,
          nombre: menor.nombre,
          fechaNacimiento: new Date(`${menor.fechaNacimiento}T00:00:00.000Z`),
        },
      });

      menorIds.set(menor.key, creado.id);
    });
  }

  // --- Solicitudes de academia -------------------------------------------
  for (const solicitud of datos.solicitudes) {
    await paso("la solicitud de academia", `${solicitud.instructor} / ${solicitud.nombreAcademia ?? "independiente"}`, async () => {
      const instructorId = usuarioIds.get(solicitud.instructor);

      if (instructorId) {
        // Se busca por instructor + nombre (sin el estado): si el admin ya aprobó o rechazó una en vivo, sigue contando como existente.
        const existente = await prisma.solicitudAcademia.findFirst({
          where: { instructorId, nombreAcademia: solicitud.nombreAcademia },
        });

        if (existente) {
          contadores.solicitudes.existentes += 1;
          return;
        }
      }

      contadores.solicitudes.creados += 1;

      if (!escribe) {
        return;
      }

      await prisma.solicitudAcademia.create({
        data: {
          instructorId,
          nombreAcademia: solicitud.nombreAcademia,
          estado: solicitud.estado,
          ...(solicitud.revisada && { revisadoPor: adminId, revisadoEn: solicitud.revisadoEn }),
        },
      });
    });
  }

  // --- Clases (con su horario) -------------------------------------------
  for (const clase of datos.clases) {
    await paso("la clase", `${clase.tipoBaile} ${clase.ciudad} (${clase.instructor})`, async () => {
      const instructorId = usuarioIds.get(clase.instructor);

      if (instructorId) {
        const delInstructor = await prisma.clase.findMany({
          where: { instructorId },
          include: { horarios: true },
        });

        const existente = delInstructor.find(
          (candidata) =>
            candidata.tipoBaile === clase.tipoBaile &&
            candidata.horarios.some(
              (horario) =>
                horario.diaSemana === clase.horario.diaSemana && mismaHora(horario.horaInicio, clase.horario.horaInicio),
            ),
        );

        if (existente) {
          claseInfo.set(clase.key, { id: existente.id, cupoDisponible: existente.cupoDisponible });
          contadores.clases.existentes += 1;
          contadores.horarios.existentes += 1;
          return;
        }

        // Misma regla de RF-008: no se crea una clase activa que se cruce con otra del instructor.
        if (clase.estado === "activa") {
          const choca = delInstructor
            .filter((candidata) => candidata.estado === "activa")
            .some((candidata) => candidata.horarios.some((horario) => seSuperponen(horario, clase.horario)));

          if (choca) {
            claseInfo.set(clase.key, null);
            contadores.clases.omitidos += 1;
            contadores.horarios.omitidos += 1;
            advertencias.push(
              `Clase omitida: ${clase.tipoBaile} ${clase.ciudad} de ${clase.instructor} se cruza con otra clase activa del instructor (RF-008). Se omiten también sus inscripciones.`,
            );
            return;
          }
        }
      }

      contadores.clases.creados += 1;
      contadores.horarios.creados += 1;

      if (!escribe) {
        claseInfo.set(clase.key, { id: null, cupoDisponible: clase.cupoMaximo });
        return;
      }

      const creada = await prisma.clase.create({
        data: {
          instructorId,
          tipoBaile: clase.tipoBaile,
          ciudad: clase.ciudad,
          modalidad: clase.modalidad,
          cupoMaximo: clase.cupoMaximo,
          cupoDisponible: clase.cupoMaximo,
          precio: clase.precio,
          estado: clase.estado,
          horarios: { create: [clase.horario] },
        },
      });

      claseInfo.set(clase.key, { id: creada.id, cupoDisponible: clase.cupoMaximo });
    });
  }

  // --- Inscripciones, pagos y asistencia ---------------------------------
  for (const inscripcion of datos.inscripciones) {
    const etiqueta = `${inscripcion.usuario}${inscripcion.menor ? ` (${inscripcion.menor})` : ""} en ${inscripcion.clase}`;

    await paso("la inscripción", etiqueta, async () => {
      const info = claseInfo.get(inscripcion.clase);

      if (info === null || info === undefined) {
        contadores.inscripciones.omitidos += 1;

        if (inscripcion.pago) {
          contadores.pagos.omitidos += 1;
        }

        contadores.asistencias.omitidos += inscripcion.asistencias.length;
        return;
      }

      const usuarioId = usuarioIds.get(inscripcion.usuario);
      const menorId = inscripcion.menor ? menorIds.get(inscripcion.menor) : null;
      const claseId = info.id;
      const hayPendientes = !usuarioId || !claseId || (inscripcion.menor && !menorId);

      let existente = null;

      if (!hayPendientes) {
        existente = await prisma.inscripcion.findFirst({
          where: { usuarioId, claseId, menorId: inscripcion.menor ? menorId : null },
        });
      }

      if (existente) {
        contadores.inscripciones.existentes += 1;

        if (inscripcion.pago) {
          contadores.pagos.existentes += 1;
        }

        // Si ya existía, solo se completa la asistencia que falte (p. ej. una semana después).
        if (existente.estado !== "confirmada" || inscripcion.asistencias.length === 0) {
          contadores.asistencias.existentes += inscripcion.asistencias.length;
          return;
        }

        const registradas = await prisma.asistencia.findMany({
          where: { inscripcionId: existente.id },
          select: { fechaSesion: true },
        });
        const fechasRegistradas = new Set(registradas.map((fila) => aTextoFecha(new Date(fila.fechaSesion))));
        const faltantes = inscripcion.asistencias.filter(
          (asistencia) => !fechasRegistradas.has(aTextoFecha(asistencia.fechaSesion)),
        );

        contadores.asistencias.existentes += inscripcion.asistencias.length - faltantes.length;
        contadores.asistencias.creados += faltantes.length;

        if (escribe && faltantes.length > 0) {
          await prisma.asistencia.createMany({
            data: faltantes.map((asistencia) => ({
              inscripcionId: existente.id,
              fechaSesion: asistencia.fechaSesion,
              asistio: asistencia.asistio,
            })),
          });
        }

        return;
      }

      if (inscripcion.ocupaCupo && info.cupoDisponible <= 0) {
        contadores.inscripciones.omitidos += 1;

        if (inscripcion.pago) {
          contadores.pagos.omitidos += 1;
        }

        contadores.asistencias.omitidos += inscripcion.asistencias.length;
        advertencias.push(`Inscripción omitida (${etiqueta}): la clase ya no tiene cupos.`);
        return;
      }

      contadores.inscripciones.creados += 1;
      contadores.pagos.creados += inscripcion.pago ? 1 : 0;
      contadores.asistencias.creados += inscripcion.asistencias.length;

      if (inscripcion.ocupaCupo) {
        info.cupoDisponible -= 1;
      }

      if (!escribe) {
        return;
      }

      // Todo o nada por inscripción: si algo falla no quedan pagos o cupos a medias.
      await prisma.$transaction(async (tx) => {
        const creada = await tx.inscripcion.create({
          data: {
            claseId,
            usuarioId,
            menorId: inscripcion.menor ? menorId : null,
            estado: inscripcion.estado,
            canceladoPor: inscripcion.canceladoPor,
            creadoEn: inscripcion.creadoEn,
          },
        });

        if (inscripcion.pago) {
          await tx.pago.create({ data: { inscripcionId: creada.id, ...inscripcion.pago } });
        }

        if (inscripcion.asistencias.length > 0) {
          await tx.asistencia.createMany({
            data: inscripcion.asistencias.map((asistencia) => ({
              inscripcionId: creada.id,
              fechaSesion: asistencia.fechaSesion,
              asistio: asistencia.asistio,
            })),
          });
        }

        if (inscripcion.ocupaCupo) {
          await tx.clase.update({ where: { id: claseId }, data: { cupoDisponible: { decrement: 1 } } });
        }
      });
    });
  }

  return {
    dryRun,
    hoy: datos.hoy,
    contadores,
    advertencias,
    credenciales: datos.usuarios.map(({ nombre, correo, rol, estado, base, historia }) => ({
      nombre,
      correo,
      rol,
      estado,
      base: Boolean(base),
      historia,
    })),
  };
};

// ---------------------------------------------------------------------------
// Presentación del resultado
// ---------------------------------------------------------------------------

const formatearResumen = (contadores, { dryRun }) => {
  const encabezado = dryRun
    ? "Resumen (se CREARÍAN / ya existen / se omitirían):"
    : "Resumen (creados / ya existían / omitidos):";

  const filas = ENTIDADES.map((entidad) => {
    const { creados, existentes, omitidos } = contadores[entidad];

    return `  ${entidad.padEnd(14)} ${String(creados).padStart(4)} / ${String(existentes).padStart(4)} / ${String(omitidos).padStart(4)}`;
  });

  return [encabezado, ...filas].join("\n");
};

const formatearPlan = (plan) =>
  ["Se crearían (sobre una base vacía, después del seed base):", ...ENTIDADES.map((entidad) => `  ${entidad.padEnd(14)} ${String(plan[entidad]).padStart(4)}`)].join("\n");

const ETIQUETA_ROL = { admin: "admin", instructor: "instructor", estudiante: "estudiante", padre: "padre" };

const formatearCredenciales = (credenciales) => {
  const lineas = [
    `Credenciales (contraseña de TODAS: ${PASSWORD_DEMO}):`,
    "  rol          correo                                  estado       historia",
  ];

  for (const c of credenciales) {
    lineas.push(
      `  ${ETIQUETA_ROL[c.rol].padEnd(12)} ${c.correo.padEnd(39)} ${c.estado.padEnd(12)} ${c.historia}`,
    );
  }

  lineas.push(
    "Nota: las cuentas que ya existían antes de correr el script conservan su contraseña actual (no se modifican).",
  );

  return lineas.join("\n");
};

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const OPCIONES_VALIDAS = ["--reset", "--yes", "--dry-run", "--allow-remote", "--help"];

const AYUDA = `Datos de demostración de Danzas.app

Uso (desde backend/):
  npm run seed:demo                       Aditivo e idempotente: crea lo que falta, no borra nada
  npm run seed:demo -- --dry-run          Solo informa qué crearía (lee la base, no escribe)
  npm run seed:demo -- --reset --yes      BORRA toda la base, corre prisma/seed.js y carga la demo
  npm run seed:demo -- --allow-remote     Permite una base que no sea localhost (p. ej. la desplegada)

El "--" después del nombre del script es obligatorio para que npm pase las opciones.`;

/**
 * Algunas versiones de npm se "tragan" opciones sin el "--" y las dejan en
 * npm_config_*: también se respetan (igual que create-admin.js con --dry-run).
 */
const leerOpciones = (argv, env = {}) => {
  const activa = (opcion, variable) => argv.includes(opcion) || env[variable] === "true";

  return {
    desconocidas: argv.filter((argumento) => !OPCIONES_VALIDAS.includes(argumento)),
    reset: activa("--reset", "npm_config_reset"),
    confirmado: activa("--yes", "npm_config_yes"),
    dryRun: activa("--dry-run", "npm_config_dry_run"),
    permitirRemoto: activa("--allow-remote", "npm_config_allow_remote"),
    ayuda: argv.includes("--help"),
  };
};

const HOSTS_LOCALES = ["localhost", "127.0.0.1", "::1", "[::1]"];

const BACKEND_DIR = path.join(__dirname, "..");

// Corre el seed base (borra TODO y crea los 7 usuarios de prueba) con el mismo cwd y entorno.
const ejecutarSeedBaseDefault = () =>
  spawnSync(process.execPath, [path.join("prisma", "seed.js")], {
    cwd: BACKEND_DIR,
    stdio: "inherit",
    env: process.env,
  });

/**
 * Orquesta el CLI. Todo lo que toca el mundo exterior se inyecta para poder
 * probarlo sin base de datos. Devuelve el código de salida (0 = ok).
 */
const iniciar = async ({
  argv = [],
  env = process.env,
  cargarEntorno = () => require("dotenv").config({ quiet: true }),
  crearPrisma = () => require("../src/config/prisma"),
  ejecutarSeedBase = ejecutarSeedBaseDefault,
  hashPassword = hashPasswordDefault,
  log = console.log,
  logError = console.error,
  now = new Date(),
} = {}) => {
  const opciones = leerOpciones(argv, env);

  if (opciones.ayuda) {
    log(AYUDA);
    return 0;
  }

  if (opciones.desconocidas.length > 0) {
    logError(`Opción desconocida: ${opciones.desconocidas.join(", ")}. Nada se modificó.\n\n${AYUDA}`);
    return 1;
  }

  if (opciones.reset && !opciones.confirmado && !opciones.dryRun) {
    logError(
      [
        "[ABORTADO] --reset BORRA TODOS los datos de la base (usuarios, clases, inscripciones, pagos, asistencia)",
        "y la deja como el seed base + los datos de la demo. Nada se modificó.",
        "Si es lo que quieres, repite el comando agregando --yes:",
        "  npm run seed:demo -- --reset --yes",
      ].join("\n"),
    );
    return 1;
  }

  // --reset --dry-run no toca ni lee la base: solo muestra el plan desde cero.
  if (opciones.reset && opciones.dryRun) {
    log("[dry-run] Con --reset se ejecutaría `node prisma/seed.js` (BORRA todo y recrea los 7 usuarios base).");
    log(formatearPlan(contarPlan(buildDemoData(now))));
    log("No se escribió nada.");
    return 0;
  }

  cargarEntorno();

  const destino = describirDestino(env.DATABASE_URL);

  if (destino) {
    log(`Base de destino: ${formatearDestino(destino)}`);
  }

  const esLocal = destino ? HOSTS_LOCALES.includes(destino.host) : false;

  if (!esLocal && !opciones.permitirRemoto) {
    logError(
      destino
        ? `[ABORTADO] El destino (${destino.host}) no es localhost. Esta demo crea cuentas con una contraseña conocida (${PASSWORD_DEMO}). Si de verdad quieres sembrar esa base, agrega --allow-remote. Nada se modificó.`
        : "[ABORTADO] No pude interpretar DATABASE_URL para confirmar que la base sea local (¿falta la variable o la contraseña tiene caracteres especiales sin codificar?). Si estás seguro del destino, agrega --allow-remote. Nada se modificó.",
    );
    return 1;
  }

  if (opciones.reset) {
    log("[ADVERTENCIA] --reset: se BORRAN todos los datos de la base antes de cargar la demo.");

    const resultadoSeed = ejecutarSeedBase();

    if (!resultadoSeed || resultadoSeed.status !== 0) {
      logError(
        "[ERROR] El seed base (prisma/seed.js) falló, así que no se cargó la demo. Revisa el mensaje de arriba (¿MySQL encendido? ¿esquema aplicado con `npx prisma db push`?).",
      );
      return 1;
    }
  }

  const prisma = crearPrisma();

  try {
    if (opciones.dryRun) {
      log("[dry-run] Solo se lee la base; no se escribe nada.");
    }

    const resultado = await run({ prisma, dryRun: opciones.dryRun, now, hashPassword });

    log("");
    log(formatearResumen(resultado.contadores, { dryRun: resultado.dryRun }));

    for (const advertencia of resultado.advertencias) {
      log(`[aviso] ${advertencia}`);
    }

    log("");
    log(formatearCredenciales(resultado.credenciales));
    log("");
    log(
      resultado.dryRun
        ? "[dry-run] No se escribió nada."
        : `Listo. Fechas relativas a hoy (${resultado.hoy}, hora de Colombia). Ejecutarlo de nuevo no duplica nada.`,
    );

    return 0;
  } catch (error) {
    logError(`[ERROR] ${describirError(error)}`);
    return 1;
  } finally {
    if (typeof prisma.$disconnect === "function") {
      await prisma.$disconnect();
    }
  }
};

const main = async () => {
  process.exitCode = await iniciar({ argv: process.argv.slice(2) });
};

if (require.main === module) {
  main();
}

module.exports = {
  buildDemoData,
  contarPlan,
  run,
  iniciar,
  leerOpciones,
  describirError,
  seSuperponen,
  ultimasSesiones,
  diaDeColombia,
  PASSWORD_DEMO,
  DOMINIO_DEMO,
  HORARIOS_BASE,
  MOTIVO_ESTUDIANTE,
  MOTIVO_INSTRUCTOR,
  ENTIDADES,
};
