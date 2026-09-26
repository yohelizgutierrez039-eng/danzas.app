// src/screens/admin/Users/UserForm.jsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Loading from "../../../components/common/Loading/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage/ErrorMessage";
import Input from "../../../components/common/Input/Input";
import Select from "../../../components/common/Select/Select";
import { getUserById } from "../../../services/users.service";

import "./UserForm.css";

const ROLE_OPTIONS = [
  { value: "estudiante", label: "Estudiante" },
  { value: "padre", label: "Padre de familia" },
  { value: "instructor", label: "Instructor" },
  { value: "admin", label: "Administrador" },
];

const STATUS_OPTIONS = [
  { value: "activo", label: "Activo" },
  { value: "pendiente", label: "Pendiente" },
  { value: "suspendido", label: "Suspendido" },
];

function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    rol: "estudiante",
    ciudad: "",
    estado: "activo",
  });

  useEffect(() => {
    // El estado inicial de "loading" ya es `isEditing`, por lo que en modo
    // creación no hace falta actualizarlo de nuevo aquí.
    if (!isEditing) {
      return;
    }

    const loadUser = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getUserById(id);

        const user = data?.user || data?.data || data;

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

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    /*
     * El backend todavía no expone un endpoint para crear o actualizar
     * usuarios (users.service.js solo implementa getUsers, getUserById,
     * suspendUser y deleteUser). En vez de simular un guardado exitoso,
     * se informa la limitación real para no engañar a quien administra.
     */
    setError(
      `Todavía no es posible ${isEditing ? "actualizar" : "crear"} usuarios: el backend no expone ese endpoint.`,
    );
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
            <ErrorMessage message={error} onClose={() => setError("")} />
          </div>
        )}

        <form className="user-form" onSubmit={handleSubmit}>
          <section className="form-section">
            <div className="form-section-header">
              <h2>Información personal</h2>
              <p>Completa los datos básicos del usuario.</p>
            </div>

            <div className="form-grid">
              <Input
                label="Nombre completo"
                name="nombre"
                type="text"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej. María González"
                maxLength={100}
                required
              />

              <Input
                label="Correo electrónico"
                name="correo"
                type="email"
                value={formData.correo}
                onChange={handleChange}
                placeholder="Ej. usuario@email.com"
                maxLength={120}
                required
              />

              <Input
                label="Ciudad"
                name="ciudad"
                type="text"
                value={formData.ciudad}
                onChange={handleChange}
                placeholder="Ej. Guamal"
                maxLength={80}
                required
              />
            </div>
          </section>

          <section className="form-section">
            <div className="form-section-header">
              <h2>Configuración de la cuenta</h2>
              <p>Define el rol y estado del usuario.</p>
            </div>

            <div className="form-grid">
              <Select
                label="Rol"
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                options={ROLE_OPTIONS}
                placeholder=""
                required
              />

              <Select
                label="Estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                options={STATUS_OPTIONS}
                placeholder=""
              />
            </div>
          </section>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={handleCancel}
            >
              Cancelar
            </button>

            <button type="submit" className="save-button">
              {isEditing ? "Guardar cambios" : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserForm;
