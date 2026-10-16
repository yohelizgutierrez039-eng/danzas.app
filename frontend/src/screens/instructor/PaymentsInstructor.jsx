import { useState } from "react";
import { getPaymentsReport } from "../../services/reports.service";
import { formatearPrecio } from "../../utils/formatCurrency";
import Loading from "../../components/common/Loading/Loading";
import Button from "../../components/common/Button/Button";
import "./PaymentsInstructor.css";

const RESUMEN_INICIAL = {
  cantidadPagos: 0,
  totalRecibido: 0,
  totalReembolsado: 0,
  neto: 0,
};

const obtenerDatos = (respuesta) => respuesta?.data ?? respuesta;

const obtenerValor = (objeto, ...claves) => {
  for (const clave of claves) {
    const valor = objeto?.[clave];

    if (valor !== undefined && valor !== null) return valor;
  }

  return 0;
};

const obtenerNombre = (persona) => {
  if (typeof persona === "string") return persona;
  if (!persona) return "No especificado";

  return (
    persona.nombreCompleto ||
    persona.nombre ||
    [persona.nombres, persona.apellidos].filter(Boolean).join(" ") ||
    persona.name ||
    "No especificado"
  );
};

const obtenerFecha = (pago) => {
  const fecha = pago.fecha || pago.createdAt || pago.fechaPago;

  if (!fecha) return "—";

  const fechaValida = new Date(fecha);

  return Number.isNaN(fechaValida.getTime())
    ? "—"
    : fechaValida.toLocaleDateString("es-CO");
};

const obtenerMensajeError = (err) => {
  const mensaje =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "No se pudo cargar el reporte de pagos.";

  if (
    err?.response?.status === 400 &&
    /fecha|rango|desde|hasta/i.test(mensaje)
  ) {
    return `Rango de fechas inválido: ${mensaje}`;
  }

  return mensaje;
};

function PaymentsInstructor() {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [pagos, setPagos] = useState([]);
  const [resumen, setResumen] = useState(RESUMEN_INICIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generado, setGenerado] = useState(false);

  const generarReporte = async (event) => {
    event.preventDefault();
    setError("");

    if (desde && hasta && desde > hasta) {
      setError(
        "Rango de fechas inválido: la fecha inicial no puede ser posterior a la fecha final.",
      );
      return;
    }

    try {
      setLoading(true);
      setGenerado(false);
      setPagos([]);
      setResumen(RESUMEN_INICIAL);

      // No enviar instructorId: el backend identifica al instructor autenticado.
      const respuesta = await getPaymentsReport({ desde, hasta });
      const data = obtenerDatos(respuesta);

      const listaPagos = Array.isArray(data?.pagos)
        ? data.pagos
        : Array.isArray(data?.data?.pagos)
          ? data.data.pagos
          : [];

      const datosResumen =
        data?.resumen ?? data?.data?.resumen ?? RESUMEN_INICIAL;

      setPagos(listaPagos);
      setResumen({
        cantidadPagos: obtenerValor(
          datosResumen,
          "cantidadPagos",
          "totalPagos",
          "cantidad",
        ),
        totalRecibido: obtenerValor(datosResumen, "totalRecibido", "recibido"),
        totalReembolsado: obtenerValor(
          datosResumen,
          "totalReembolsado",
          "reembolsado",
        ),
        neto: obtenerValor(datosResumen, "neto", "totalNeto"),
      });

      setGenerado(true);
    } catch (err) {
      setError(obtenerMensajeError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="payments-instructor">
      <header className="payments-instructor__header">
        <h1>Mis pagos</h1>
        <p>Consulta los pagos y reembolsos de tus clases.</p>
      </header>

      <form className="payments-instructor__filters" onSubmit={generarReporte}>
        <div className="payments-instructor__field">
          <label htmlFor="payments-desde">Fecha desde</label>
          <input
            id="payments-desde"
            name="desde"
            type="date"
            value={desde}
            max={hasta || undefined}
            onChange={(event) => setDesde(event.target.value)}
          />
        </div>

        <div className="payments-instructor__field">
          <label htmlFor="payments-hasta">Fecha hasta</label>
          <input
            id="payments-hasta"
            name="hasta"
            type="date"
            value={hasta}
            min={desde || undefined}
            onChange={(event) => setHasta(event.target.value)}
          />
        </div>

        <div className="payments-instructor__actions">
          <Button type="submit" disabled={loading}>
            {loading ? "Generando..." : "Generar reporte"}
          </Button>
        </div>
      </form>

      {error && (
        <div className="payments-instructor__error" role="alert">
          {error}
        </div>
      )}

      {loading && <Loading text="Cargando reporte de pagos..." />}

      {!loading && generado && (
        <>
          <section className="payments-instructor__summary">
            <article className="payments-instructor__summary-card">
              <span>Cantidad de pagos</span>
              <strong>{resumen.cantidadPagos}</strong>
            </article>

            <article className="payments-instructor__summary-card">
              <span>Total recibido</span>
              <strong>{formatearPrecio(resumen.totalRecibido)}</strong>
            </article>

            <article className="payments-instructor__summary-card">
              <span>Total reembolsado</span>
              <strong>{formatearPrecio(resumen.totalReembolsado)}</strong>
            </article>

            <article className="payments-instructor__summary-card">
              <span>Neto</span>
              <strong>{formatearPrecio(resumen.neto)}</strong>
            </article>
          </section>

          {pagos.length === 0 ? (
            <section className="payments-instructor__empty">
              <h2>No hay pagos para esos filtros</h2>
              <p>Prueba con otro rango de fechas.</p>
            </section>
          ) : (
            <section className="payments-instructor__table-section">
              <h2>Detalle de pagos</h2>

              <div className="payments-instructor__table-wrapper">
                <table className="payments-instructor__table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Estudiante o menor</th>
                      <th>Clase</th>
                      <th>Instructor</th>
                      <th>Monto</th>
                      <th>Estado</th>
                    </tr>
                  </thead>

                  <tbody>
                    {pagos.map((pago, index) => {
                      const inscripcion =
                        pago.inscripcion ?? pago.enrollment ?? {};
                      const clase = inscripcion.clase ?? pago.clase ?? {};
                      const estudiante =
                        inscripcion.menor ??
                        inscripcion.estudiante ??
                        inscripcion.usuario ??
                        pago.menor ??
                        pago.estudiante ??
                        pago.usuario;
                      const instructor = clase.instructor ?? pago.instructor;

                      const reembolsado =
                        pago.reembolsado === true ||
                        String(pago.estado ?? "").toLowerCase() ===
                          "reembolsado";

                      return (
                        <tr key={pago.id ?? pago.pagoId ?? index}>
                          <td>{obtenerFecha(pago)}</td>
                          <td>{obtenerNombre(estudiante)}</td>
                          <td>
                            {clase.tipoBaile ||
                              clase.nombre ||
                              pago.nombreClase ||
                              "No especificada"}
                          </td>
                          <td>{obtenerNombre(instructor)}</td>
                          <td>
                            {formatearPrecio(
                              obtenerValor(pago, "monto", "amount", "valor"),
                            )}
                          </td>
                          <td>
                            <span
                              className={`payments-instructor__status ${
                                reembolsado
                                  ? "payments-instructor__status--refunded"
                                  : "payments-instructor__status--normal"
                              }`}
                            >
                              {reembolsado ? "Reembolsado" : "No reembolsado"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}

export default PaymentsInstructor;
