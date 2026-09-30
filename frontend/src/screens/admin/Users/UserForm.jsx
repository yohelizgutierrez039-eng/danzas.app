import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { updateUser } from "../../../services/users.service";
import "./UserForm.css";

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    rol: "",
    ciudad: "",
    estado: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Si la pantalla recibe datos por otra vía, puedes reemplazar
    // esta carga por los datos del usuario seleccionado.
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      setLoading(true);

      await updateUser(id, formData);

      navigate("/admin/usuarios");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No fue posible actualizar el usuario.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="user-form-page">
      <div className="user-form-container">
        <div className="user-form-header">
          <span className="user-form-eyebrow">ADMINISTRACIÓN</span>

          <h1>Editar usuario</h1>

          <p>Actualiza la información del usuario seleccionado.</p>
        </div>

        {error && (
          <div className="user-form-error" role="alert">
            {error}
          </div>
        )}

        <form className="user-form" onSubmit={handleSubmit}>
          <div className="user-form-grid">
            <div className="user-form-field">
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="user-form-field">
              <label htmlFor="correo">Correo</label>
              <input
                id="correo"
                name="correo"
                type="email"
                value={formData.correo}
                onChange={handleChange}
                required
              />
            </div>

            <div className="user-form-field">
              <label htmlFor="rol">Rol</label>
              <select
                id="rol"
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar rol</option>
                <option value="admin">Administrador</option>
                <option value="instructor">Instructor</option>
                <option value="estudiante">Estudiante</option>
                <option value="padre">Padre de familia</option>
              </select>
            </div>

            <div className="user-form-field">
              <label htmlFor="ciudad">Ciudad</label>
              <input
                id="ciudad"
                name="ciudad"
                type="text"
                value={formData.ciudad}
                onChange={handleChange}
              />
            </div>

            <div className="user-form-field">
              <label htmlFor="estado">Estado</label>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar estado</option>
                <option value="activo">Activo</option>
                <option value="pendiente">Pendiente</option>
                <option value="suspendido">Suspendido</option>
              </select>
            </div>
          </div>

          <div className="user-form-actions">
            <button
              type="button"
              className="user-form-cancel"
              onClick={() => navigate("/admin/usuarios")}
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="user-form-submit"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default UserForm;
