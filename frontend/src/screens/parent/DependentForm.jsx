// src/screens/parent/DependentForm.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import ErrorMessage from "../../components/common/ErrorMessage/ErrorMessage";
import Input from "../../components/common/Input/Input";
import useAuth from "../../hooks/useAuth";
import { createDependent } from "../../services/users.service";

import "./DependentForm.css";

function DependentForm() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    fechaNacimiento: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      return "El nombre del menor es obligatorio.";
    }

    if (!formData.fechaNacimiento) {
      return "La fecha de nacimiento es obligatoria.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    /*
     * El backend obtiene el padreId del token de autenticación
     * (req.user.id en dependent.controller.js), no de la petición.
     * `user` de useAuth() se usa solo para confirmar la sesión activa.
     */
    if (!user) {
      setError("Debes iniciar sesión para registrar un menor.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await createDependent({
        nombre: formData.nombre.trim(),
        fechaNacimiento: formData.fechaNacimiento,
      });

      navigate("/padre/menores");
    } catch (err) {
      setError(
        err.message || "No fue posible registrar al menor. Intenta de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/padre/menores");
  };

  return (
    <div className="dependent-form-page">
      <div className="dependent-form-container">
        <div className="dependent-form-header">
          <div>
            <span className="dependent-form-subtitle">Padre de familia</span>

            <h1>Registrar menor</h1>

            <p>Completa los datos del menor que quieres registrar.</p>
          </div>

          <button
            type="button"
            className="back-button"
            onClick={handleCancel}
          >
            ← Volver
          </button>
        </div>

        {error && (
          <div className="dependent-form-error">
            <ErrorMessage message={error} onClose={() => setError("")} />
          </div>
        )}

        <form className="dependent-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <Input
              label="Nombre completo"
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej. Sofía Ramírez"
              maxLength={100}
              required
            />

            <Input
              label="Fecha de nacimiento"
              name="fechaNacimiento"
              type="date"
              value={formData.fechaNacimiento}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancelar
            </button>

            <button type="submit" className="save-button" disabled={submitting}>
              {submitting ? "Guardando..." : "Registrar menor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DependentForm;
