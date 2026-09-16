import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../services/auth.service";
import Select from "../../components/common/Select/Select";
import ErrorMessage from "../../components/common/ErrorMessage/ErrorMessage";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    rol: "",
    nombre: "",
    correo: "",
    contraseña: "",
    ciudad: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const roles = [
    { value: "student", label: "Estudiante" },
    { value: "parent", label: "Padre de familia" },
    { value: "instructor", label: "Instructor" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.rol ||
      !formData.nombre ||
      !formData.correo ||
      !formData.contraseña ||
      !formData.ciudad
    ) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    try {
      setLoading(true);

      await register(formData);

      navigate("/login", {
        state: {
          message: "Registro exitoso. Ahora puedes iniciar sesión.",
        },
      });
    } catch (error) {
      setError(error.message || "No fue posible completar el registro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-header">
          <div className="register-logo">D</div>

          <h1>Crear cuenta</h1>
          <p>
            Regístrate en <strong>Danzas.app</strong> y comienza a disfrutar de
            la danza.
          </p>
        </div>

        {error && (
          <ErrorMessage
            message={error}
            type="error"
            onClose={() => setError("")}
          />
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <Select
            label="Rol"
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            options={roles}
            placeholder="Selecciona tu rol"
            required
            fullWidth
          />

          <div className="register-field">
            <label htmlFor="nombre">
              Nombre completo <span>*</span>
            </label>

            <input
              id="nombre"
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ingresa tu nombre"
              required
            />
          </div>

          <div className="register-field">
            <label htmlFor="correo">
              Correo electrónico <span>*</span>
            </label>

            <input
              id="correo"
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>

          <div className="register-field">
            <label htmlFor="contraseña">
              Contraseña <span>*</span>
            </label>

            <input
              id="contraseña"
              type="password"
              name="contraseña"
              value={formData.contraseña}
              onChange={handleChange}
              placeholder="Ingresa una contraseña"
              minLength={6}
              required
            />

            <small>La contraseña debe tener mínimo 6 caracteres.</small>
          </div>

          <div className="register-field">
            <label htmlFor="ciudad">
              Ciudad <span>*</span>
            </label>

            <input
              id="ciudad"
              type="text"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              placeholder="Ej. Barranquilla"
              required
            />
          </div>

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? "Registrando..." : "Crear cuenta"}
          </button>
        </form>

        <div className="register-footer">
          <p>
            ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
          </p>

          <Link to="/" className="back-home">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
