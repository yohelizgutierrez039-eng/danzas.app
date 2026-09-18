import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Loading from "../../components/Loading/Loading";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import api from "../../services/api";

import "./ClassForm.css";

const initialForm = {
  nombre: "",
  tipo: "",
  descripcion: "",
  ciudad: "",
  modalidad: "Presencial",
  direccion: "",
  fechaInicio: "",
  fechaFin: "",
  horario: "",
  duracion: "",
  cupos: "",
  precio: "",
  requisitos: "",
};

function ClassForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditing = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [scheduleConflict, setScheduleConflict] = useState(null);

  // Cargar la clase cuando estamos editando
  useEffect(() => {
    if (!isEditing) {
      setLoading(false);
      return;
    }

    const loadClass = async () => {
      try {
        setLoading(true);
        setError("");

        /*
         * Cuando el backend esté conectado:
         * const data = await api(`/classes/${id}`);
         * setForm({
         *   nombre: data.nombre || "",
         *   tipo: data.tipo || "",
         *   ...
         * });
         */

        // Datos de ejemplo mientras se conecta el backend
        const demoClass = {
          nombre: "Salsa Básica",
          tipo: "Salsa",
          descripcion:
            "Clase para aprender los pasos básicos de salsa y mejorar la coordinación.",
          ciudad: "Guamal",
          modalidad: "Presencial",
          direccion: "Academia Ritmo Caribe",
          fechaInicio: "2026-09-15",
          fechaFin: "2026-12-15",
          horario: "Lunes y miércoles - 5:00 PM",
          duracion: "1 hora",
          cupos: "20",
          precio: "50000",
          requisitos: "Ropa cómoda y disposición para aprender.",
        };

        setTimeout(() => {
          setForm(demoClass);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError(err.message || "No se pudo cargar la clase.");
        setLoading(false);
      }
    };

    loadClass();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setValidationError("");
    setScheduleConflict(null);
  };

  const validateForm = () => {
    if (!form.nombre.trim()) {
      return "El nombre de la clase es obligatorio.";
    }

    if (!form.tipo) {
      return "Selecciona el tipo de danza.";
    }

    if (!form.descripcion.trim()) {
      return "La descripción es obligatoria.";
    }

    if (!form.ciudad.trim()) {
      return "La ciudad es obligatoria.";
    }

    if (!form.modalidad) {
      return "Selecciona la modalidad.";
    }

    if (form.modalidad === "Presencial" && !form.direccion.trim()) {
      return "La dirección es obligatoria para las clases presenciales.";
    }

    if (!form.fechaInicio) {
      return "Selecciona la fecha de inicio.";
    }

    if (!form.fechaFin) {
      return "Selecciona la fecha de finalización.";
    }

    if (new Date(form.fechaFin) < new Date(form.fechaInicio)) {
      return "La fecha de finalización no puede ser anterior a la fecha de inicio.";
    }

    if (!form.horario.trim()) {
      return "El horario es obligatorio.";
    }

    if (!form.duracion.trim()) {
      return "La duración es obligatoria.";
    }

    if (!form.cupos || Number(form.cupos) <= 0) {
      return "La cantidad de cupos debe ser mayor que 0.";
    }

    if (form.precio === "" || Number(form.precio) < 0) {
      return "El precio no puede ser negativo.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setValidationError("");
    setScheduleConflict(null);

    const validation = validateForm();

    if (validation) {
      setValidationError(validation);
      return;
    }

    setSaving(true);

    try {
      const classData = {
        name: form.nombre.trim(),
        dance_type: form.tipo,
        description: form.descripcion.trim(),
        city: form.ciudad.trim(),
        modality: form.modalidad,
        address: form.modalidad === "Presencial" ? form.direccion.trim() : null,
        start_date: form.fechaInicio,
        end_date: form.fechaFin,
        schedule: form.horario.trim(),
        duration: form.duracion.trim(),
        capacity: Number(form.cupos),
        price: Number(form.precio),
        requirements: form.requisitos.trim(),
      };

      /*
       * Crear clase
       */
      if (!isEditing) {
        await api("/classes", {
          method: "POST",
          body: JSON.stringify(classData),
        });
      }

      /*
       * Editar clase
       */
      if (isEditing) {
        await api(`/classes/${id}`, {
          method: "PUT",
          body: JSON.stringify(classData),
        });
      }

      navigate("/instructor/clases");
    } catch (err) {
      /*
       * El backend utiliza 409 + SCHEDULE_CONFLICT
       * cuando el instructor ya tiene otra clase
       * en el mismo horario.
       */
      if (err.status === 409 && err.data?.error?.code === "SCHEDULE_CONFLICT") {
        setScheduleConflict(
          err.data.error.conflicting_class || err.data.error.class || null,
        );

        setError(
          err.data?.error?.message ||
            "Existe un conflicto con otra clase en este horario.",
        );

        return;
      }

      setError(
        err.message || "No se pudo guardar la clase. Inténtalo nuevamente.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/instructor/clases");
  };

  if (loading) {
    return (
      <div className="class-form-page">
        <Loading />
      </div>
    );
  }

  return (
    <div className="class-form-page">
      <div className="class-form-container">
        {/* Encabezado */}
        <div className="class-form-header">
          <div>
            <span className="class-form-subtitle">
              {isEditing ? "Editar clase" : "Nueva clase"}
            </span>

            <h1>
              {isEditing
                ? "Editar información de la clase"
                : "Crear una nueva clase"}
            </h1>

            <p>
              Completa la información para que los estudiantes puedan conocer y
              encontrar tu clase.
            </p>
          </div>

          <button
            type="button"
            className="class-form-back"
            onClick={handleCancel}
          >
            ← Volver
          </button>
        </div>

        {/* Error general */}
        {error && (
          <div className="class-form-error">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Conflicto de horario */}
        {scheduleConflict && (
          <div className="schedule-conflict">
            <h3>⚠️ Conflicto de horario</h3>

            <p>
              Ya existe una clase programada en un horario que se cruza con esta
              clase.
            </p>

            <div className="conflict-info">
              {scheduleConflict.name && (
                <strong>{scheduleConflict.name}</strong>
              )}

              {scheduleConflict.schedule && (
                <span>Horario: {scheduleConflict.schedule}</span>
              )}

              {scheduleConflict.city && (
                <span>Ciudad: {scheduleConflict.city}</span>
              )}
            </div>

            <p className="conflict-help">
              Cambia la fecha o el horario antes de volver a guardar.
            </p>
          </div>
        )}

        {/* Formulario */}
        <form className="class-form" onSubmit={handleSubmit}>
          {/* Información básica */}
          <section className="form-section">
            <div className="section-title">
              <h2>Información básica</h2>
              <p>Datos principales de la clase.</p>
            </div>

            <div className="form-grid">
              <div className="form-group form-group-full">
                <label htmlFor="nombre">Nombre de la clase *</label>

                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej. Salsa Básica"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tipo">Tipo de danza *</label>

                <select
                  id="tipo"
                  name="tipo"
                  value={form.tipo}
                  onChange={handleChange}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Salsa">Salsa</option>
                  <option value="Bachata">Bachata</option>
                  <option value="Merengue">Merengue</option>
                  <option value="Urbana">Danza urbana</option>
                  <option value="Folclórica">Danza folclórica</option>
                  <option value="Contemporánea">Danza contemporánea</option>
                  <option value="Ballet">Ballet</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="ciudad">Ciudad *</label>

                <input
                  id="ciudad"
                  name="ciudad"
                  type="text"
                  value={form.ciudad}
                  onChange={handleChange}
                  placeholder="Ej. Guamal"
                />
              </div>

              <div className="form-group form-group-full">
                <label htmlFor="descripcion">Descripción *</label>

                <textarea
                  id="descripcion"
                  name="descripcion"
                  rows="5"
                  value={form.descripcion}
                  onChange={handleChange}
                  placeholder="Describe de qué trata la clase..."
                />
              </div>
            </div>
          </section>

          {/* Modalidad */}
          <section className="form-section">
            <div className="section-title">
              <h2>Modalidad y ubicación</h2>
              <p>Indica cómo y dónde se realizará la clase.</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="modalidad">Modalidad *</label>

                <select
                  id="modalidad"
                  name="modalidad"
                  value={form.modalidad}
                  onChange={handleChange}
                >
                  <option value="Presencial">Presencial</option>
                  <option value="Virtual">Virtual</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="direccion">
                  Dirección
                  {form.modalidad === "Presencial" && " *"}
                </label>

                <input
                  id="direccion"
                  name="direccion"
                  type="text"
                  value={form.direccion}
                  onChange={handleChange}
                  placeholder={
                    form.modalidad === "Presencial"
                      ? "Ej. Calle 10 # 5-20"
                      : "No aplica para modalidad virtual"
                  }
                  disabled={form.modalidad === "Virtual"}
                />
              </div>
            </div>
          </section>

          {/* Fecha y horario */}
          <section className="form-section">
            <div className="section-title">
              <h2>Fecha y horario</h2>
              <p>Define cuándo se realizará la clase.</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="fechaInicio">Fecha de inicio *</label>

                <input
                  id="fechaInicio"
                  name="fechaInicio"
                  type="date"
                  value={form.fechaInicio}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="fechaFin">Fecha de finalización *</label>

                <input
                  id="fechaFin"
                  name="fechaFin"
                  type="date"
                  value={form.fechaFin}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="horario">Horario *</label>

                <input
                  id="horario"
                  name="horario"
                  type="text"
                  value={form.horario}
                  onChange={handleChange}
                  placeholder="Ej. Lunes y miércoles - 5:00 PM"
                />
              </div>

              <div className="form-group">
                <label htmlFor="duracion">Duración *</label>

                <input
                  id="duracion"
                  name="duracion"
                  type="text"
                  value={form.duracion}
                  onChange={handleChange}
                  placeholder="Ej. 1 hora"
                />
              </div>
            </div>
          </section>

          {/* Cupos y precio */}
          <section className="form-section">
            <div className="section-title">
              <h2>Cupos y precio</h2>
              <p>Configura la capacidad y el valor de la clase.</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="cupos">Número de cupos *</label>

                <input
                  id="cupos"
                  name="cupos"
                  type="number"
                  min="1"
                  value={form.cupos}
                  onChange={handleChange}
                  placeholder="Ej. 20"
                />
              </div>

              <div className="form-group">
                <label htmlFor="precio">Precio *</label>

                <div className="price-input">
                  <span>$</span>

                  <input
                    id="precio"
                    name="precio"
                    type="number"
                    min="0"
                    value={form.precio}
                    onChange={handleChange}
                    placeholder="Ej. 50000"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Requisitos */}
          <section className="form-section">
            <div className="section-title">
              <h2>Requisitos</h2>
              <p>Información adicional para los estudiantes.</p>
            </div>

            <div className="form-group">
              <label htmlFor="requisitos">Requisitos de la clase</label>

              <textarea
                id="requisitos"
                name="requisitos"
                rows="4"
                value={form.requisitos}
                onChange={handleChange}
                placeholder="Ej. Ropa cómoda, zapatos adecuados..."
              />
            </div>
          </section>

          {/* Error de validación */}
          {validationError && (
            <div className="validation-error">⚠️ {validationError}</div>
          )}

          {/* Botones */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancelar
            </button>

            <button type="submit" className="btn-save" disabled={saving}>
              {saving
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Crear clase"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClassForm;
