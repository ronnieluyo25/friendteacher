import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../styles/verReportes.css";

function VerReportes() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [estado, setEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [curso, setCurso] = useState("");
  const [modalidad, setModalidad] = useState("");
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");

  const [seleccionados, setSeleccionados] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [detalle, setDetalle] = useState(null);
  const [accion, setAccion] = useState(null);
  const [motivo, setMotivo] = useState("");

  const token = sessionStorage.getItem("token");

  const volver = () => {
    sessionStorage.removeItem("pantalla");
    window.location.reload();
  };

  const cargarReportes = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/reportes/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReportes(res.data);
    } catch {
      setMensaje("No se pudo cargar los reportes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReportes();
  }, []);

  const reportesFiltrados = useMemo(() => {
    return reportes.filter((r) => {
      const texto = `${r.tutor} ${r.alumno} ${r.curso} ${r.modalidad}`.toLowerCase();
      const fecha = r.fec_clase_iso || "";
      const [a, m] = fecha.split("-");

      return (
        (estado === "todos" || r.estado?.toLowerCase() === estado) &&
        texto.includes(busqueda.toLowerCase()) &&
        (!curso || String(r.id_curso) === curso) &&
        (!modalidad || String(r.id_modalidad) === modalidad) &&
        (!mes || m === mes) &&
        (!anio || a === anio)
      );
    });
  }, [reportes, estado, busqueda, curso, modalidad, mes, anio]);

  const resumen = useMemo(() => {
    return {
      total: reportesFiltrados.length,
      pendientes: reportesFiltrados.filter(
        (r) => r.estado?.toLowerCase() === "pendiente"
      ).length,
      aprobados: reportesFiltrados.filter((r) =>
        ["aprobado", "validado"].includes(r.estado?.toLowerCase())
      ).length,
      anulados: reportesFiltrados.filter(
        (r) => r.estado?.toLowerCase() === "anulado"
      ).length,
      horas: reportesFiltrados.reduce(
        (s, r) => s + Number(r.horas_calculadas || 0),
        0
      ),
      pagoTutor: reportesFiltrados.reduce(
        (s, r) => s + Number(r.monto_tutor || 0),
        0
      ),
      cobro: reportesFiltrados.reduce(
        (s, r) => s + Number(r.monto_alumno || 0),
        0
      ),
    };
  }, [reportesFiltrados]);

  const cursos = [...new Map(reportes.map((r) => [r.id_curso, r.curso])).entries()];
  const modalidades = [...new Map(reportes.map((r) => [r.id_modalidad, r.modalidad])).entries()];
  const anios = [...new Set(reportes.map((r) => r.fec_clase_iso?.slice(0, 4)).filter(Boolean))];

  const seleccionarTodos = () => {
    if (seleccionados.length === reportesFiltrados.length) {
      setSeleccionados([]);
    } else {
      setSeleccionados(reportesFiltrados.map((r) => r.id));
    }
  };

  const toggleSeleccion = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const abrirAccion = (tipo) => {
    if (seleccionados.length === 0) {
      setMensaje("Seleccione al menos un reporte.");
      return;
    }
    setAccion(tipo);
  };

  const aprobar = async () => {
    try {
      await axios.put(
        "/api/reportes/validar-multiple/",
        seleccionados,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMensaje("Reportes aprobados correctamente.");
      setAccion(null);
      setSeleccionados([]);
      cargarReportes();
    } catch {
      setMensaje("No se pudieron aprobar los reportes.");
    }
  };

  const anular = async () => {
    if (!motivo.trim()) {
      setMensaje("Ingrese el motivo de anulación.");
      return;
    }

    try {
      await axios.put(
        "/api/reportes/anular-multiple/",
        {
          ids_reportes: seleccionados,
          motivo_anulacion: motivo,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMensaje("Reportes anulados correctamente.");
      setAccion(null);
      setMotivo("");
      setSeleccionados([]);
      cargarReportes();
    } catch {
      setMensaje("No se pudieron anular los reportes.");
    }
  };

  const limpiar = () => {
    setEstado("todos");
    setBusqueda("");
    setCurso("");
    setModalidad("");
    setMes("");
    setAnio("");
    setSeleccionados([]);
  };

  return (
    <div className="ver-reportes-page">
      <div className="ver-reportes-header">
        <div>
          <h1>Administración de Reportes</h1>
          <p>Consulta, filtra, aprueba o anula reportes registrados.</p>
        </div>

        <button onClick={volver}>← Volver</button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card kpi-total">
          <span>Total</span>
          <strong>{resumen.total}</strong>
        </div>

        <div className="kpi-card kpi-pendiente">
          <span>Pendientes</span>
          <strong>{resumen.pendientes}</strong>
        </div>

        <div className="kpi-card kpi-aprobado">
          <span>Aprobados</span>
          <strong>{resumen.aprobados}</strong>
        </div>

        <div className="kpi-card kpi-anulado">
          <span>Anulados</span>
          <strong>{resumen.anulados}</strong>
        </div>

        <div className="kpi-card kpi-horas">
          <span>Horas</span>
          <strong>{resumen.horas.toFixed(2)}</strong>
        </div>

        <div className="kpi-card kpi-pago">
          <span>Pago Tutor</span>
          <strong>S/ {resumen.pagoTutor.toFixed(2)}</strong>
        </div>

        <div className="kpi-card kpi-cobro">
          <span>Cobro Alumno</span>
          <strong>S/ {resumen.cobro.toFixed(2)}</strong>
        </div>
      </div>

      <div className="reportes-card">
        <div className="reportes-filtros">
          <select value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="todos">Mostrar todos</option>
            <option value="pendiente">Pendientes</option>
            <option value="validado">Aprobados</option>
            <option value="anulado">Anulados</option>
          </select>

          <input
            placeholder="Buscar por alumno, tutor, curso o modalidad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <select value={curso} onChange={(e) => setCurso(e.target.value)}>
            <option value="">Curso</option>
            {cursos.map(([id, nombre]) => (
              <option key={id} value={id}>{nombre}</option>
            ))}
          </select>

          <select value={modalidad} onChange={(e) => setModalidad(e.target.value)}>
            <option value="">Modalidad</option>
            {modalidades.map(([id, nombre]) => (
              <option key={id} value={id}>{nombre}</option>
            ))}
          </select>

          <select value={mes} onChange={(e) => setMes(e.target.value)}>
            <option value="">Mes</option>
            {Array.from({ length: 12 }, (_, i) => {
              const value = String(i + 1).padStart(2, "0");
              return <option key={value} value={value}>{value}</option>;
            })}
          </select>

          <select value={anio} onChange={(e) => setAnio(e.target.value)}>
            <option value="">Año</option>
            {anios.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>

          <button onClick={limpiar}>Limpiar</button>
        </div>

        <div className="acciones-masivas">
          <span>Seleccionados: <strong>{seleccionados.length}</strong></span>

          <div>
            <button className="btn-aprobar" onClick={() => abrirAccion("aprobar")}>
              Aprobar Registro(s)
            </button>
            <button className="btn-anular" onClick={() => abrirAccion("anular")}>
              Anular Registro(s)
            </button>
          </div>
        </div>

        <div className="reportes-resumen">
          Reportes encontrados: <strong>{reportesFiltrados.length}</strong>
        </div>

        {loading ? (
          <p>Cargando reportes...</p>
        ) : (
          <div className="reportes-table-container">
            <table className="reportes-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={
                        reportesFiltrados.length > 0 &&
                        seleccionados.length === reportesFiltrados.length
                      }
                      onChange={seleccionarTodos}
                    />
                  </th>
                  <th>Fecha</th>
                  <th>Tutor</th>
                  <th>Alumno</th>
                  <th>Curso</th>
                  <th>Modalidad</th>
                  <th>Horario</th>
                  <th>Horas</th>
                  <th>Pago Tutor</th>
                  <th>Cobro Alumno</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {reportesFiltrados.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={seleccionados.includes(r.id)}
                        onChange={() => toggleSeleccion(r.id)}
                      />
                    </td>
                    <td>{r.fec_clase}</td>
                    <td>{r.tutor}</td>
                    <td>{r.alumno}</td>
                    <td>{r.curso}</td>
                    <td>{r.modalidad}</td>
                    <td>{r.hora_inicio} - {r.hora_final}</td>
                    <td>{r.horas_calculadas}</td>
                    <td>S/ {r.monto_tutor}</td>
                    <td>S/ {r.monto_alumno}</td>
                    <td>
                      <span className={`estado-badge ${r.estado?.toLowerCase()}`}>
                        {r.estado}
                      </span>
                    </td>
                    <td>
                      <button className="btn-ver-reporte" onClick={() => setDetalle(r)}>
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {reportesFiltrados.length === 0 && (
              <div className="sin-reportes">No se encontraron reportes.</div>
            )}
          </div>
        )}
      </div>

      {mensaje && (
        <div className="reportes-popup-overlay">
          <div className="reportes-popup-card">
            <h2>Atención</h2>
            <p>{mensaje}</p>
            <button onClick={() => setMensaje("")}>Aceptar</button>
          </div>
        </div>
      )}

      {accion && (
        <div className="reportes-popup-overlay">
          <div className="reportes-popup-card">
            <h2>{accion === "aprobar" ? "Confirmar aprobación" : "Confirmar anulación"}</h2>
            <p>
              {accion === "aprobar"
                ? `¿Deseas aprobar ${seleccionados.length} reporte(s)?`
                : `¿Deseas anular ${seleccionados.length} reporte(s)?`}
            </p>

            {accion === "anular" && (
              <textarea
                className="motivo-anulacion"
                placeholder="Motivo de anulación"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              />
            )}

            <div className="modal-actions">
              <button onClick={() => setAccion(null)}>Cancelar</button>
              {accion === "aprobar" ? (
                <button className="btn-aprobar" onClick={aprobar}>Aprobar</button>
              ) : (
                <button className="btn-anular" onClick={anular}>Anular</button>
              )}
            </div>
          </div>
        </div>
      )}

      {detalle && (
        <div className="reportes-popup-overlay">
          <div className="detalle-reporte-modal">
            <h2>Reporte de Clase</h2>

            <div className="detalle-grid">
              <p><strong>Fecha:</strong> {detalle.fec_clase}</p>
              <p><strong>Estado:</strong> {detalle.estado}</p>
              <p><strong>Tutor:</strong> {detalle.tutor}</p>
              <p><strong>Alumno:</strong> {detalle.alumno}</p>
              <p><strong>Curso:</strong> {detalle.curso}</p>
              <p><strong>Modalidad:</strong> {detalle.modalidad}</p>
              <p><strong>Horario:</strong> {detalle.hora_inicio} - {detalle.hora_final}</p>
              <p><strong>Horas:</strong> {detalle.horas_calculadas}</p>
              <p><strong>Pago tutor:</strong> S/ {detalle.monto_tutor}</p>
              <p><strong>Cobro alumno:</strong> S/ {detalle.monto_alumno}</p>
            </div>

            <div className="detalle-desarrollo">
              <h3>Detalle académico</h3>
              <p><strong>Tema:</strong> {detalle.detalle?.tema_realizado || "-"}</p>
              <p><strong>Desarrollo:</strong> {detalle.detalle?.desarrollo_clase || "-"}</p>
              <p><strong>Tarea:</strong> {detalle.detalle?.tarea_realizada || "-"}</p>
              <p><strong>Actitud:</strong> {detalle.detalle?.actitud_estudiante || "-"}</p>
              <p><strong>Logro:</strong> {detalle.detalle?.logro_estudiante || "-"}</p>
              <p><strong>Recomendaciones:</strong> {detalle.detalle?.recomendaciones || "-"}</p>
            </div>

            <button onClick={() => setDetalle(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VerReportes;