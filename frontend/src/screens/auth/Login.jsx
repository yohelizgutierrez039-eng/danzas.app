import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import ErrorMessage from "../../components/common/ErrorMessage/ErrorMessage";
import "./Login.css";

const RUTA_POR_ROL = {
  admin: "/admin",
  instructor: "/instructor",
  estudiante: "/estudiante",
  student: "/estudiante",
  padre: "/padre",
  parent: "/padre",
};

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    correo: "",
    contraseña: "",
  });

  const [recordarme, setRecordarme] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (!formData.correo || !formData.contraseña) {
      setError("Ingresá tu correo y tu contraseña.");
      return;
    }

    try {
      setLoading(true);

      const data = await login(formData);

      // RF-002: redirige según el rol devuelto por el backend.
      const rol = data?.user?.rol || data?.user?.role;
      const destino = RUTA_POR_ROL[rol] || "/";

      navigate(destino);
    } catch (submitError) {
      setError(
        submitError.message || "No fue posible iniciar sesión."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">D</div>

          <h1>Bienvenido de nuevo</h1>
          <p>
            Iniciá sesión para seguir descubriendo, aprendiendo y
            disfrutando de la danza.
          </p>
        </div>

        {error && (
          <ErrorMessage
            message={error}
            type="error"
            onClose={() => setError("")}
          />
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
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
              autoComplete="email"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="contraseña">
              Contraseña <span>*</span>
            </label>

            <input
              id="contraseña"
              type="password"
              name="contraseña"
              value={formData.contraseña}
              onChange={handleChange}
              placeholder="Ingresá tu contraseña"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="login-options">
            <label className="login-remember">
              <input
                type="checkbox"
                checked={recordarme}
                onChange={(e) => setRecordarme(e.target.checked)}
              />
              Recordarme
            </label>

            <Link to="/recuperar-password" className="login-forgot">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            ¿Todavía no tenés una cuenta? <Link to="/registro">Registrate</Link>
          </p>

          <Link to="/" className="back-home">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
