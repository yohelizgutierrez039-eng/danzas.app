import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/Loading/Loading";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import EmptyState from "../../components/EmptyState/EmptyState";
import api from "../../services/api";
import "./MyEnrollmentsParent.css";

function MyEnrollmentsParent() {
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState([]);
  const [selectedChild, setSelectedChild] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEnrollments = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await api("/users/me/enrollments");

        setEnrollments(Array.isArray(data) ? data : data?.enrollments || []);
      } catch (err) {
        setError(err.message || "No fue posible cargar las inscripciones.");
      } finally {
        setLoading(false);
      }
    };

    loadEnrollments();
  }, []);

  const children = useMemo(() => {
    const uniqueChildren = new Map();

    enrollments.forEach((enrollment) => {
      const childId = enrollment.dependent_id || enrollment.menor_id;

      const childName =
        enrollment.dependent_name ||
        enrollment.menor_name ||
        enrollment.child_name ||
        "Hijo/a";

      if (childId && !uniqueChildren.has(childId)) {
        uniqueChildren.set(childId, {
          id: childId,
          name: childName,
          age:
            enrollment.dependent_age ||
            enrollment.menor_age ||
            enrollment.child_age,
        });
      }
    });

    return Array.from(uniqueChildren.values());
  }, [enrollments]);

  const filteredEnrollments = useMemo(() => {
    if (selectedChild === "all") {
      return enrollments;
    }

    return enrollments.filter((enrollment) => {
      const childId = enrollment.dependent_id || enrollment.menor_id;

      return String(childId) === String(selectedChild);
    });
  }, [enrollments, selectedChild]);

  const getStatusLabel = (status) => {
    const statuses = {
      active: "Activa",
      pending: "Pendiente",
      cancelled: "Cancelada",
      completed: "Finalizada",
    };

    return statuses[status] || status || "Sin estado";
  };

  const getPaymentLabel = (status) => {
    const statuses = {
      paid: "Pagado",
      pending: "Pendiente",
      failed: "Fallido",
    };

    return statuses[status] || status || "Sin información";
  };

  const getClassId = (enrollment) => {
    return enrollment.class_id || enrollment.clase_id;
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) {
      return "No disponible";
    }

    return `$${Number(price).toLocaleString("es-CO")}`;
  };

  if (loading) {
    return (
      <div className="my-enrollments-parent-loading">
        <Loading text="Cargando inscripciones..." />
      </div>
    );
  }

  return (
    <div className="my-enrollments-parent">
      <header className="my-enrollments-parent-header">
        <div>
          <span className="parent-enrollments-eyebrow">PADRE DE FAMILIA</span>

          <h1>Inscripciones de mis hijos</h1>

          <p>
            Consulta las clases en las que están inscritos tus hijos y revisa el
            estado de sus inscripciones y pagos.
          </p>
        </div>

        <button
          type="button"
          className="parent-explore-button"
          onClick={() => navigate("/padre/clases")}
        >
          + Inscribir en una clase
        </button>
      </header>

      {error && (
        <ErrorMessage
          title="Error al cargar las inscripciones"
          message={error}
          onClose={() => setError("")}
        />
      )}

      {enrollments.length > 0 && (
        <section className="parent-enrollments-filter">
          <div>
            <h2>Filtrar por hijo/a</h2>

            <p>Selecciona de quién quieres consultar las inscripciones.</p>
          </div>

          <select
            value={selectedChild}
            onChange={(event) => setSelectedChild(event.target.value)}
          >
            <option value="all">Todos mis hijos</option>

            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name}
                {child.age ? ` (${child.age} años)` : ""}
              </option>
            ))}
          </select>
        </section>
      )}

      {filteredEnrollments.length === 0 ? (
        <EmptyState
          title="No hay inscripciones"
          message={
            selectedChild === "all"
              ? "Todavía no tienes hijos inscritos en ninguna clase."
              : "Este hijo/a no tiene inscripciones registradas."
          }
          action={
            <button type="button" onClick={() => navigate("/padre/clases")}>
              Explorar clases
            </button>
          }
        />
      ) : (
        <>
          <section className="parent-enrollments-summary">
            <div className="summary-card">
              <span>Inscripciones</span>
              <strong>{filteredEnrollments.length}</strong>
            </div>

            <div className="summary-card">
              <span>Activas</span>
              <strong>
                {
                  filteredEnrollments.filter((item) => item.status === "active")
                    .length
                }
              </strong>
            </div>

            <div className="summary-card">
              <span>Pagos pendientes</span>
              <strong>
                {
                  filteredEnrollments.filter(
                    (item) => item.payment_status === "pending",
                  ).length
                }
              </strong>
            </div>
          </section>

          <section className="parent-enrollments-list">
            {filteredEnrollments.map((enrollment) => {
              const childName =
                enrollment.dependent_name ||
                enrollment.menor_name ||
                enrollment.child_name ||
                "Hijo/a";

              const childAge =
                enrollment.dependent_age ||
                enrollment.menor_age ||
                enrollment.child_age;

              const classId = getClassId(enrollment);

              return (
                <article
                  className="parent-enrollment-card"
                  key={
                    enrollment.id ||
                    enrollment.enrollment_id ||
                    `${classId}-${enrollment.dependent_id}`
                  }
                >
                  <div className="parent-enrollment-header">
                    <div className="dependent-info">
                      <div className="dependent-avatar">
                        {childName.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <span>Inscripción de</span>

                        <h2>{childName}</h2>

                        {childAge && <p>{childAge} años</p>}
                      </div>
                    </div>

                    <span
                      className={`parent-enrollment-status status-${
                        enrollment.status || "pending"
                      }`}
                    >
                      {getStatusLabel(enrollment.status)}
                    </span>
                  </div>

                  <div className="parent-enrollment-class">
                    <div className="class-title">
                      <span>
                        {enrollment.dance_type ||
                          enrollment.tipo_danza ||
                          "Danza"}
                      </span>

                      <h3>
                        {enrollment.class_name ||
                          enrollment.nombre_clase ||
                          "Clase de danza"}
                      </h3>

                      <p>
                        🏫{" "}
                        {enrollment.academy ||
                          enrollment.academia ||
                          "Academia no disponible"}
                      </p>
                    </div>

                    <div className="parent-class-details">
                      <div>
                        <span>Instructor</span>
                        <strong>
                          {enrollment.instructor || "No disponible"}
                        </strong>
                      </div>

                      <div>
                        <span>Horario</span>
                        <strong>
                          {enrollment.schedule || "No disponible"}
                        </strong>
                      </div>

                      <div>
                        <span>Modalidad</span>
                        <strong>
                          {enrollment.modality || "No disponible"}
                        </strong>
                      </div>

                      <div>
                        <span>Ciudad</span>
                        <strong>{enrollment.city || "No disponible"}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="parent-enrollment-footer">
                    <div className="parent-price">
                      <span>Mensualidad</span>

                      <strong>
                        {formatPrice(enrollment.price || enrollment.precio)}
                      </strong>
                    </div>

                    <div
                      className={`parent-payment payment-${
                        enrollment.payment_status || "pending"
                      }`}
                    >
                      <span>Estado del pago</span>

                      <strong>
                        {getPaymentLabel(enrollment.payment_status)}
                      </strong>
                    </div>

                    {classId && (
                      <button
                        type="button"
                        className="parent-view-button"
                        onClick={() => navigate(`/clases/${classId}`)}
                      >
                        Ver clase
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
}

export default MyEnrollmentsParent;
