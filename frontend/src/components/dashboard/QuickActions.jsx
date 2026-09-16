// src/components/dashboard/QuickActions.jsx

import "./QuickActions.css";

/**
 * Lista vertical de acciones rápidas para dashboards.
 *
 * @param {Object} props
 * @param {Array} props.actions - [{ id, label, icon, onClick }]
 */
function QuickActions({ actions = [] }) {
  return (
    <div className="quick-actions">
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          className="quick-actions__item"
          onClick={action.onClick}
        >
          <span className="quick-actions__icon">{action.icon}</span>
          <span className="quick-actions__label">{action.label}</span>
        </button>
      ))}
    </div>
  );
}

export default QuickActions;
