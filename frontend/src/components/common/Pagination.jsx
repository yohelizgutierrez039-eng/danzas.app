// src/components/common/Pagination.jsx

import {
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import "./Pagination.css";

function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  siblingCount = 1,
  showPreviousNext = true,
  className = "",
}) {
  if (totalPages <= 1) {
    return null;
  }

  function goToPage(page) {
    if (
      page < 1 ||
      page > totalPages ||
      page === currentPage
    ) {
      return;
    }

    onPageChange?.(page);
  }

  function createPageRange() {
    const pages = [];

    const startPage = Math.max(
      2,
      currentPage - siblingCount
    );

    const endPage = Math.min(
      totalPages - 1,
      currentPage + siblingCount
    );

    pages.push(1);

    if (startPage > 2) {
      pages.push("start-ellipsis");
    }

    for (
      let page = startPage;
      page <= endPage;
      page++
    ) {
      pages.push(page);
    }

    if (endPage < totalPages - 1) {
      pages.push("end-ellipsis");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  }

  const pages = createPageRange();

  return (
    <nav
      className={`
        pagination
        ${className}
      `}
      aria-label="Paginación"
    >
      {showPreviousNext && (
        <button
          type="button"
          className="
            pagination__button
            pagination__button--navigation
          "
          onClick={() =>
            goToPage(currentPage - 1)
          }
          disabled={currentPage === 1}
          aria-label="Página anterior"
        >
          <FiChevronLeft />

          <span className="pagination__navigation-text">
            Anterior
          </span>
        </button>
      )}

      <div className="pagination__pages">

        {pages.map((page) => {

          if (
            page === "start-ellipsis" ||
            page === "end-ellipsis"
          ) {
            return (
              <span
                key={page}
                className="pagination__ellipsis"
                aria-hidden="true"
              >
                ...
              </span>
            );
          }

          const isActive =
            page === currentPage;

          return (
            <button
              key={page}
              type="button"
              className={`
                pagination__button
                pagination__button--page
                ${
                  isActive
                    ? "pagination__button--active"
                    : ""
                }
              `}
              onClick={() =>
                goToPage(page)
              }
              aria-label={`Ir a la página ${page}`}
              aria-current={
                isActive
                  ? "page"
                  : undefined
              }
            >
              {page}
            </button>
          );
        })}

      </div>

      {showPreviousNext && (
        <button
          type="button"
          className="
            pagination__button
            pagination__button--navigation
          "
          onClick={() =>
            goToPage(currentPage + 1)
          }
          disabled={
            currentPage === totalPages
          }
          aria-label="Página siguiente"
        >
          <span className="pagination__navigation-text">
            Siguiente
          </span>

          <FiChevronRight />
        </button>
      )}
    </nav>
  );
}

export default Pagination;