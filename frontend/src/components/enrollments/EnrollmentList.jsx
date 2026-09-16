// src/components/enrollments/EnrollmentList.jsx

import EmptyState from "../common/EmptyState/EmptyState";
import EnrollmentCard from "./EnrollmentCard";

/**
 * Lista de inscripciones renderizada como grilla de tarjetas.
 * @param {{
 *   inscripciones: Array<object>,
 *   onViewDetails: (id: string | number) => void,
 *   emptyMessage?: string,
 * }} props
 */
function EnrollmentList({
  inscripciones,
  onViewDetails,
  emptyMessage = "No tenés inscripciones todavía.",
}) {
  if (!inscripciones || inscripciones.length === 0) {
    return <EmptyState title={emptyMessage} />;
  }

  return (
    <div className="grid-cards">
      {inscripciones.map((inscripcion) => (
        <EnrollmentCard
          key={inscripcion.id}
          inscripcion={inscripcion}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}

export default EnrollmentList;
