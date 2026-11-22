import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/miPerfilTutor.css";

function MiPerfilTutor() {
  const [perfil, setPerfil] = useState({
    username: "",
    nombre: "",
    apellido: "",
    dni: "",
    celular: "",
    correo: "",
    fec_nac: "",
  });

  const [perfilOriginal, setPerfilOriginal] =
    useState(null);

  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] =
    useState("success");

  const token = sessionStorage.getItem("token");

  const volver = () => {
    sessionStorage.removeItem("pantalla");
    window.location.reload();
  };

  const cargarPerfil = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://127.0.0.1:8000/tutores/mi-perfil",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const datos = {
        username: response.data.username || "",
        nombre: response.data.nombre || "",
        apellido: response.data.apellido || "",
        dni: response.data.dni || "",
        celular: response.data.celular || "",
        correo: response.data.correo || "",
        fec_nac: response.data.fec_nac || "",
      };

      setPerfil(datos);
      setPerfilOriginal(datos);
    } catch (error) {
      setTipoMensaje("error");
      setMensaje(
        error.response?.data?.detail ||
          "No se pudo cargar el perfil."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPerfil();
  }, []);

  const manejarCambio = (evento) => {
    const { name, value } = evento.target;

    setPerfil((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  const activarEdicion = () => {
    setPerfilOriginal({ ...perfil });
    setEditando(true);
  };

  const cancelarEdicion = () => {
    if (perfilOriginal) {
      setPerfil(perfilOriginal);
    }

    setEditando(false);
  };

  const guardarPerfil = async (evento) => {
    evento.preventDefault();

    if (
      perfil.celular &&
      !/^[0-9]{7,15}$/.test(perfil.celular)
    ) {
      setTipoMensaje("error");
      setMensaje(
        "El celular debe contener entre 7 y 15 números."
      );
      return;
    }

    const correoValido =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      perfil.correo &&
      !correoValido.test(perfil.correo)
    ) {
      setTipoMensaje("error");
      setMensaje(
        "Ingresa un correo electrónico válido."
      );
      return;
    }

    try {
      setGuardando(true);

      await axios.put(
        "http://127.0.0.1:8000/tutores/mi-perfil",
        {
          celular: perfil.celular || null,
          correo: perfil.correo || null,
          fec_nac: perfil.fec_nac || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPerfilOriginal({ ...perfil });
      setEditando(false);
      setTipoMensaje("success");
      setMensaje("Perfil actualizado correctamente.");
    } catch (error) {
      setTipoMensaje("error");
      setMensaje(
        error.response?.data?.detail ||
          "No se pudo actualizar el perfil."
      );
    } finally {
      setGuardando(false);
    }
  };

  const iniciales = `${perfil.nombre?.[0] || ""}${
    perfil.apellido?.[0] || ""
  }`.toUpperCase();

  if (loading) {
    return (
      <div className="perfil-tutor-loading">
        Cargando perfil...
      </div>
    );
  }

  return (
    <div className="perfil-tutor-page">
      <header className="perfil-tutor-header">
        <div>
          <h1>Mi Perfil</h1>
          <p>
            Consulta y actualiza tu información personal.
          </p>
        </div>

        <button
          type="button"
          className="perfil-btn-volver"
          onClick={volver}
        >
          ← Volver
        </button>
      </header>

      <main className="perfil-tutor-content">
        <section className="perfil-tutor-card-principal">
          <div className="perfil-avatar">
            {iniciales || "T"}
          </div>

          <div className="perfil-identidad">
            <h2>
              {perfil.nombre} {perfil.apellido}
            </h2>

            <span>Tutor FriendTeacher</span>

            <p>@{perfil.username}</p>
          </div>
        </section>

        <form
          className="perfil-datos-card"
          onSubmit={guardarPerfil}
        >
          <div className="perfil-datos-header">
            <div>
              <h2>Información personal</h2>
              <p>
                Los datos de identificación no pueden
                modificarse desde esta pantalla.
              </p>
            </div>

            {!editando && (
              <button
                type="button"
                className="perfil-btn-editar"
                onClick={activarEdicion}
              >
                ✏️ Editar perfil
              </button>
            )}
          </div>

          <div className="perfil-form-grid">
            <div className="perfil-campo">
              <label>Nombre</label>
              <input
                value={perfil.nombre}
                disabled
              />
            </div>

            <div className="perfil-campo">
              <label>Apellido</label>
              <input
                value={perfil.apellido}
                disabled
              />
            </div>

            <div className="perfil-campo">
              <label>DNI</label>
              <input
                value={perfil.dni}
                disabled
              />
            </div>

            <div className="perfil-campo">
              <label>Usuario</label>
              <input
                value={perfil.username}
                disabled
              />
            </div>

            <div className="perfil-campo">
              <label>Celular</label>
              <input
                type="text"
                name="celular"
                value={perfil.celular}
                onChange={manejarCambio}
                disabled={!editando}
                placeholder="Número de celular"
                maxLength={15}
              />
            </div>

            <div className="perfil-campo">
              <label>Correo</label>
              <input
                type="email"
                name="correo"
                value={perfil.correo}
                onChange={manejarCambio}
                disabled={!editando}
                placeholder="Correo electrónico"
              />
            </div>

            <div className="perfil-campo">
              <label>Fecha de nacimiento</label>
              <input
                type="date"
                name="fec_nac"
                value={perfil.fec_nac}
                onChange={manejarCambio}
                disabled={!editando}
              />
            </div>
          </div>

          {editando && (
            <div className="perfil-acciones">
              <button
                type="button"
                className="perfil-btn-cancelar"
                onClick={cancelarEdicion}
                disabled={guardando}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="perfil-btn-guardar"
                disabled={guardando}
              >
                {guardando
                  ? "Guardando..."
                  : "Guardar cambios"}
              </button>
            </div>
          )}
        </form>
      </main>

      {mensaje && (
        <div className="perfil-modal-overlay">
          <div
            className={`perfil-modal ${tipoMensaje}`}
          >
            <div className="perfil-modal-icono">
              {tipoMensaje === "success"
                ? "✓"
                : "!"}
            </div>

            <h2>
              {tipoMensaje === "success"
                ? "Actualización exitosa"
                : "Atención"}
            </h2>

            <p>{mensaje}</p>

            <button
              type="button"
              onClick={() => setMensaje("")}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MiPerfilTutor;