// src/components/dashboard/DashboardChart.jsx

import "./DashboardChart.css";

/**
 * Gráfico de barras horizontal simple hecho con divs (no hay librería de
 * charting instalada en el proyecto).
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {Array} props.data - [{ label, value }]
 */
function DashboardChart({ title, data = [] }) {
  const maxValue = Math.max(...data.map((d) => d.value), 0);

  return (
    <div className="dashboard-chart">
      {title && <h3 className="dashboard-chart__title">{title}</h3>}

      <div className="dashboard-chart__rows">
        {data.map((point, index) => {
          const porcentaje = maxValue > 0 ? (point.value / maxValue) * 100 : 0;

          return (
            <div key={index} className="dashboard-chart__row">
              <span className="dashboard-chart__label">{point.label}</span>

              <div className="dashboard-chart__track">
                <div
                  className="dashboard-chart__bar"
                  style={{ width: `${porcentaje}%` }}
                />
              </div>

              <span className="dashboard-chart__value">{point.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DashboardChart;
