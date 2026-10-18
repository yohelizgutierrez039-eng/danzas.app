// src/components/reports/PaymentsReportResults/PaymentsReportResults.jsx

import Loading from "../../common/Loading/Loading";
import ErrorMessage from "../../common/ErrorMessage/ErrorMessage";
import EmptyState from "../../common/EmptyState/EmptyState";
import Badge from "../../common/Badge/Badge";
import StatCard from "../../dashboard/StatCard";

import "./PaymentsReportResults.css";

const REFUND_REASONS = {
  cancelacion_instructor: "Cancelación del instructor",
  cancelacion_estudiante_anticipada: "Cancelación anticipada del estudiante",
};

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 2,
});

// El backend interpreta las fechas del reporte en hora de Colombia.
const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Bogota",
});

const formatMoney = (amount) => currencyFormatter.format(amount);

const formatDateTime = (isoDate) => dateFormatter.format(new Date(isoDate));

// Resumen (tarjetas) y detalle (tabla) de un reporte de pagos.
// `showInstructor` oculta la columna del instructor en su propia pantalla.
function PaymentsReportResults({
  report,
  loading,
  error,
  showInstructor = true,
}) {
  if (loading) {
    return <Loading text="Generando reporte..." />;
  }

  if (error) {
    return <ErrorMessage title="No se pudo generar el reporte" message={error} />;
  }

  if (!report) {
    return null;
  }

  const { resumen, pagos } = report;

  if (pagos.length === 0) {
    return (
      <EmptyState
        title="No hay pagos para esos filtros"
        description="Prueba con otro rango de fechas o con otros filtros."
      />
    );
  }

  return (
    <div className="payments-report">
      <section className="payments-report__summary">
        <StatCard icon="▣" label="Pagos" value={resumen.cantidad} />
        <StatCard
          icon="$"
          label="Total recibido"
          value={formatMoney(resumen.totalRecibido)}
        />
        <StatCard
          icon="↺"
          label="Total reembolsado"
          value={formatMoney(resumen.totalReembolsado)}
        />
        <StatCard icon="=" label="Neto" value={formatMoney(resumen.neto)} />
      </section>

      <div className="payments-report__table-wrapper">
        <table className="payments-report__table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Estudiante o menor</th>
              <th>Clase</th>
              {showInstructor && <th>Instructor</th>}
              <th>Monto</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            {pagos.map((pago) => {
              const { menor, usuario, clase } = pago.inscripcion;

              return (
                <tr key={pago.id}>
                  <td>{formatDateTime(pago.procesadoEn)}</td>
                  <td>
                    <strong>{menor ? menor.nombre : usuario.nombre}</strong>
                    {menor && (
                      <span className="payments-report__note">
                        Acudiente: {usuario.nombre}
                      </span>
                    )}
                  </td>
                  <td>{clase.tipoBaile}</td>
                  {showInstructor && <td>{clase.instructor.nombre}</td>}
                  <td>{formatMoney(pago.monto)}</td>
                  <td>
                    {pago.reembolsado ? (
                      <>
                        <Badge variant="warning" size="small">
                          Reembolsado
                        </Badge>
                        {pago.motivoReembolso && (
                          <span className="payments-report__note">
                            {REFUND_REASONS[pago.motivoReembolso]}
                          </span>
                        )}
                      </>
                    ) : (
                      <Badge variant="success" size="small">
                        Pagado
                      </Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PaymentsReportResults;
