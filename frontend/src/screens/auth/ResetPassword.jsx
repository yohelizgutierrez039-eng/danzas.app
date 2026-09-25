import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../services/auth.service";
import "./ResetPassword.css";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!password || !confirmPassword) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!token) {
      setError(
        "El enlace de recuperación no es válido o ha expirado. Solicita uno nuevo."
      );
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, password);

      setSuccess(
        "Tu contraseña ha sido actualizada correctamente. Ya puedes iniciar sesión."
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 1800);
    } catch (requestError) {
      setError(
        requestError.message ||
          "No fue posible cambiar la contraseña. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">

      {/* LADO DE MARCA */}
      <section className="reset-password-brand">

        <button
          type="button"
          className="reset-password-logo"
          onClick={() => navigate("/")}
        >
          <span className="reset-password-logo-icon">♫</span>

          <span>
            Danzas<span>.app</span>
          </span>
        </button>

        <div className="reset-password-brand-content">

          <div className="reset-password-brand-icon">
            ♫
          </div>

          <span className="reset-password-brand-eyebrow">
            DANZAS.APP
          </span>

          <h1>
            Tu ritmo,
            <br />
            tu <strong>espacio.</strong>
          </h1>

          <p>
            Actualiza tu contraseña y vuelve a disfrutar
            de todas las experiencias que Danzas.app tiene
            para ti.
          </p>

        </div>

        <div className="reset-password-brand-footer">
          Conectando personas con la danza.
        </div>

      </section>

      {/* CONTENIDO PRINCIPAL */}
      <main className="reset-password-content">

        <div className="reset-password-card">

          {/* VOLVER */}
          <button
            type="button"
            className="reset-password-back"
            onClick={() => navigate("/login")}
          >
            ← Volver a iniciar sesión
          </button>

          {/* ENCABEZADO */}
          <div className="reset-password-heading">

            <div className="reset-password-heading-icon">
              🔒
            </div>

            <span className="reset-password-eyebrow">
              NUEVA CONTRASEÑA
            </span>

            <h2>
              Restablece tu contraseña
            </h2>

            <p>
              Crea una nueva contraseña para proteger
              tu cuenta de Danzas.app.
            </p>

          </div>

          {/* FORMULARIO */}
          <form
            className="reset-password-form"
            onSubmit={handleSubmit}
          >

            {/* NUEVA CONTRASEÑA */}
            <div className="reset-password-field">

              <label htmlFor="password">
                Nueva contraseña
              </label>

              <div className="reset-password-input-wrapper">

                <span className="reset-password-input-icon">
                  🔒
                </span>

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                    setSuccess("");
                  }}
                  placeholder="Ingresa tu nueva contraseña"
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="reset-password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  {showPassword ? "◉" : "○"}
                </button>

              </div>

              <span className="reset-password-helper">
                Usa al menos 8 caracteres.
              </span>

            </div>

            {/* CONFIRMAR CONTRASEÑA */}
            <div className="reset-password-field">

              <label htmlFor="confirmPassword">
                Confirmar contraseña
              </label>

              <div className="reset-password-input-wrapper">

                <span className="reset-password-input-icon">
                  🔒
                </span>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setError("");
                    setSuccess("");
                  }}
                  placeholder="Confirma tu nueva contraseña"
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="reset-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  {showConfirmPassword ? "◉" : "○"}
                </button>

              </div>

            </div>

            {/* MENSAJE DE ERROR */}
            {error && (
              <div className="reset-password-message error">
                <span>!</span>
                <p>{error}</p>
              </div>
            )}

            {/* MENSAJE DE ÉXITO */}
            {success && (
              <div className="reset-password-message success">
                <span>✓</span>
                <p>{success}</p>
              </div>
            )}

            {/* BOTÓN */}
            <button
              type="submit"
              className="reset-password-submit"
              disabled={loading}
            >
              {loading
                ? "Actualizando..."
                : "Cambiar contraseña"}
            </button>

          </form>

          {/* ENLACE LOGIN */}
          <div className="reset-password-login">

            <p>
              ¿Ya recuerdas tu contraseña?
            </p>

            <button
              type="button"
              onClick={() => navigate("/login")}
            >
              Iniciar sesión
            </button>

          </div>

        </div>

        <footer className="reset-password-footer">
          © 2026 Danzas.app. Todos los derechos reservados.
        </footer>

      </main>

    </div>
  );
}

export default ResetPassword;