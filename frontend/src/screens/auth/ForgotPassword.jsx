import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { recoverPassword } from "../../services/auth.service";
import "./ForgotPassword.css";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const emailValue = email.trim();

    if (!emailValue) {
      setError("Por favor, ingresa tu correo electrónico.");
      return;
    }

    if (!emailValue.includes("@")) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    setLoading(true);

    try {
      await recoverPassword(emailValue);

      setSuccess(
        "Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña."
      );

      setEmail("");
    } catch (requestError) {
      setError(
        requestError.message ||
          "No fue posible procesar la solicitud. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">

      {/* LADO IZQUIERDO */}

      <section className="forgot-password-brand">

        <button
          type="button"
          className="forgot-password-logo"
          onClick={() => navigate("/")}
        >
          <span className="forgot-password-logo-icon">
            ♫
          </span>

          <span>
            Danzas<span>.app</span>
          </span>
        </button>

        <div className="forgot-password-brand-content">

          <div className="forgot-password-brand-icon">
            ♫
          </div>

          <span className="forgot-password-brand-eyebrow">
            DANZAS.APP
          </span>

          <h1>
            Vuelve a disfrutar
            <br />
            de la <strong>danza.</strong>
          </h1>

          <p>
            Recupera el acceso a tu cuenta y continúa
            disfrutando de tus clases de danza.
          </p>

        </div>

        <div className="forgot-password-brand-footer">
          Conectando personas con la danza.
        </div>

      </section>

      {/* LADO DERECHO */}

      <main className="forgot-password-content">

        <div className="forgot-password-card">

          <button
            type="button"
            className="forgot-password-back"
            onClick={() => navigate("/login")}
          >
            ← Volver a iniciar sesión
          </button>

          <div className="forgot-password-heading">

            <div className="forgot-password-heading-icon">
              ✉
            </div>

            <span className="forgot-password-eyebrow">
              RECUPERAR CUENTA
            </span>

            <h2>
              ¿Olvidaste tu contraseña?
            </h2>

            <p>
              No te preocupes. Ingresa el correo electrónico
              asociado a tu cuenta y te enviaremos las
              instrucciones para recuperar tu contraseña.
            </p>

          </div>

          <form
            className="forgot-password-form"
            onSubmit={handleSubmit}
          >

            <div className="forgot-password-field">

              <label htmlFor="email">
                Correo electrónico
              </label>

              <div className="forgot-password-input-wrapper">

                <span>✉</span>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                    setSuccess("");
                  }}
                  placeholder="ejemplo@correo.com"
                  autoComplete="email"
                  disabled={loading}
                />

              </div>

            </div>

            {error && (
              <div className="forgot-password-message error">
                <span>!</span>
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="forgot-password-message success">
                <span>✓</span>
                <p>{success}</p>
              </div>
            )}

            <button
              type="submit"
              className="forgot-password-submit"
              disabled={loading}
            >
              {loading
                ? "Enviando..."
                : "Enviar instrucciones"}
            </button>

          </form>

          <div className="forgot-password-divider">
            <span>o</span>
          </div>

          <div className="forgot-password-register">

            <p>
              ¿Todavía no tienes una cuenta?
            </p>

            <button
              type="button"
              onClick={() => navigate("/registro")}
            >
              Crear una cuenta
            </button>

          </div>

        </div>

        <footer className="forgot-password-footer">
          © 2026 Danzas.app. Todos los derechos reservados.
        </footer>

      </main>

    </div>
  );
}

export default ForgotPassword;