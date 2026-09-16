// src/components/dashboard/StatCard.jsx

import "./StatCard.css";

function trendClass(trend) {
  if (!trend) return "";
  if (trend.startsWith("+")) return "stat-card__trend--up";
  if (trend.startsWith("-")) return "stat-card__trend--down";
  return "stat-card__trend--neutral";
}

/**
 * Tile pequeño de estadística para dashboards (admin/instructor).
 *
 * @param {Object} props
 * @param {React.ReactNode} props.icon
 * @param {string} props.label
 * @param {string|number} props.value
 * @param {string} [props.trend] - ej. "+12%" / "-4%"
 */
function StatCard({ icon, label, value, trend }) {
  return (
    <div className="stat-card">
      <div className="stat-card__icon">{icon}</div>

      <div className="stat-card__body">
        <span className="stat-card__value">{value}</span>
        <span className="stat-card__label">{label}</span>
      </div>

      {trend && (
        <span className={`stat-card__trend ${trendClass(trend)}`}>
          {trend}
        </span>
      )}
    </div>
  );
}

export default StatCard;
