import { useEffect, useState } from "react";
import { getPaymentsReport } from "../../../services/reports.service";
import { getUsers } from "../../../services/users.service";
import { formatearPrecio } from "../../../utils/formatCurrency";
import Loading from "../../../components/common/Loading/Loading";
import Button from "../../../components/common/Button/Button";
import "./ReportsAdmin.css";

const RESUMEN_INICIAL = {
  cantidadPagos: 0,
  totalRecibido: 0,
  totalReembolsado: 0,
  neto: 0,
};

const obtenerDatos = (respuesta) => respuesta?.data ?? respuesta;

const obtenerUsuarios = (respuesta) => {
  const data = obtenerDatos(respuesta);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.usuarios)) return data.usuarios;
  if (Array.isArray(data?.users)) return data.users;

  return [];
};

const obtenerMensajeError = (err) => {
  const mensaje =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "No se pudo generar el reporte. Intenta nuevamente.";

  if (
    err?.response?.status === 400 &&
    /fecha|rango|desde|hasta/i.test(mensaje)
  ) {
    return `Rango de fechas inválido: ${mensaje}`;
  }

  return mensaje;
};

const obtenerValor = (objeto, ...claves) => {
  for (const clave of claves) {
    const valor = objeto?.[clave];

    if (valor !== undefined && valor !== null) {
      return valor;
    }
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

function ReportsAdmin() {
  const [filtros, setFiltros] = useState({
    desde: "",
    hasta: "",
    instructorId: "",
    academia: "",
  });

  const [instructores, setInstructores] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [resumen, setResumen] = useState(RESUMEN_INICIAL);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generado, setGenerado] = useState(false);

  useEffect(() => {
    let cancelado = false;

    const cargarInstructores = async () => {
      try {
        setLoadingUsuarios(true);

        const respuesta = await getUsers();
        const usuarios = obtenerUsuarios(respuesta);

        if (!cancelado) {
          setInstructores(
            usuarios.filter(
              (usuario) =>
                String(usuario.rol ?? usuario.role ?? "").toLowerCase() ===
                "instructor",
            ),
          );
        }
      } catch (err) {
        if (!cancelado) {
          setError(
            err?.response?.data?.message ||
              "No se pudo cargar la lista de instructores.",
          );
        }
      } finally {
        if (!cancelado) setLoadingUsuarios(false);
      }
    };

    cargarInstructores();

    return () => {
      cancelado = true;
    };
  }, []);

  const actualizarFiltro = (event) => {
    const { name, value } = event.target;

    setFiltros((actuales) => ({
      ...actuales,
      [name]: value,
    }));
  };

  const generarReporte = async (event) => {
    event.preventDefault();
    setError("");

    if (filtros.desde && filtros.hasta && filtros.desde > filtros.hasta) {
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

      const respuesta = await getPaymentsReport({
        desde: filtros.desde,
        hasta: filtros.hasta,
        instructorId: filtros.instructorId,
        academia: filtros.academia.trim(),
      });

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
    <main className="reports-admin">
      <header className="reports-admin__header">
        <h1>Reporte de pagos</h1>
        <p>Consulta los pagos, reembolsos y valores netos recibidos.</p>
      </header>

      <form className="reports-admin__filters" onSubmit={generarReporte}>
        <div className="reports-admin__field">
          <label htmlFor="desde">Fecha desde</label>
          <input
            id="desde"
            name="desde"
            type="date"
            value={filtros.desde}
            max={filtros.hasta || undefined}
            onChange={actualizarFiltro}
          />
        </div>

        <div className="reports-admin__field">
          <label htmlFor="hasta">Fecha hasta</label>
          <input
            id="hasta"
            name="hasta"
            type="date"
            value={filtros.hasta}
            min={filtros.desde || undefined}
            onChange={actualizarFiltro}
          />
        </div>

        <div className="reports-admin__field">
          <label htmlFor="instructorId">Instructor</label>
          <select
            id="instructorId"
            name="instructorId"
            value={filtros.instructorId}
            onChange={actualizarFiltro}
            disabled={loadingUsuarios}
          >
            <option value="">Todos los instructores</option>
            {instructores.map((instructor) => (
              <option key={instructor.id} value={instructor.id}>
                {obtenerNombre(instructor)}
              </option>
            ))}
          </select>
        </div>

        <div className="reports-admin__field">
          <label htmlFor="academia">Academia</label>
          <input
            id="academia"
            name="academia"
            type="text"
            value={filtros.academia}
            onChange={actualizarFiltro}
            placeholder="Nombre de la academia"
          />
        </div>

        <div className="reports-admin__actions">
          <Button type="submit" disabled={loading}>
            {loading ? "Generando..." : "Generar reporte"}
          </Button>
        </div>
      </form>

      {error && (
        <div className="reports-admin__error" role="alert">
          {error}
        </div>
      )}

      {loading && <Loading text="Generando reporte de pagos..." />}

      {!loading && generado && (
        <>
          <section className="reports-admin__summary">
            <article className="reports-admin__summary-card">
              <span>Cantidad de pagos</span>
              <strong>{resumen.cantidadPagos}</strong>
            </article>

            <article className="reports-admin__summary-card">
              <span>Total recibido</span>
              <strong>{formatearPrecio(resumen.totalRecibido)}</strong>
            </article>

            <article className="reports-admin__summary-card">
              <span>Total reembolsado</span>
              <strong>{formatearPrecio(resumen.totalReembolsado)}</strong>
            </article>

            <article className="reports-admin__summary-card">
              <span>Neto</span>
              <strong>{formatearPrecio(resumen.neto)}</strong>
            </article>
          </section>

          {pagos.length === 0 ? (
            <section className="reports-admin__empty">
              <h2>No hay pagos para esos filtros</h2>
              <p>Prueba con otras fechas, instructor o academia.</p>
            </section>
          ) : (
            <section className="reports-admin__table-section">
              <h2>Detalle de pagos</h2>

              <div className="reports-admin__table-wrapper">
                <table className="reports-admin__table">
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
                              className={`reports-admin__payment-status ${
                                reembolsado
                                  ? "reports-admin__payment-status--refunded"
                                  : "reports-admin__payment-status--normal"
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

export default ReportsAdmin;
