import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Loading from "../../../components/Loading/Loading";
import ErrorMessage from "../../../components/ErrorMessage/ErrorMessage";
import api from "../../../services/api";

import "./UserForm.css";

function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    rol: "estudiante",
    ciudad: "",
    estado: "activo",
    telefono: "",
  });

  useEffect(() => {
    if (!isEditing) {
      setLoading(false);
      return;
    }

    const loadUser = async () => {
      try {
        setLoading(true);
        setError("");

        /*
         * Backend:
         * const data = await api(`/users/${id}`);
         *
         * Cuando el backend esté disponible, reemplazar los datos
         * de demostración por la llamada anterior.
         */

        const demoUsers = {
          1: {
            id: 1,
            nombre: "María González",
            correo: "maria@email.com",
            rol: "estudiante",
            ciudad: "Guamal",
            estado: "activo",
            telefono: "3001234567",
          },
          2: {
            id: 2,
            nombre: "Carlos Rodríguez",
            correo: "carlos@email.com",
            rol: "instructor",
            ciudad: "Guamal",
            estado: "activo",
            telefono: "3019876543",
          },
          3: {
            id: 3,
            nombre: "Laura Martínez",
            correo: "laura@email.com",
            rol: "padre",
            ciudad: "Santa Marta",
            estado: "activo",
            telefono: "3025551234",
          },
          4: {
            id: 4,
            nombre: "Andrés Pérez",
            correo: "andres@email.com",
            rol: "estudiante",
            ciudad: "Ciénaga",
            estado: "inactivo",
            telefono: "3034445566",
          },
        };

        const user = demoUsers[id];

        if (!user) {
          setError("No se encontró el usuario solicitado.");
          return;
        }

        setFormData({
          nombre: user.nombre || "",
          correo: user.correo || "",
          rol: user.rol || "estudiante",
          ciudad: user.ciudad || "",
          estado: user.estado || "activo",
          telefono: user.telefono || "",
        });
      } catch (err) {
        setError(
          err.message || "No se pudo cargar la información del usuario.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id, isEditing]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      return "El nombre es obligatorio.";
    }

    if (!formData.correo.trim()) {
      return "El correo electrónico es obligatorio.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.correo)) {
      return "Ingresa un correo electrónico válido.";
    }

    if (!formData.rol) {
      return "Debes seleccionar un rol.";
    }

    if (!formData.ciudad.trim()) {
      return "La ciudad es obligatoria.";
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

    try {
      setSaving(true);
      setError("");

      /*
       * Cuando el backend tenga estos endpoints:
       *
       * Crear:
       * POST /users
       *
       * Editar:
       * PUT /users/:id
       */

      /*
      const response = isEditing
        ? await api(`/users/${id}`, {
            method: "PUT",
            body: JSON.stringify(formData),
          })
        : await api("/users", {
            method: "POST",
            body: JSON.stringify(formData),
          });
      */

      // Simulación temporal mientras se conecta el backend.
      await new Promise((resolve) => setTimeout(resolve, 700));

      navigate("/admin/usuarios");
    } catch (err) {
      setError(
        err.message ||
          `No se pudo ${isEditing ? "actualizar" : "crear"} el usuario.`,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/usuarios");
  };

  if (loading) {
    return (
      <div className="user-form-page">
        <Loading />
      </div>
    );
  }

  return (
    <div className="user-form-page">
      <div className="user-form-container">
        <div className="user-form-header">
          <div>
            <span className="user-form-subtitle">
              Administración de usuarios
            </span>

            <h1>{isEditing ? "Editar usuario" : "Nuevo usuario"}</h1>

            <p>
              {isEditing
                ? "Actualiza la información del usuario seleccionado."
                : "Registra un nuevo usuario en Danzas.app."}
            </p>
          </div>

          <button type="button" className="back-button" onClick={handleCancel}>
            ← Volver
          </button>
        </div>

        {error && (
          <div className="user-form-error">
            <ErrorMessage message={error} />
          </div>
        )}

        <form className="user-form" onSubmit={handleSubmit}>
          <section className="form-section">
            <div className="form-section-header">
              <h2>Información personal</h2>
              <p>Completa los datos básicos del usuario.</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="nombre">
                  Nombre completo <span>*</span>
                </label>

                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej. María González"
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label htmlFor="correo">
                  Correo electrónico <span>*</span>
                </label>

                <input
                  id="correo"
                  name="correo"
                  type="email"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="Ej. usuario@email.com"
                  maxLength={120}
                />
              </div>

              <div className="form-group">
                <label htmlFor="telefono">Teléfono</label>

                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Ej. 3001234567"
                  maxLength={20}
                />
              </div>

              <div className="form-group">
                <label htmlFor="ciudad">
                  Ciudad <span>*</span>
                </label>

                <input
                  id="ciudad"
                  name="ciudad"
                  type="text"
                  value={formData.ciudad}
                  onChange={handleChange}
                  placeholder="Ej. Guamal"
                  maxLength={80}
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <div className="form-section-header">
              <h2>Configuración de la cuenta</h2>
              <p>Define el rol y estado del usuario.</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="rol">
                  Rol <span>*</span>
                </label>

                <select
                  id="rol"
                  name="rol"
                  value={formData.rol}
                  onChange={handleChange}
                >
                  <option value="estudiante">Estudiante</option>
                  <option value="padre">Padre de familia</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="estado">Estado</label>

                <select
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>
          </section>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancelar
            </button>

            <button type="submit" className="save-button" disabled={saving}>
              {saving
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserForm;
