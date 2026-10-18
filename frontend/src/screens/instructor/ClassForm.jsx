import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Loading from "../../components/common/Loading/Loading";
import ErrorMessage from "../../components/common/ErrorMessage/ErrorMessage";

import useClasses from "../../hooks/useClasses";
import {
  DIAS_SEMANA,
  horaAISO,
  horaDesdeISO,
} from "../../utils/formatDate";

import "./ClassForm.css";

const initialForm = {
  tipoBaile: "",
  ciudad: "",
  diaSemana: "",
  horaInicio: "",
  horaFin: "",
  cupoMaximo: "",
  precio: "",
};

/*
 * Mensajes según el código de error del backend. Para
 * ACADEMY_NOT_APPROVED se usa el mensaje del backend, que
 * distingue entre solicitud pendiente, rechazada o inexistente.
 */
const ERROR_MESSAGES = {
  SCHEDULE_CONFLICT:
    "Este horario se cruza con otra de tus clases o queda a menos de 15 minutos de una.",
  INVALID_SCHEDULE: "La hora de fin debe ser posterior a la hora de inicio.",
};

function ClassForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditing = Boolean(id);

  const { getById, create, update } = useClasses();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");

  // Cargar la clase cuando estamos editando
  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const loadClass = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getById(id);
        const horario = data?.horarios?.[0];

        setForm({
          tipoBaile: data?.tipoBaile || "",
          ciudad: data?.ciudad || "",
          diaSemana: horario ? String(horario.diaSemana) : "",
          horaInicio: horaDesdeISO(horario?.horaInicio),
          horaFin: horaDesdeISO(horario?.horaFin),
          cupoMaximo: data?.cupoMaximo != null ? String(data.cupoMaximo) : "",
          precio: data?.precio != null ? String(Number(data.precio)) : "",
        });
      } catch (err) {
        setError(err.message || "No se pudo cargar la clase.");
      } finally {
        setLoading(false);
      }
    };

    loadClass();
  }, [id, isEditing, getById]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setValidationError("");
  };

  const validateForm = () => {
    if (!form.tipoBaile.trim()) {
      return "El tipo de baile es obligatorio.";
    }

    if (!form.ciudad.trim()) {
      return "La ciudad es obligatoria.";
    }

    if (form.diaSemana === "") {
      return "Selecciona el día de la semana.";
    }

    if (!form.horaInicio) {
      return "Selecciona la hora de inicio.";
    }

    if (!form.horaFin) {
      return "Selecciona la hora de fin.";
    }

    if (form.horaFin <= form.horaInicio) {
      return "La hora de fin debe ser posterior a la hora de inicio.";
    }

    const cupoMaximo = Number(form.cupoMaximo);

    if (!Number.isInteger(cupoMaximo) || cupoMaximo <= 0) {
      return "El cupo máximo debe ser un número entero mayor que 0.";
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

    const validation = validateForm();

    if (validation) {
      setValidationError(validation);
      return;
    }

    setSaving(true);

    try {
      const classData = {
        tipoBaile: form.tipoBaile.trim(),
        ciudad: form.ciudad.trim(),
        // Al editar no se envía la modalidad para conservar la que ya tiene la clase.
        ...(!isEditing && { modalidad: "presencial" }),
        cupoMaximo: Number(form.cupoMaximo),
        precio: Number(form.precio),
        diaSemana: Number(form.diaSemana),
        horaInicio: horaAISO(form.horaInicio),
        horaFin: horaAISO(form.horaFin),
      };

      if (isEditing) {
        await update(id, classData);
      } else {
        await create(classData);
      }

      navigate("/instructor/clases");
    } catch (err) {
      const code = err?.data?.error?.code;

      setError(
        ERROR_MESSAGES[code] ||
          err?.message ||
          "No se pudo guardar la clase. Inténtalo nuevamente.",
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
              Completa la información para que los estudiantes puedan conocer
              y encontrar tu clase.
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

        {/* Formulario */}
        <form className="class-form" onSubmit={handleSubmit}>
          {/* Información básica */}
          <section className="form-section">
            <div className="section-title">
              <h2>Información básica</h2>
              <p>Datos principales de la clase. Las clases son presenciales.</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="tipoBaile">Tipo de baile *</label>

                <input
                  id="tipoBaile"
                  name="tipoBaile"
                  type="text"
                  value={form.tipoBaile}
                  onChange={handleChange}
                  placeholder="Ej. Salsa"
                />
              </div>

              <div className="form-group">
                <label htmlFor="ciudad">Ciudad *</label>

                <input
                  id="ciudad"
                  name="ciudad"
                  type="text"
                  value={form.ciudad}
                  onChange={handleChange}
                  placeholder="Ej. Barranquilla"
                />
              </div>
            </div>
          </section>

          {/* Horario */}
          <section className="form-section">
            <div className="section-title">
              <h2>Horario</h2>
              <p>Define el día y la hora en que se realizará la clase.</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="diaSemana">Día de la semana *</label>

                <select
                  id="diaSemana"
                  name="diaSemana"
                  value={form.diaSemana}
                  onChange={handleChange}
                >
                  <option value="">Selecciona un día</option>

                  {DIAS_SEMANA.map((dia, index) => (
                    <option key={dia} value={index}>
                      {dia}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="horaInicio">Hora de inicio *</label>

                <input
                  id="horaInicio"
                  name="horaInicio"
                  type="time"
                  value={form.horaInicio}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="horaFin">Hora de fin *</label>

                <input
                  id="horaFin"
                  name="horaFin"
                  type="time"
                  value={form.horaFin}
                  onChange={handleChange}
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
                <label htmlFor="cupoMaximo">Cupo máximo *</label>

                <input
                  id="cupoMaximo"
                  name="cupoMaximo"
                  type="number"
                  min="1"
                  value={form.cupoMaximo}
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
