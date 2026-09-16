// src/components/layout/PageHeader/PageHeader.jsx

import "./PageHeader.css";

/**
 * Encabezado de página usado al tope de las pantallas de dashboard
 * (debajo del Header, arriba del contenido). `actions` se renderiza tal
 * cual se recibe (ej. un <Button> o un grupo pequeño de ellos).
 * @param {{
 *   title: string,
 *   subtitle?: string,
 *   actions?: React.ReactNode,
 * }} props
 */
function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-header">
      <div className="page-header__text">
        <h2 className="page-header__title">{title}</h2>

        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>

      {actions && <div className="page-header__actions">{actions}</div>}
    </div>
  );
}

export default PageHeader;
