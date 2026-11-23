import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import "../styles/crearUsuario.css";

function CrearUsuario() {
  const [form, setForm] = useState({
    id_rol: "",
    username: "",
    password: "",
    nombre: "",
    apellido: "",
    dni: "",
    celular: "",
    correo: "",
    fec_nac: "",
  });

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const volver = () => {
    sessionStorage.removeItem("pantalla");
    window.location.reload();
  };

  const cambiarDato = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const cerrarPopup = () => {
    setMensaje("");
    setTipoMensaje("");
  };

  const crearUsuario = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!form.id_rol) {
      setTipoMensaje("error");
      setMensaje("Debe seleccionar el tipo de usuario.");
      return;
    }

    try {
      setLoading(true);

      const token = sessionStorage.getItem("token");

      await axios.post(
        "/api/usuarios/",
        {
          id_rol: Number(form.id_rol),
          username: form.username,
          password: form.password,
          nombre: form.nombre,
          apellido: form.apellido,
          dni: form.dni,
          celular: form.celular,
          correo: form.correo,
          fec_nac: form.fec_nac,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTipoMensaje("success");
      setMensaje("Usuario creado correctamente.");

      setForm({
        id_rol: "",
        username: "",
        password: "",
        nombre: "",
        apellido: "",
        dni: "",
        celular: "",
        correo: "",
        fec_nac: "",
      });
    } catch (error) {
      setTipoMensaje("error");

      const detalle =
        error.response?.data?.detail ||
        "No se pudo crear el usuario. Verifique los datos.";

      setMensaje(detalle);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crear-usuario-page">
      {mensaje && (
        <div className="crear-popup-overlay">
          <div className="crear-popup-card">
            <div
              className={
                tipoMensaje === "success"
                  ? "crear-popup-icon success"
                  : "crear-popup-icon error"
              }
            >
              {tipoMensaje === "success" ? "✅" : "⚠️"}
            </div>

            <h2>
              {tipoMensaje === "success"
                ? "Operación exitosa"
                : "Atención"}
            </h2>

            <p>{mensaje}</p>

            <button onClick={cerrarPopup}>Aceptar</button>
          </div>
        </div>
      )}

      <div className="crear-usuario-header">
        <div>
          <h1>Crear nuevo usuario</h1>
          <p>Registra tutores o alumnos en el sistema FriendTeacher.</p>
        </div>

        <button className="btn-volver" onClick={volver}>
          ← Volver
        </button>
      </div>

      <form className="crear-usuario-card" onSubmit={crearUsuario}>
        <div className="form-section-title">
          <h2>Datos de acceso</h2>
          <p>Información para ingresar al sistema.</p>
        </div>

        <div className="crear-form-grid">
          <div className="crear-form-group">
            <label>Tipo de usuario</label>
            <select
              name="id_rol"
              value={form.id_rol}
              onChange={cambiarDato}
              required
            >
              <option value="">Seleccione</option>
              <option value="2">Tutor</option>
              <option value="3">Alumno</option>
            </select>
          </div>

          <div className="crear-form-group">
            <label>Usuario</label>
            <input
              name="username"
              value={form.username}
              onChange={cambiarDato}
              placeholder="Ej: tutor01"
              required
            />
          </div>

          <div className="crear-form-group">
            <label>Contraseña</label>

            <div className="password-container">
              <input
                type={mostrarPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={cambiarDato}
                placeholder="Ingrese contraseña"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setMostrarPassword(!mostrarPassword)}
              >
                {mostrarPassword ? <EyeOff size={21} /> : <Eye size={21} />}
              </button>
            </div>
          </div>
        </div>

        <div className="form-section-title">
          <h2>Datos personales</h2>
          <p>Información básica del tutor o alumno.</p>
        </div>

        <div className="crear-form-grid">
          <div className="crear-form-group">
            <label>Nombres</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={cambiarDato}
              placeholder="Ingrese nombres"
              required
            />
          </div>

          <div className="crear-form-group">
            <label>Apellidos</label>
            <input
              name="apellido"
              value={form.apellido}
              onChange={cambiarDato}
              placeholder="Ingrese apellidos"
              required
            />
          </div>

          <div className="crear-form-group">
            <label>DNI</label>
            <input
              name="dni"
              value={form.dni}
              onChange={cambiarDato}
              placeholder="Ingrese DNI"
              maxLength="8"
              required
            />
          </div>

          <div className="crear-form-group">
            <label>Celular</label>
            <input
              name="celular"
              value={form.celular}
              onChange={cambiarDato}
              placeholder="Ingrese celular"
              required
            />
          </div>

          <div className="crear-form-group">
            <label>Correo</label>
            <input
              type="email"
              name="correo"
              value={form.correo}
              onChange={cambiarDato}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>

          <div className="crear-form-group">
            <label>Fecha de nacimiento</label>
            <input
              type="date"
              name="fec_nac"
              value={form.fec_nac}
              onChange={cambiarDato}
              required
            />
          </div>
        </div>

        <div className="crear-actions">
          <button type="button" className="btn-cancelar" onClick={volver}>
            Cancelar
          </button>

          <button type="submit" className="btn-guardar" disabled={loading}>
            {loading ? "Guardando..." : "Guardar usuario"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CrearUsuario;