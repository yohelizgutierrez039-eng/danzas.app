import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../../components/common/Loading/Loading";
import { getUserById, updateUser } from "../../../services/users.service";
import "./UserForm.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const [loadingUser, setLoadingUser] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Precarga los datos actuales del usuario para que "editar" no parta
  // de un formulario vacio (y no pise datos con valores en blanco).
  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      try {
        setLoadingUser(true);
        setError("");

        const data = await getUserById(id);
        const user = data?.user || data?.data || data;

        if (cancelled) return;

        if (!user) {
          setError("No se encontró el usuario solicitado.");
          return;
        }

        setFormData({
          nombre: user.nombre || "",
          correo: user.correo || "",
          rol: user.rol || "",
          ciudad: user.ciudad || "",
          estado: user.estado || "",
        });
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "No se pudo cargar la información del usuario.",
          );
        }
      } finally {
        if (!cancelled) setLoadingUser(false);
      }
    };

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    if (!formData.nombre.trim()) return "El nombre es obligatorio.";
    if (!formData.correo.trim()) return "El correo electrónico es obligatorio.";
    if (!EMAIL_REGEX.test(formData.correo.trim())) {
      return "Ingresa un correo electrónico válido.";
    }
    if (!formData.rol) return "Debes seleccionar un rol.";
    if (!formData.estado) return "Debes seleccionar un estado.";
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      await updateUser(id, {
        ...formData,
        nombre: formData.nombre.trim(),
        correo: formData.correo.trim(),
        ciudad: formData.ciudad.trim(),
      });

      navigate(`/admin/usuarios/${id}`);
    } catch (err) {
      // El wrapper `api` lanza Error con el mensaje ya resuelto del backend.
      setError(err?.message || "No fue posible actualizar el usuario.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <section className="user-form-page">
        <Loading />
      </section>
    );
  }

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
                disabled
                title="El rol de un usuario no se puede modificar."
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
              onClick={() => navigate(`/admin/usuarios/${id}`)}
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
