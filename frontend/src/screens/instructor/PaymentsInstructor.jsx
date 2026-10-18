// src/screens/instructor/PaymentsInstructor.jsx

import { useState } from "react";

import Input from "../../components/common/Input/Input";
import Button from "../../components/common/Button/Button";
import PaymentsReportResults from "../../components/reports/PaymentsReportResults/PaymentsReportResults";
import usePaymentsReport from "../../hooks/usePaymentsReport";

import "./PaymentsInstructor.css";

const EMPTY_FILTERS = { desde: "", hasta: "" };

function PaymentsInstructor() {
  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const [filtros, setFiltros] = useState(EMPTY_FILTERS);

  // No se envía instructor_id: el backend limita el reporte al instructor
  // autenticado.
  const { report, loading, error } = usePaymentsReport(filtros);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setDraft((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setFiltros({ ...draft });
  };

  return (
    <div className="payments-instructor">
      <header className="payments-instructor__header">
        <span className="payments-instructor__eyebrow">Instructor</span>

        <h1>Pagos recibidos</h1>

        <p>Consulta los pagos de tus clases, filtrando por fechas.</p>
      </header>

      <form className="payments-instructor__filters" onSubmit={handleSubmit}>
        <Input
          label="Desde"
          type="date"
          name="desde"
          value={draft.desde}
          max={draft.hasta || undefined}
          onChange={handleChange}
        />

        <Input
          label="Hasta"
          type="date"
          name="hasta"
          value={draft.hasta}
          min={draft.desde || undefined}
          onChange={handleChange}
        />

        <Button type="submit" disabled={loading}>
          Filtrar
        </Button>
      </form>

      <PaymentsReportResults
        report={report}
        loading={loading}
        error={error}
        showInstructor={false}
      />
    </div>
  );
}

export default PaymentsInstructor;
