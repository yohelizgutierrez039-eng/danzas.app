// src/screens/parent/Dependents.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Loading from "../../components/common/Loading/Loading";
import ErrorMessage from "../../components/common/ErrorMessage/ErrorMessage";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import Button from "../../components/common/Button/Button";
import { getDependents } from "../../services/users.service";

import "./Dependents.css";

function Dependents() {
  const navigate = useNavigate();

  const [dependents, setDependents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDependents = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getDependents();

        const result = Array.isArray(data)
          ? data
          : data?.dependents || data?.data || [];

        setDependents(result);
      } catch (err) {
        setError(err.message || "No se pudieron cargar los menores.");
      } finally {
        setLoading(false);
      }
    };

    loadDependents();
  }, []);

  const formatDate = (rawDate) => {
    if (!rawDate) {
      return "Sin fecha registrada";
    }

    try {
      return new Date(rawDate).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Sin fecha registrada";
    }
  };

  const handleRegisterDependent = () => {
    navigate("/padre/menores/nuevo");
  };

  if (loading) {
    return (
      <div className="dependents-page">
        <Loading text="Cargando menores..." />
      </div>
    );
  }

  return (
    <div className="dependents-page">
      <div className="dependents-container">
        <div className="dependents-header">
          <div>
            <span className="dependents-subtitle">Padre de familia</span>

            <h1>Mis menores</h1>

            <p>Consulta y administra los menores registrados a tu cargo.</p>
          </div>

          <Button variant="primary" onClick={handleRegisterDependent}>
            Registrar menor
          </Button>
        </div>

        {error && (
          <div className="dependents-error">
            <ErrorMessage message={error} onClose={() => setError("")} />
          </div>
        )}

        {dependents.length === 0 ? (
          <EmptyState
            title="No tienes menores registrados"
            description="Registra a tus hijos para poder inscribirlos en clases."
            actionText="Registrar menor"
            onAction={handleRegisterDependent}
          />
        ) : (
          <section className="dependents-list">
            {dependents.map((menor) => (
              <article className="dependent-card" key={menor.id}>
                <div className="dependent-avatar">
                  {menor.nombre ? menor.nombre[0].toUpperCase() : "?"}
                </div>

                <div className="dependent-info">
                  <strong>{menor.nombre}</strong>

                  <span>
                    Fecha de nacimiento:{" "}
                    {formatDate(menor.fechaNacimiento || menor.fecha_nacimiento)}
                  </span>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

export default Dependents;
