import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Loading from "../../components/common/Loading/Loading";
import ErrorMessage from "../../components/common/ErrorMessage/ErrorMessage";
import useClasses from "../../hooks/useClasses";

import { DIAS_SEMANA, horaAISO, horaDesdeISO } from "../../utils/formatDate";

import "./ClassForm.css";

const INITIAL_FORM = {
  tipoBaile: "",
  ciudad: "",
  diaSemana: "1",
  inicio: "",
  fin: "",
  cupoMaximo: "",
  precio: "",
};

const obtenerError = (err) => {
  const status = err?.status ?? err?.response?.status;
  const data = err?.data ?? err?.response?.data;
  const code = data?.code ?? data?.error ?? err?.code;

  if (status === 409 && code === "SCHEDULE_CONFLICT") {
    return "El horario se cruza con otra clase o queda a menos de 15 minutos de ella. Elige otro horario.";
  }

  if (status === 400 && code === "INVALID_SCHEDULE") {
    return "La hora de fin debe ser posterior a la hora de inicio.";
  }

  if (status === 403 && code === "ACADEMY_NOT_APPROVED") {
    return "Tu solicitud de academia todavía no ha sido aprobada. No puedes publicar clases por ahora.";
  }

  return (
    data?.message ||
    err?.message ||
    "No se pudo guardar la clase. Inténtalo nuevamente."
  );
};

function ClassForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById, create, update } = useClasses();

  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    let activo = true;

    const cargarClase = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getById(id);
        const clase = response?.data ?? response;
        const horario = clase?.horarios?.[0];

        if (!activo) return;

        setForm({
          tipoBaile: clase?.tipoBaile ?? "",
          ciudad: clase?.ciudad ?? "",
          diaSemana:
            horario?.diaSemana !== undefined
              ? String(
                  typeof horario.diaSemana === "number"
                    ? horario.diaSemana
                    : DIAS_SEMANA.findIndex(
                        (dia) =>
                          dia.toLowerCase() ===
                          String(horario.diaSemana).toLowerCase(),
                      ),
                )
              : "1",
          inicio: horaDesdeISO(horario?.horaInicio) || "",
          fin: horaDesdeISO(horario?.horaFin) || "",
          cupoMaximo: String(clase?.cupoMaximo ?? ""),
          precio: String(clase?.precio ?? ""),
        });

        if (
          horario?.diaSemana !== undefined &&
          !DIAS_SEMANA.some(
            (dia) =>
              dia.toLowerCase() === String(horario.diaSemana).toLowerCase(),
          ) &&
          !Number.isInteger(horario.diaSemana)
        ) {
          setForm((prev) => ({ ...prev, diaSemana: "1" }));
        }
      } catch (err) {
        if (activo) {
          setError(
            err?.message || "No se pudo cargar la información de la clase.",
          );
        }
      } finally {
        if (activo) setLoading(false);
      }
    };

    cargarClase();

    return () => {
      activo = false;
    };
  }, [id, getById]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.fin <= form.inicio) {
      setError("La hora de fin debe ser posterior a la hora de inicio.");
      return;
    }

    const payload = {
      tipoBaile: form.tipoBaile.trim(),
      ciudad: form.ciudad.trim(),
      modalidad: "presencial",
      cupoMaximo: Number(form.cupoMaximo),
      precio: Number(form.precio),
      diaSemana: Number(form.diaSemana),
      horaInicio: horaAISO(form.inicio),
      horaFin: horaAISO(form.fin),
    };

    try {
      setSaving(true);

      if (id) {
        await update(id, payload);
      } else {
        await create(payload);
      }

      navigate("/instructor/clases");
    } catch (err) {
      setError(obtenerError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading text="Cargando información de la clase..." />;
  }

  return (
    <div className="class-form-page">
      <div className="class-form-container">
        <h1>{id ? "Editar clase" : "Crear nueva clase"}</h1>

        <p>Completa los datos de tu clase presencial y define el horario.</p>

        {error && (
          <div className="class-form-error" role="alert">
            <ErrorMessage message={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="class-form">
          <div className="class-form-group">
            <label htmlFor="tipoBaile">Tipo de baile</label>
            <input
              id="tipoBaile"
              name="tipoBaile"
              type="text"
              value={form.tipoBaile}
              onChange={handleChange}
              maxLength={80}
              required
            />
          </div>

          <div className="class-form-group">
            <label htmlFor="ciudad">Ciudad</label>
            <input
              id="ciudad"
              name="ciudad"
              type="text"
              value={form.ciudad}
              onChange={handleChange}
              maxLength={100}
              required
            />
          </div>

          <div className="class-form-group">
            <label htmlFor="modalidad">Modalidad</label>
            <input
              id="modalidad"
              name="modalidad"
              type="text"
              value="Presencial"
              disabled
            />
          </div>

          <div className="class-form-group">
            <label htmlFor="diaSemana">Día de la semana</label>
            <select
              id="diaSemana"
              name="diaSemana"
              value={form.diaSemana}
              onChange={handleChange}
              required
            >
              {DIAS_SEMANA.map((dia, index) => (
                <option key={dia} value={index}>
                  {dia}
                </option>
              ))}
            </select>
          </div>

          <div className="class-form-row">
            <div className="class-form-group">
              <label htmlFor="inicio">Hora de inicio</label>
              <input
                id="inicio"
                name="inicio"
                type="time"
                value={form.inicio}
                onChange={handleChange}
                required
              />
            </div>

            <div className="class-form-group">
              <label htmlFor="fin">Hora de fin</label>
              <input
                id="fin"
                name="fin"
                type="time"
                value={form.fin}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="class-form-group">
            <label htmlFor="cupoMaximo">Cupo máximo de estudiantes</label>
            <input
              id="cupoMaximo"
              name="cupoMaximo"
              type="number"
              min="1"
              step="1"
              value={form.cupoMaximo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="class-form-group">
            <label htmlFor="precio">Precio en pesos colombianos (COP)</label>
            <input
              id="precio"
              name="precio"
              type="number"
              min="0"
              step="1"
              value={form.precio}
              onChange={handleChange}
              required
            />
          </div>

          <div className="class-form-actions">
            <button
              type="button"
              className="class-form-cancel"
              onClick={() => navigate("/instructor/clases")}
              disabled={saving}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="class-form-submit"
              disabled={saving}
            >
              {saving
                ? "Guardando..."
                : id
                  ? "Guardar cambios"
                  : "Publicar clase"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClassForm;
