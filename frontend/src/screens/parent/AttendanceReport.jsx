// src/screens/parent/AttendanceReport.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Loading from "../../components/common/Loading/Loading";
import ErrorMessage from "../../components/common/ErrorMessage/ErrorMessage";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import Select from "../../components/common/Select/Select";
import Badge from "../../components/common/Badge/Badge";
import StatCard from "../../components/dashboard/StatCard";
import { getDependents } from "../../services/users.service";
import { getAttendanceReport } from "../../services/reports.service";

import "./AttendanceReport.css";

// Mensajes por código de error del backend (GET /reports/attendance).
const ERROR_MESSAGES = {
  MISSING_DEPENDENT: "Selecciona un hijo para consultar su asistencia.",
  DEPENDENT_NOT_FOUND: "No se encontró al menor seleccionado.",
  FORBIDDEN: "No tienes permiso para ver la asistencia de este menor.",
};

const formatPercent = (percent) => `${percent.toLocaleString("es-CO")}%`;

// Las fechas de sesión llegan como YYYY-MM-DD; se leen en hora local para que
// no retrocedan un día por la zona horaria.
const formatSessionDate = (isoDate) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

function AttendanceReport() {
  const navigate = useNavigate();

  const [dependents, setDependents] = useState([]);
  const [dependentsLoading, setDependentsLoading] = useState(true);
  const [dependentsError, setDependentsError] = useState("");

  const [chosenId, setChosenId] = useState("");
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");

  // Mientras el padre no elige, se consulta el primer hijo.
  const selectedId = chosenId || dependents[0]?.id;

  useEffect(() => {
    const loadDependents = async () => {
      try {
        const data = await getDependents();

        setDependents(data.dependents ?? []);
      } catch (err) {
        setDependentsError(err.message || "No se pudieron cargar los menores.");
      } finally {
        setDependentsLoading(false);
      }
    };

    loadDependents();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    let cancelled = false;

    const loadReport = async () => {
      try {
        setReportLoading(true);
        setReportError("");

        const data = await getAttendanceReport(selectedId);

        if (!cancelled) {
          setReport(data);
        }
      } catch (err) {
        if (!cancelled) {
          setReport(null);
          setReportError(
            ERROR_MESSAGES[err.data?.error?.code] ||
              err.message ||
              "No se pudo cargar el reporte de asistencia.",
          );
        }
      } finally {
        if (!cancelled) {
          setReportLoading(false);
        }
      }
    };

    loadReport();

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  if (dependentsLoading) {
    return (
      <div className="attendance-report">
        <Loading text="Cargando menores..." />
      </div>
    );
  }

  const renderReport = () => {
    if (reportLoading) {
      return <Loading text="Cargando asistencia..." />;
    }

    if (reportError) {
      return (
        <ErrorMessage
          title="No se pudo cargar la asistencia"
          message={reportError}
        />
      );
    }

    if (!report) {
      return null;
    }

    const { menor, resumen, clases } = report;

    if (resumen.sesiones === 0) {
      return (
        <EmptyState
          title="Todavía no hay asistencia registrada"
          description={`${menor.nombre} aún no tiene sesiones con asistencia registrada.`}
        />
      );
    }

    return (
      <>
        <section className="attendance-report__summary">
          <StatCard icon="▣" label="Sesiones" value={resumen.sesiones} />
          <StatCard icon="✓" label="Presentes" value={resumen.presentes} />
          <StatCard icon="×" label="Ausentes" value={resumen.ausentes} />
          <StatCard
            icon="%"
            label="Asistencia"
            value={formatPercent(resumen.porcentaje)}
          />
        </section>

        <section className="attendance-report__classes">
          {clases.map((clase) => (
            <article className="attendance-class" key={clase.claseId}>
              <header className="attendance-class__header">
                <div>
                  <h2>{clase.tipoBaile}</h2>

                  <span>
                    {clase.ciudad} · Instructor: {clase.instructor.nombre}
                  </span>
                </div>

                <strong className="attendance-class__percent">
                  {formatPercent(clase.porcentaje)}
                </strong>
              </header>

              <div
                className="attendance-class__bar"
                role="progressbar"
                aria-label={`Asistencia en ${clase.tipoBaile}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={clase.porcentaje}
              >
                <div
                  className="attendance-class__bar-fill"
                  style={{ width: `${clase.porcentaje}%` }}
                />
              </div>

              <p className="attendance-class__totals">
                {clase.presentes} presentes y {clase.ausentes} ausentes en{" "}
                {clase.sesiones} sesiones
              </p>

              <ul className="attendance-class__sessions">
                {clase.detalle.map((sesion, index) => (
                  <li key={`${sesion.fecha}-${index}`}>
                    <span>{formatSessionDate(sesion.fecha)}</span>

                    <Badge
                      variant={sesion.asistio ? "success" : "danger"}
                      size="small"
                    >
                      {sesion.asistio ? "Presente" : "Ausente"}
                    </Badge>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      </>
    );
  };

  return (
    <div className="attendance-report">
      <header className="attendance-report__header">
        <span className="attendance-report__eyebrow">Padre de familia</span>

        <h1>Asistencia de mis hijos</h1>

        <p>Consulta la asistencia de cada uno de tus hijos a sus clases.</p>
      </header>

      {dependentsError ? (
        <ErrorMessage
          title="No se pudieron cargar los menores"
          message={dependentsError}
        />
      ) : dependents.length === 0 ? (
        <EmptyState
          title="No tienes menores registrados"
          description="Registra a tus hijos para consultar su asistencia."
          actionText="Registrar menor"
          onAction={() => navigate("/padre/menores/nuevo")}
        />
      ) : (
        <>
          <div className="attendance-report__selector">
            <Select
              label="Hijo"
              name="dependentId"
              value={selectedId}
              onChange={(event) => setChosenId(event.target.value)}
              placeholder=""
              options={dependents.map((menor) => ({
                value: menor.id,
                label: menor.nombre,
              }))}
            />
          </div>

          {renderReport()}
        </>
      )}
    </div>
  );
}

export default AttendanceReport;
