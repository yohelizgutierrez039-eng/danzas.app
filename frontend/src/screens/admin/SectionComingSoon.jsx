import { useNavigate } from "react-router-dom";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import "./SectionComingSoon.css";

/*
  Pantalla provisoria para las secciones del menú del administrador que
  todavía no tienen su módulo construido. Cuando una sección se implemente,
  se reemplaza su <Route> en AppRouter.jsx por la pantalla real.
*/
function SectionComingSoon({ title, description }) {
  const navigate = useNavigate();

  return (
    <div className="section-coming-soon">
      <div className="section-coming-soon-header">
        <span className="section-coming-soon-subtitle">Administración</span>
        <h1>{title}</h1>
      </div>

      <EmptyState
        icon="◷"
        title="Próximamente"
        description={description}
        actionText="Volver al panel"
        onAction={() => navigate("/admin")}
      />
    </div>
  );
}

export default SectionComingSoon;
