import { useNavigate } from "react-router-dom";
import EmptyState from "../EmptyState/EmptyState";
import "./SectionComingSoon.css";

/*
  Pantalla provisoria para las secciones del menú lateral que todavía no
  tienen su módulo construido. Cuando una sección se implemente, se quita de
  frontend/src/routes/comingSoonSections.js y se registra su ruta real en
  AppRouter.jsx.
*/
function SectionComingSoon({ area, title, description, backTo }) {
  const navigate = useNavigate();

  return (
    <div className="section-coming-soon">
      <div className="section-coming-soon-header">
        {area && <span className="section-coming-soon-subtitle">{area}</span>}
        <h1>{title}</h1>
      </div>

      <EmptyState
        icon="◷"
        title="Próximamente"
        description={description}
        actionText="Volver al panel"
        onAction={() => navigate(backTo)}
      />
    </div>
  );
}

export default SectionComingSoon;
