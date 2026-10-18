const paymentRepository = require("../repositories/payment.repository");
const attendanceRepository = require("../repositories/attendance.repository");
const dependentRepository = require("../repositories/dependent.repository");
const { AppError } = require("../middleware/errorHandler");

const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

// Los filtros de texto del query: lo que no sea texto (arrays por parametros
// repetidos) o venga vacio se trata como filtro ausente.
const normalizarTexto = (valor) => {
  if (typeof valor !== "string") {
    return null;
  }

  return valor.trim() || null;
};

const esFechaValida = (fecha) => {
  if (!FORMATO_FECHA.test(fecha)) {
    return false;
  }

  // Descarta fechas inexistentes como 2026-02-30, que Date normalizaria a marzo.
  return new Date(`${fecha}T00:00:00.000Z`).toISOString().startsWith(fecha);
};

const fechaInvalida = () => new AppError("Rango de fechas inválido.", 400, "INVALID_DATE_RANGE");

// Una fecha ausente (o vacia) es un filtro sin usar; una presente debe ser YYYY-MM-DD.
const normalizarFecha = (valor) => {
  if (valor === undefined || valor === null) {
    return null;
  }

  const fecha = typeof valor === "string" ? valor.trim() : valor;

  if (fecha === "") {
    return null;
  }

  if (typeof fecha !== "string" || !esFechaValida(fecha)) {
    throw fechaInvalida();
  }

  return fecha;
};

// Los montos son DECIMAL(10,2): se suman redondeando a centavos para no arrastrar
// errores de punto flotante (0.1 + 0.2).
const redondear = (monto) => Math.round(monto * 100) / 100;

// El reporte expone solo lo que muestran las pantallas: nada de correos, referencia
// de la pasarela ni columnas internas.
const proyectarPago = (pago, monto) => {
  const { inscripcion } = pago;

  return {
    id: pago.id,
    inscripcionId: pago.inscripcionId,
    monto,
    estado: pago.estado,
    reembolsado: pago.reembolsado,
    motivoReembolso: pago.motivoReembolso,
    procesadoEn: pago.procesadoEn,
    inscripcion: {
      id: inscripcion.id,
      claseId: inscripcion.claseId,
      estado: inscripcion.estado,
      clase: {
        id: inscripcion.clase.id,
        tipoBaile: inscripcion.clase.tipoBaile,
        instructor: { id: inscripcion.clase.instructor.id, nombre: inscripcion.clase.instructor.nombre },
      },
      usuario: { id: inscripcion.usuario.id, nombre: inscripcion.usuario.nombre },
      menor: inscripcion.menor ? { id: inscripcion.menor.id, nombre: inscripcion.menor.nombre } : null,
    },
  };
};

/**
 * RF-015: reporte de pagos recibidos. El administrador filtra libremente; el
 * instructor solo ve los pagos de sus propias clases.
 * `totalRecibido` suma los pagos aprobados y `totalReembolsado` los aprobados que
 * luego se reembolsaron (el reembolso no cambia el estado del pago).
 * Limitacion conocida: `marcarComoReembolsado` sobrescribe `procesadoEn`, asi que un
 * pago reembolsado cae en el rango de fechas del reembolso y no en el del cobro.
 */
const reportePagos = async (usuario, filtros = {}) => {
  const desde = normalizarFecha(filtros.desde);
  const hasta = normalizarFecha(filtros.hasta);
  const academia = normalizarTexto(filtros.academia);
  let instructorId = normalizarTexto(filtros.instructorId);

  // YYYY-MM-DD se ordena igual como texto que como fecha.
  if (desde && hasta && desde > hasta) {
    throw fechaInvalida();
  }

  if (usuario.rol === "instructor") {
    if (instructorId && instructorId !== usuario.id) {
      throw new AppError("No podés ver los pagos de otro instructor.", 403, "FORBIDDEN");
    }

    instructorId = usuario.id;
  }

  const filtrosAplicados = { desde, hasta, instructorId, academia };
  const registros = await paymentRepository.buscarParaReporte(filtrosAplicados);

  let totalRecibido = 0;
  let totalReembolsado = 0;

  const pagos = registros.map((pago) => {
    const monto = Number(pago.monto);

    if (pago.estado === "aprobado") {
      totalRecibido += monto;

      if (pago.reembolsado) {
        totalReembolsado += monto;
      }
    }

    return proyectarPago(pago, monto);
  });

  totalRecibido = redondear(totalRecibido);
  totalReembolsado = redondear(totalReembolsado);

  return {
    filtros: filtrosAplicados,
    resumen: {
      cantidad: pagos.length,
      totalRecibido,
      totalReembolsado,
      neto: redondear(totalRecibido - totalReembolsado),
    },
    pagos,
  };
};

// Porcentaje de asistencia con un decimal; sin sesiones es 0 (no divide por cero).
const calcularPorcentaje = (presentes, sesiones) => {
  if (sesiones === 0) {
    return 0;
  }

  return Math.round((presentes / sesiones) * 1000) / 10;
};

const estadisticas = (sesiones, presentes) => ({
  sesiones,
  presentes,
  ausentes: sesiones - presentes,
  porcentaje: calcularPorcentaje(presentes, sesiones),
});

/**
 * RF-016: reporte de asistencia de un hijo, agrupado por clase. Solo el padre
 * del menor puede consultarlo.
 */
const reporteAsistencia = async (usuario, dependentId) => {
  if (typeof dependentId !== "string" || !dependentId.trim()) {
    throw new AppError("Indicá el hijo a consultar.", 400, "MISSING_DEPENDENT");
  }

  const menor = await dependentRepository.findById(dependentId.trim());

  if (!menor) {
    throw new AppError("Menor no encontrado.", 404, "DEPENDENT_NOT_FOUND");
  }

  if (menor.padreId !== usuario.id) {
    throw new AppError("No tenés permiso para ver la asistencia de este menor.", 403, "FORBIDDEN");
  }

  const asistencias = await attendanceRepository.findByMenor(menor.id);

  // Las asistencias llegan de la mas reciente a la mas antigua: las clases quedan
  // ordenadas por su ultima sesion y el detalle de cada una tambien.
  const porClase = new Map();
  let presentesTotal = 0;

  for (const registro of asistencias) {
    const { id, tipoBaile, ciudad, instructor } = registro.inscripcion.clase;

    if (!porClase.has(id)) {
      porClase.set(id, { claseId: id, tipoBaile, ciudad, instructor, presentes: 0, detalle: [] });
    }

    const entrada = porClase.get(id);

    entrada.detalle.push({
      fecha: registro.fechaSesion.toISOString().slice(0, 10),
      asistio: registro.asistio,
    });

    if (registro.asistio) {
      entrada.presentes += 1;
      presentesTotal += 1;
    }
  }

  const clases = [...porClase.values()].map(({ presentes, detalle, ...clase }) => ({
    ...clase,
    ...estadisticas(detalle.length, presentes),
    detalle,
  }));

  return {
    menor: { id: menor.id, nombre: menor.nombre },
    resumen: estadisticas(asistencias.length, presentesTotal),
    clases,
  };
};

module.exports = {
  reportePagos,
  reporteAsistencia,
};
