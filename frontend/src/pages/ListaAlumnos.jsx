import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/listaTutores.css";

function ListaAlumnos() {
  const [alumnos, setAlumnos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);

  const [alumnoVer, setAlumnoVer] = useState(null);
  const [alumnoEditar, setAlumnoEditar] = useState(null);
  const [alumnoEliminar, setAlumnoEliminar] = useState(null);

  const [mensaje, setMensaje] = useState("");

  const token = sessionStorage.getItem("token");

  const volver = () => {
    sessionStorage.removeItem("pantalla");
    window.location.reload();
  };

  const cargarAlumnos = async () => {
    try {
      setLoading(true);

      const res = await axios.get("http://127.0.0.1:8000/usuarios/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const usuariosAlumnos = res.data.filter(
        (u) => u.id_rol === 3 && u.activo === true
      );

      const detalleAlumnos = await Promise.all(
        usuariosAlumnos.map(async (u) => {
          const detalle = await axios.get(
            `http://127.0.0.1:8000/usuarios/${u.id_usuario}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          return detalle.data;
        })
      );

      setAlumnos(detalleAlumnos);
    } catch (error) {
      setMensaje("No se pudo cargar la lista de alumnos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAlumnos();
  }, []);

  const alumnosFiltrados = alumnos.filter((a) => {
    const texto = `
      ${a.username}
      ${a.email}
      ${a.perfil?.nombre || ""}
      ${a.perfil?.apellido || ""}
      ${a.perfil?.dni || ""}
      ${a.perfil?.celular || ""}
    `.toLowerCase();

    return texto.includes(busqueda.toLowerCase());
  });

  const confirmarEliminar = async () => {
    try {
      await axios.patch(
        `http://127.0.0.1:8000/usuarios/${alumnoEliminar.id_usuario}/desactivar`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAlumnoEliminar(null);
      setMensaje("Alumno desactivado correctamente.");
      cargarAlumnos();
    } catch (error) {
      setMensaje("No se pudo desactivar el alumno.");
    }
  };

  const guardarEdicion = async () => {
    try {
      await axios.patch(
        `http://127.0.0.1:8000/usuarios/${alumnoEditar.id_usuario}/actualizar`,
        {
          username: alumnoEditar.username,
          email: alumnoEditar.email,
          nombre: alumnoEditar.perfil.nombre,
          apellido: alumnoEditar.perfil.apellido,
          dni: alumnoEditar.perfil.dni,
          celular: alumnoEditar.perfil.celular,
          correo: alumnoEditar.perfil.correo,
          fec_nac: alumnoEditar.perfil.fec_nac,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAlumnoEditar(null);
      await cargarAlumnos();
      setMensaje("Datos del alumno actualizados correctamente.");
    } catch (error) {
      setMensaje("No se pudo actualizar el alumno.");
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
          <h1>Lista de Alumnos</h1>
          <p>Consulta, edita o desactiva alumnos activos.</p>
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
            Total alumnos: <strong>{alumnosFiltrados.length}</strong>
          </div>
        </div>

        {loading ? (
          <p>Cargando alumnos...</p>
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
              {alumnosFiltrados.map((a) => (
                <tr key={a.id_usuario}>
                  <td>{a.username}</td>
                  <td>
                    {a.perfil?.nombre} {a.perfil?.apellido}
                  </td>
                  <td>{a.perfil?.dni}</td>
                  <td>{a.perfil?.celular}</td>
                  <td>{a.email}</td>
                  <td>
                    <span className="badge-activo">Activo</span>
                  </td>
                  <td>
                    <button className="btn-ver" onClick={() => setAlumnoVer(a)}>
                      Ver
                    </button>

                    <button
                      className="btn-editar"
                      onClick={() => setAlumnoEditar(a)}
                    >
                      Editar
                    </button>

                    <button
                      className="btn-eliminar"
                      onClick={() => setAlumnoEliminar(a)}
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

      {alumnoVer && (
        <div className="lista-popup-overlay">
          <div className="perfil-modal">
            <h2>Perfil del Alumno</h2>

            <p><strong>Usuario:</strong> {alumnoVer.username}</p>
            <p><strong>Nombre:</strong> {alumnoVer.perfil?.nombre}</p>
            <p><strong>Apellido:</strong> {alumnoVer.perfil?.apellido}</p>
            <p><strong>DNI:</strong> {alumnoVer.perfil?.dni}</p>
            <p><strong>Celular:</strong> {alumnoVer.perfil?.celular}</p>
            <p><strong>Correo:</strong> {alumnoVer.email}</p>
            <p><strong>Fecha nacimiento:</strong> {alumnoVer.perfil?.fec_nac}</p>

            <button onClick={() => setAlumnoVer(null)}>Cerrar</button>
          </div>
        </div>
      )}

      {alumnoEditar && (
        <div className="lista-popup-overlay">
          <div className="editar-modal">
            <h2>Editar Alumno</h2>

            <div className="editar-grid">
              <input
                value={alumnoEditar.username}
                onChange={(e) =>
                  setAlumnoEditar({ ...alumnoEditar, username: e.target.value })
                }
                placeholder="Usuario"
              />

              <input
                value={alumnoEditar.email}
                onChange={(e) =>
                  setAlumnoEditar({ ...alumnoEditar, email: e.target.value })
                }
                placeholder="Email"
              />

              <input
                value={alumnoEditar.perfil?.nombre || ""}
                onChange={(e) =>
                  setAlumnoEditar({
                    ...alumnoEditar,
                    perfil: { ...alumnoEditar.perfil, nombre: e.target.value },
                  })
                }
                placeholder="Nombre"
              />

              <input
                value={alumnoEditar.perfil?.apellido || ""}
                onChange={(e) =>
                  setAlumnoEditar({
                    ...alumnoEditar,
                    perfil: {
                      ...alumnoEditar.perfil,
                      apellido: e.target.value,
                    },
                  })
                }
                placeholder="Apellido"
              />

              <input
                value={alumnoEditar.perfil?.dni || ""}
                onChange={(e) =>
                  setAlumnoEditar({
                    ...alumnoEditar,
                    perfil: { ...alumnoEditar.perfil, dni: e.target.value },
                  })
                }
                placeholder="DNI"
              />

              <input
                value={alumnoEditar.perfil?.celular || ""}
                onChange={(e) =>
                  setAlumnoEditar({
                    ...alumnoEditar,
                    perfil: {
                      ...alumnoEditar.perfil,
                      celular: e.target.value,
                    },
                  })
                }
                placeholder="Celular"
              />
            </div>

            <div className="modal-actions">
              <button onClick={() => setAlumnoEditar(null)}>Cancelar</button>
              <button className="btn-confirmar" onClick={guardarEdicion}>
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {alumnoEliminar && (
        <div className="lista-popup-overlay">
          <div className="lista-popup-card">
            <h2>Confirmar eliminación</h2>
            <p>
              ¿Deseas desactivar al alumno{" "}
              <strong>
                {alumnoEliminar.perfil?.nombre} {alumnoEliminar.perfil?.apellido}
              </strong>
              ?
            </p>

            <div className="modal-actions">
              <button onClick={() => setAlumnoEliminar(null)}>Cancelar</button>
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

export default ListaAlumnos;