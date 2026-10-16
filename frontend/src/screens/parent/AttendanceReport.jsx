import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDependents } from "../../services/users.service";
import { getAttendanceReport } from "../../services/reports.service";
import { formatearFecha } from "../../utils/formatDate";
import Loading from "../../components/common/Loading/Loading";
import "./AttendanceReport.css";

const obtenerDatos = (respuesta) => respuesta?.data ?? respuesta;

const obtenerListaHijos = (respuesta) => {
  const data = obtenerDatos(respuesta);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.menores)) return data.menores;
  if (Array.isArray(data?.dependents)) return data.dependents;
  if (Array.isArray(data?.hijos)) return data.hijos;

  return [];
};

const obtenerNombre = (persona) => {
  if (typeof persona === "string") return persona;
  if (!persona) return "Sin nombre";

  return (
    persona.nombreCompleto ||
    persona.nombre ||
    [persona.nombres, persona.apellidos].filter(Boolean).join(" ") ||
    "Sin nombre"
  );
};

const obtenerValor = (objeto, ...claves) => {
  for (const clave of claves) {
    const valor = objeto?.[clave];
    if (valor !== undefined && valor !== null) return valor;
  }

  return 0;
};

const obtenerPorcentaje = (valor) => {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return 0;

  return Math.min(100, Math.max(0, numero));
};

const obtenerFecha = (registro) => {
  const valor =
    registro.fecha ||
    registro.fechaSesion ||
    registro.fechaAsistencia ||
    registro.createdAt;

  if (!valor) return "Fecha no disponible";

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) return "Fecha no disponible";

  return fecha.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const estaPresente = (registro) => {
  const estado = String(
    registro.estado ?? registro.asistencia ?? "",
  ).toLowerCase();

  return (
    registro.presente === true ||
    estado === "presente" ||
    estado === "asistio" ||
    estado === "asistió"
  );
};

const obtenerClases = (reporte) => {
  if (Array.isArray(reporte?.clases)) return reporte.clases;
  if (Array.isArray(reporte?.asistenciasPorClase)) {
    return reporte.asistenciasPorClase;
  }

  return [];
};

const obtenerRegistros = (clase) => {
  if (Array.isArray(clase?.asistencias)) return clase.asistencias;
  if (Array.isArray(clase?.sesiones)) return clase.sesiones;
  if (Array.isArray(clase?.registros)) return clase.registros;

  return [];
};

