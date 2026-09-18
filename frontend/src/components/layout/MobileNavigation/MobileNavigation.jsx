// src/components/layout/MobileNavigation/MobileNavigation.jsx

import { Link } from "react-router-dom";

import "./MobileNavigation.css";

/**
 * Barra de navegación inferior fija, visible solo en mobile. Complementa
 * al Sidebar (que en mobile colapsa a solo íconos) con accesos rápidos
 * de una sola mano.
 * @param {{
 *   items: Array<{ id: string | number, label: string, icon: string, to: string }>,
 *   activeItem: string | number,
 * }} props
 */
function MobileNavigation({ items, activeItem }) {
  return (
    <nav className="mobile-navigation">
      {items.map((item) => {
        const isActive = item.id === activeItem;

        const linkClasses = [
          "mobile-navigation__item",
          isActive ? "mobile-navigation__item--active" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <Link key={item.id} to={item.to} className={linkClasses}>
            <span className="mobile-navigation__icon">{item.icon}</span>
            <span className="mobile-navigation__label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default MobileNavigation;
