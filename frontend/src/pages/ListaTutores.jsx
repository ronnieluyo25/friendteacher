import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/listaTutores.css";

function ListaTutores() {
  const [tutores, setTutores] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);

  const [tutorVer, setTutorVer] = useState(null);
  const [tutorEditar, setTutorEditar] = useState(null);
  const [tutorEliminar, setTutorEliminar] = useState(null);

  const [mensaje, setMensaje] = useState("");

  const token = sessionStorage.getItem("token");

  const volver = () => {
    sessionStorage.removeItem("pantalla");
    window.location.reload();
  };

  const cargarTutores = async () => {
    try {
      setLoading(true);

      const res = await axios.get("http://127.0.0.1:8000/usuarios/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const usuariosTutores = res.data.filter(
        (u) => u.id_rol === 2 && u.activo === true
      );

      const detalleTutores = await Promise.all(
        usuariosTutores.map(async (u) => {
          const detalle = await axios.get(
            `http://127.0.0.1:8000/usuarios/${u.id_usuario}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          return detalle.data;
        })
      );

      setTutores(detalleTutores);
    } catch (error) {
      setMensaje("No se pudo cargar la lista de tutores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTutores();
  }, []);

  const tutoresFiltrados = tutores.filter((t) => {
    const texto = `
      ${t.username}
      ${t.email}
      ${t.perfil?.nombre || ""}
      ${t.perfil?.apellido || ""}
      ${t.perfil?.dni || ""}
      ${t.perfil?.celular || ""}
    `.toLowerCase();

    return texto.includes(busqueda.toLowerCase());
  });

  const confirmarEliminar = async () => {
    try {
      await axios.patch(
        `http://127.0.0.1:8000/usuarios/${tutorEliminar.id_usuario}/desactivar`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTutorEliminar(null);
      setMensaje("Tutor desactivado correctamente.");
      cargarTutores();
    } catch (error) {
      setMensaje("No se pudo desactivar el tutor.");
    }
  };

  const guardarEdicion = async () => {
    try {
      await axios.patch(
        `http://127.0.0.1:8000/usuarios/${tutorEditar.id_usuario}/actualizar`,
        {
          username: tutorEditar.username,
          email: tutorEditar.email,
          nombre: tutorEditar.perfil.nombre,
          apellido: tutorEditar.perfil.apellido,
          dni: tutorEditar.perfil.dni,
          celular: tutorEditar.perfil.celular,
          correo: tutorEditar.perfil.correo,
          fec_nac: tutorEditar.perfil.fec_nac,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTutorEditar(null);
      setMensaje("Datos del tutor actualizados correctamente.");
      cargarTutores();
    } catch (error) {
      setMensaje("No se pudo actualizar el tutor.");
    }
  };

  return (
    <div className="lista-page">
      {mensaje && (
        <div className="lista-popup-overlay">
          <div className="lista-popup-card">
            <h2>Mensaje</h2>
            <p>{mensaje}</p>
            <button onClick={() => setMensaje("")}>Aceptar</button>
          </div>
        </div>
      )}

      <div className="lista-header">
        <div>
          <h1>Lista de Tutores</h1>
          <p>Consulta, edita o desactiva tutores activos.</p>
        </div>

        <button onClick={volver}>← Volver</button>
      </div>

      <div className="lista-card">
        <div className="lista-toolbar">
          <input
            placeholder="Buscar por nombre, DNI, correo o usuario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <div className="lista-total">
            Total tutores: <strong>{tutoresFiltrados.length}</strong>
          </div>
        </div>

        {loading ? (
          <p>Cargando tutores...</p>
        ) : (
          <table className="lista-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre completo</th>
                <th>DNI</th>
                <th>Celular</th>
                <th>Correo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {tutoresFiltrados.map((t) => (
                <tr key={t.id_usuario}>
                  <td>{t.username}</td>
                  <td>
                    {t.perfil?.nombre} {t.perfil?.apellido}
                  </td>
                  <td>{t.perfil?.dni}</td>
                  <td>{t.perfil?.celular}</td>
                  <td>{t.email}</td>
                  <td>
                    <span className="badge-activo">Activo</span>
                  </td>
                  <td>
                    <button className="btn-ver" onClick={() => setTutorVer(t)}>
                      Ver
                    </button>

                    <button
                      className="btn-editar"
                      onClick={() => setTutorEditar(t)}
                    >
                      Editar
                    </button>

                    <button
                      className="btn-eliminar"
                      onClick={() => setTutorEliminar(t)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {tutorVer && (
        <div className="lista-popup-overlay">
          <div className="perfil-modal">
            <h2>Perfil del Tutor</h2>

            <p><strong>Usuario:</strong> {tutorVer.username}</p>
            <p><strong>Nombre:</strong> {tutorVer.perfil?.nombre}</p>
            <p><strong>Apellido:</strong> {tutorVer.perfil?.apellido}</p>
            <p><strong>DNI:</strong> {tutorVer.perfil?.dni}</p>
            <p><strong>Celular:</strong> {tutorVer.perfil?.celular}</p>
            <p><strong>Correo:</strong> {tutorVer.email}</p>
            <p><strong>Fecha nacimiento:</strong> {tutorVer.perfil?.fec_nac}</p>

            <button onClick={() => setTutorVer(null)}>Cerrar</button>
          </div>
        </div>
      )}

      {tutorEditar && (
        <div className="lista-popup-overlay">
          <div className="editar-modal">
            <h2>Editar Tutor</h2>

            <div className="editar-grid">
              <input
                value={tutorEditar.username}
                onChange={(e) =>
                  setTutorEditar({ ...tutorEditar, username: e.target.value })
                }
                placeholder="Usuario"
              />

              <input
                value={tutorEditar.email}
                onChange={(e) =>
                  setTutorEditar({ ...tutorEditar, email: e.target.value })
                }
                placeholder="Email"
              />

              <input
                value={tutorEditar.perfil?.nombre || ""}
                onChange={(e) =>
                  setTutorEditar({
                    ...tutorEditar,
                    perfil: { ...tutorEditar.perfil, nombre: e.target.value },
                  })
                }
                placeholder="Nombre"
              />

              <input
                value={tutorEditar.perfil?.apellido || ""}
                onChange={(e) =>
                  setTutorEditar({
                    ...tutorEditar,
                    perfil: { ...tutorEditar.perfil, apellido: e.target.value },
                  })
                }
                placeholder="Apellido"
              />

              <input
                value={tutorEditar.perfil?.dni || ""}
                onChange={(e) =>
                  setTutorEditar({
                    ...tutorEditar,
                    perfil: { ...tutorEditar.perfil, dni: e.target.value },
                  })
                }
                placeholder="DNI"
              />

              <input
                value={tutorEditar.perfil?.celular || ""}
                onChange={(e) =>
                  setTutorEditar({
                    ...tutorEditar,
                    perfil: { ...tutorEditar.perfil, celular: e.target.value },
                  })
                }
                placeholder="Celular"
              />
            </div>

            <div className="modal-actions">
              <button onClick={() => setTutorEditar(null)}>Cancelar</button>
              <button className="btn-confirmar" onClick={guardarEdicion}>
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {tutorEliminar && (
        <div className="lista-popup-overlay">
          <div className="lista-popup-card">
            <h2>Confirmar eliminación</h2>
            <p>
              ¿Deseas desactivar al tutor{" "}
              <strong>
                {tutorEliminar.perfil?.nombre} {tutorEliminar.perfil?.apellido}
              </strong>
              ?
            </p>

            <div className="modal-actions">
              <button onClick={() => setTutorEliminar(null)}>Cancelar</button>
              <button className="btn-eliminar" onClick={confirmarEliminar}>
                Sí, desactivar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListaTutores;