// src/screens/admin/reports/ReportsAdmin.jsx

import { useEffect, useState } from "react";

import Input from "../../../components/common/Input/Input";
import Select from "../../../components/common/Select/Select";
import Button from "../../../components/common/Button/Button";
import ErrorMessage from "../../../components/common/ErrorMessage/ErrorMessage";
import PaymentsReportResults from "../../../components/reports/PaymentsReportResults/PaymentsReportResults";
import usePaymentsReport from "../../../hooks/usePaymentsReport";
import { getUsers } from "../../../services/users.service";

import "./ReportsAdmin.css";

const EMPTY_FILTERS = {
  desde: "",
  hasta: "",
  instructorId: "",
  academia: "",
};

function ReportsAdmin() {
  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const [filtros, setFiltros] = useState(EMPTY_FILTERS);
  const [instructors, setInstructors] = useState([]);
  const [instructorsError, setInstructorsError] = useState(false);

  const { report, loading, error } = usePaymentsReport(filtros);

  useEffect(() => {
    const loadInstructors = async () => {
      try {
        const data = await getUsers();

        setInstructors(
          (data.users ?? []).filter((user) => user.rol === "instructor"),
        );
      } catch {
        setInstructorsError(true);
      }
    };

    loadInstructors();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setDraft((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setFiltros({ ...draft });
  };

  return (
    <div className="reports-admin">
      <header className="reports-admin__header">
        <span className="reports-admin__eyebrow">Administración</span>

        <h1>Reporte de pagos</h1>

        <p>
          Consulta los pagos recibidos y los reembolsos, filtrando por fechas,
          instructor o academia.
        </p>
      </header>

      <form className="reports-admin__filters" onSubmit={handleSubmit}>
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

        <Select
          label="Instructor"
          name="instructorId"
          value={draft.instructorId}
          onChange={handleChange}
          placeholder="Todos los instructores"
          options={instructors.map((instructor) => ({
            value: instructor.id,
            label: instructor.nombre,
          }))}
        />

        <Input
          label="Academia"
          name="academia"
          value={draft.academia}
          placeholder="Nombre de la academia"
          onChange={handleChange}
        />

        <Button type="submit" disabled={loading}>
          Generar reporte
        </Button>
      </form>

      {instructorsError && (
        <ErrorMessage
          type="warning"
          title="Lista de instructores no disponible"
          message="No se pudo cargar la lista de instructores; el filtro por instructor no está disponible."
          onClose={() => setInstructorsError(false)}
        />
      )}

      <PaymentsReportResults report={report} loading={loading} error={error} />
    </div>
  );
}

export default ReportsAdmin;
