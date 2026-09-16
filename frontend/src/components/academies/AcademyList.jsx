// src/components/academies/AcademyList.jsx

import EmptyState from "../common/EmptyState/EmptyState";
import AcademyCard from "./AcademyCard";

/**
 * Lista/grid de solicitudes de academias.
 *
 * @param {Object} props
 * @param {Array} props.solicitudes - array de solicitudes (ver AcademyCard)
 * @param {(id: string|number) => void} props.onViewProfile
 * @param {string} [props.emptyMessage]
 */
function AcademyList({
  solicitudes,
  onViewProfile,
  emptyMessage = "No hay academias para mostrar.",
}) {
  if (!solicitudes || solicitudes.length === 0) {
    return <EmptyState title={emptyMessage} />;
  }

  return (
    <div className="grid-cards">
      {solicitudes.map((solicitud) => (
        <AcademyCard
          key={solicitud.id}
          solicitud={solicitud}
          onViewProfile={onViewProfile}
        />
      ))}
    </div>
  );
}

export default AcademyList;