function AttendanceReport() {
  const navigate = useNavigate();

  const [hijos, setHijos] = useState([]);
  const [dependentId, setDependentId] = useState("");
  const [reporte, setReporte] = useState(null);
  const [loadingHijos, setLoadingHijos] = useState(true);
  const [loadingReporte, setLoadingReporte] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelado = false;

    const cargarHijos = async () => {
      try {
        setLoadingHijos(true);
        setError("");

        const respuesta = await getDependents();
        const lista = obtenerListaHijos(respuesta);

        if (!cancelado) {
          setHijos(lista);

          if (lista.length > 0) {
            setDependentId(String(lista[0].id));
          }
        }
      } catch (err) {
        if (!cancelado) {
          setError(
            err?.response?.data?.message ||
              "No se pudieron cargar los hijos registrados.",
          );
        }
      } finally {
        if (!cancelado) setLoadingHijos(false);
      }
    };

    cargarHijos();

    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    if (!dependentId) {
      setReporte(null);
      return undefined;
    }

    let cancelado = false;

    const cargarReporte = async () => {
      try {
        setLoadingReporte(true);
        setError("");
        setReporte(null);

        const respuesta = await getAttendanceReport(dependentId);

        if (!cancelado) {
          setReporte(obtenerDatos(respuesta));
        }
      } catch (err) {
        if (!cancelado) {
          setError(
            err?.response?.data?.message ||
              "No se pudo cargar el reporte de asistencia.",
          );
        }
      } finally {
        if (!cancelado) setLoadingReporte(false);
      }
    };

    cargarReporte();

    return () => {
      cancelado = true;
    };
  }, [dependentId]);

  const resumen = reporte?.resumen ?? {};
  const clases = obtenerClases(reporte);

  const sesiones = obtenerValor(
    resumen,
    "sesiones",
    "totalSesiones",
    "cantidadSesiones",
  );
  const presentes = obtenerValor(
    resumen,
    "presentes",
    "totalPresentes",
    "asistencias",
  );
  const ausentes = obtenerValor(
    resumen,
    "ausentes",
    "totalAusentes",
    "inasistencias",
  );

  const porcentaje = obtenerPorcentaje(
    obtenerValor(resumen, "porcentaje", "porcentajeAsistencia"),
  );

  const sinAsistencia =
    reporte &&
    Number(sesiones) === 0 &&
    clases.every((clase) => obtenerRegistros(clase).length === 0);

  return (
    <main className="attendance-report">
      <header className="attendance-report__header">
        <h1>Reporte de asistencia</h1>
        <p>Consulta la asistencia de tus hijos a sus clases de baile.</p>
      </header>

      {loadingHijos ? (
        <Loading text="Cargando hijos registrados..." />
      ) : hijos.length === 0 ? (
        <section className="attendance-report__empty">
          <h2>Aún no tienes hijos registrados</h2>
          <p>
            Registra a tu hijo para poder consultar su información de
            asistencia.
          </p>
          <button
            type="button"
            className="attendance-report__button"
            onClick={() => navigate("/padre/menores/nuevo")}
          >
            Registrar hijo
          </button>
        </section>
      ) : (
        <>
          <section className="attendance-report__selector">
            <label htmlFor="attendance-dependent">Selecciona a tu hijo</label>

            <select
              id="attendance-dependent"
              value={dependentId}
              onChange={(event) => setDependentId(event.target.value)}
            >
              {hijos.map((hijo) => (
                <option key={hijo.id} value={hijo.id}>
                  {obtenerNombre(hijo)}
                </option>
              ))}
            </select>
          </section>

          {error && (
            <div className="attendance-report__error" role="alert">
              {error}
            </div>
          )}

          {loadingReporte ? (
            <Loading text="Cargando reporte de asistencia..." />
          ) : reporte && !error ? (
            sinAsistencia ? (
              <section className="attendance-report__empty">
                <h2>Todavía no hay asistencia registrada</h2>
                <p>
                  Cuando se registren las asistencias de las clases, aparecerán
                  aquí.
                </p>
              </section>
            ) : (
              <>
                <section className="attendance-report__summary">
                  <article className="attendance-report__summary-card">
                    <span>Sesiones</span>
                    <strong>{sesiones}</strong>
                  </article>

                  <article className="attendance-report__summary-card">
                    <span>Presentes</span>
                    <strong>{presentes}</strong>
                  </article>

                  <article className="attendance-report__summary-card">
                    <span>Ausentes</span>
                    <strong>{ausentes}</strong>
                  </article>

                  <article className="attendance-report__summary-card">
                    <span>Asistencia general</span>
                    <strong>{porcentaje}%</strong>
                    <div
                      className="attendance-report__progress"
                      role="progressbar"
                      aria-label="Porcentaje general de asistencia"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={porcentaje}
                    >
                      <div
                        className="attendance-report__progress-fill"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </article>
                </section>

                {clases.length === 0 ? (
                  <section className="attendance-report__empty">
                    <h2>Todavía no hay asistencia registrada</h2>
                    <p>No hay registros de asistencia por clase.</p>
                  </section>
                ) : (
                  <section className="attendance-report__classes">
                    <h2>Asistencia por clase</h2>

                    {clases.map((clase, index) => {
                      const registros = obtenerRegistros(clase);
                      const porcentajeClase = obtenerPorcentaje(
                        obtenerValor(
                          clase,
                          "porcentaje",
                          "porcentajeAsistencia",
                        ),
                      );

                      return (
                        <article
                          className="attendance-report__class-card"
                          key={clase.id ?? clase.claseId ?? index}
                        >
                          <div className="attendance-report__class-header">
                            <h3>
                              {clase.tipoBaile ||
                                clase.nombre ||
                                clase.clase?.tipoBaile ||
                                "Clase de baile"}
                            </h3>
                            <strong>{porcentajeClase}%</strong>
                          </div>

                          <div
                            className="attendance-report__progress"
                            role="progressbar"
                            aria-label={`Asistencia de ${clase.tipoBaile || clase.nombre || "la clase"}`}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={porcentajeClase}
                          >
                            <div
                              className="attendance-report__progress-fill"
                              style={{ width: `${porcentajeClase}%` }}
                            />
                          </div>

                          {registros.length === 0 ? (
                            <p className="attendance-report__no-records">
                              Todavía no hay asistencia registrada para esta
                              clase.
                            </p>
                          ) : (
                            <ul className="attendance-report__records">
                              {registros.map((registro, registroIndex) => {
                                const presente = estaPresente(registro);

                                return (
                                  <li
                                    key={
                                      registro.id ??
                                      `${clase.id ?? index}-registro-${registroIndex}`
                                    }
                                  >
                                    <span>{obtenerFecha(registro)}</span>
                                    <span
                                      className={`attendance-report__status ${
                                        presente
                                          ? "attendance-report__status--present"
                                          : "attendance-report__status--absent"
                                      }`}
                                    >
                                      {presente ? "Presente" : "Ausente"}
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </article>
                      );
                    })}
                  </section>
                )}
              </>
            )
          ) : null}
        </>
      )}
    </main>
  );
}

export default AttendanceReport;
