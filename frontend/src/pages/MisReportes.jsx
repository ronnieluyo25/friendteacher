import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../styles/verReportes.css";

function MisReportes() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [detalle, setDetalle] = useState(null);

  const [estado, setEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [curso, setCurso] = useState("");
  const [modalidad, setModalidad] = useState("");
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");

  const token = sessionStorage.getItem("token");

  const volver = () => {
    sessionStorage.removeItem("pantalla");
    window.location.reload();
  };

  const cargarReportes = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "/api/reportes/mis-reportes",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReportes(response.data);
    } catch (error) {
      const detalleError =
        error.response?.data?.detail ||
        "No se pudieron cargar tus reportes.";

      setMensaje(detalleError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReportes();
  }, []);

  const reportesFiltrados = useMemo(() => {
    return reportes.filter((reporte) => {
      const texto = `
        ${reporte.alumno}
        ${reporte.curso}
        ${reporte.modalidad}
      `.toLowerCase();

      const fecha = reporte.fec_clase_iso || "";
      const [anioReporte, mesReporte] = fecha.split("-");

      const coincideEstado =
        estado === "todos" ||
        reporte.estado?.toLowerCase() === estado;

      const coincideBusqueda = texto.includes(
        busqueda.toLowerCase()
      );

      const coincideCurso =
        !curso ||
        String(reporte.id_curso) === curso;

      const coincideModalidad =
        !modalidad ||
        String(reporte.id_modalidad) === modalidad;

      const coincideMes =
        !mes ||
        mesReporte === mes;

      const coincideAnio =
        !anio ||
        anioReporte === anio;

      return (
        coincideEstado &&
        coincideBusqueda &&
        coincideCurso &&
        coincideModalidad &&
        coincideMes &&
        coincideAnio
      );
    });
  }, [
    reportes,
    estado,
    busqueda,
    curso,
    modalidad,
    mes,
    anio,
  ]);

  const resumen = useMemo(() => {
    const pendientes = reportesFiltrados.filter(
      (reporte) =>
        reporte.estado?.toLowerCase() === "pendiente"
    ).length;

    const aprobados = reportesFiltrados.filter(
      (reporte) =>
        ["aprobado", "validado"].includes(
          reporte.estado?.toLowerCase()
        )
    ).length;

    const anulados = reportesFiltrados.filter(
      (reporte) =>
        reporte.estado?.toLowerCase() === "anulado"
    ).length;

    const horas = reportesFiltrados.reduce(
      (total, reporte) =>
        total + Number(reporte.horas_calculadas || 0),
      0
    );

    const pagoTutor = reportesFiltrados.reduce(
      (total, reporte) =>
        total + Number(reporte.monto_tutor || 0),
      0
    );

    return {
      total: reportesFiltrados.length,
      pendientes,
      aprobados,
      anulados,
      horas,
      pagoTutor,
    };
  }, [reportesFiltrados]);

  const cursos = [
    ...new Map(
      reportes.map((reporte) => [
        reporte.id_curso,
        reporte.curso,
      ])
    ).entries(),
  ];

  const modalidades = [
    ...new Map(
      reportes.map((reporte) => [
        reporte.id_modalidad,
        reporte.modalidad,
      ])
    ).entries(),
  ];

  const anios = [
    ...new Set(
      reportes
        .map((reporte) =>
          reporte.fec_clase_iso?.slice(0, 4)
        )
        .filter(Boolean)
    ),
  ];

  const nombresMeses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const limpiarFiltros = () => {
    setEstado("todos");
    setBusqueda("");
    setCurso("");
    setModalidad("");
    setMes("");
    setAnio("");
  };

  return (
    <div className="ver-reportes-page">
      <div className="ver-reportes-header">
        <div>
          <h1>Mis Reportes</h1>
          <p>
            Consulta el historial de clases que registraste.
          </p>
        </div>

        <button onClick={volver}>
          ← Volver
        </button>
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
          <span>Horas registradas</span>
          <strong>{resumen.horas.toFixed(2)}</strong>
        </div>

        <div className="kpi-card kpi-pago">
          <span>Pago acumulado</span>
          <strong>
            S/ {resumen.pagoTutor.toFixed(2)}
          </strong>
        </div>
      </div>

      <div className="reportes-card">
        <div className="reportes-filtros">
          <select
            value={estado}
            onChange={(evento) =>
              setEstado(evento.target.value)
            }
          >
            <option value="todos">
              Todos los estados
            </option>
            <option value="pendiente">
              Pendientes
            </option>
            <option value="validado">
              Aprobados
            </option>
            <option value="anulado">
              Anulados
            </option>
          </select>

          <input
            placeholder="Buscar por alumno, curso o modalidad..."
            value={busqueda}
            onChange={(evento) =>
              setBusqueda(evento.target.value)
            }
          />

          <select
            value={curso}
            onChange={(evento) =>
              setCurso(evento.target.value)
            }
          >
            <option value="">Todos los cursos</option>

            {cursos.map(([id, nombre]) => (
              <option key={id} value={id}>
                {nombre}
              </option>
            ))}
          </select>

          <select
            value={modalidad}
            onChange={(evento) =>
              setModalidad(evento.target.value)
            }
          >
            <option value="">
              Todas las modalidades
            </option>

            {modalidades.map(([id, nombre]) => (
              <option key={id} value={id}>
                {nombre}
              </option>
            ))}
          </select>

          <select
            value={mes}
            onChange={(evento) =>
              setMes(evento.target.value)
            }
          >
            <option value="">Todos los meses</option>

            {nombresMeses.map((nombre, indice) => {
              const valor = String(indice + 1).padStart(
                2,
                "0"
              );

              return (
                <option key={valor} value={valor}>
                  {nombre}
                </option>
              );
            })}
          </select>

          <select
            value={anio}
            onChange={(evento) =>
              setAnio(evento.target.value)
            }
          >
            <option value="">Todos los años</option>

            {anios.map((valorAnio) => (
              <option
                key={valorAnio}
                value={valorAnio}
              >
                {valorAnio}
              </option>
            ))}
          </select>

          <button onClick={limpiarFiltros}>
            Limpiar
          </button>
        </div>

        <div className="reportes-resumen">
          Reportes encontrados:{" "}
          <strong>{reportesFiltrados.length}</strong>
        </div>

        {loading ? (
          <p>Cargando tus reportes...</p>
        ) : (
          <div className="reportes-table-container">
            <table className="reportes-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Alumno</th>
                  <th>Curso</th>
                  <th>Modalidad</th>
                  <th>Horario</th>
                  <th>Horas</th>
                  <th>Pago tutor</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {reportesFiltrados.map((reporte) => (
                  <tr key={reporte.id}>
                    <td>{reporte.fec_clase}</td>
                    <td>{reporte.alumno}</td>
                    <td>{reporte.curso}</td>
                    <td>{reporte.modalidad}</td>
                    <td>
                      {reporte.hora_inicio} -{" "}
                      {reporte.hora_final}
                    </td>
                    <td>
                      {reporte.horas_calculadas}
                    </td>
                    <td>
                      S/ {reporte.monto_tutor}
                    </td>
                    <td>
                      <span
                        className={`estado-badge ${
                          reporte.estado?.toLowerCase()
                        }`}
                      >
                        {reporte.estado}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-ver-reporte"
                        onClick={() =>
                          setDetalle(reporte)
                        }
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!loading &&
              reportesFiltrados.length === 0 && (
                <div className="sin-reportes">
                  No se encontraron reportes.
                </div>
              )}
          </div>
        )}
      </div>

      {detalle && (
        <div className="reportes-popup-overlay">
          <div className="reportes-popup-card detalle-reporte-card">
            <h2>Detalle del reporte</h2>

            <div className="detalle-grid">
              <div>
                <span>Fecha</span>
                <strong>{detalle.fec_clase}</strong>
              </div>

              <div>
                <span>Estado</span>
                <strong>{detalle.estado}</strong>
              </div>

              <div>
                <span>Alumno</span>
                <strong>{detalle.alumno}</strong>
              </div>

              <div>
                <span>Curso</span>
                <strong>{detalle.curso}</strong>
              </div>

              <div>
                <span>Modalidad</span>
                <strong>{detalle.modalidad}</strong>
              </div>

              <div>
                <span>Horario</span>
                <strong>
                  {detalle.hora_inicio} -{" "}
                  {detalle.hora_final}
                </strong>
              </div>

              <div>
                <span>Horas</span>
                <strong>
                  {detalle.horas_calculadas}
                </strong>
              </div>

              <div>
                <span>Pago</span>
                <strong>
                  S/ {detalle.monto_tutor}
                </strong>
              </div>
            </div>

            <div className="detalle-academico">
              <h3>Información académica</h3>

              <div>
                <span>Tema realizado</span>
                <p>
                  {detalle.detalle?.tema_realizado ||
                    "Sin información"}
                </p>
              </div>

              <div>
                <span>Desarrollo de la clase</span>
                <p>
                  {detalle.detalle?.desarrollo_clase ||
                    "Sin información"}
                </p>
              </div>

              <div>
                <span>Tarea realizada</span>
                <p>
                  {detalle.detalle?.tarea_realizada ||
                    "Sin información"}
                </p>
              </div>

              <div>
                <span>Actitud del estudiante</span>
                <p>
                  {detalle.detalle?.actitud_estudiante ||
                    "Sin información"}
                </p>
              </div>

              <div>
                <span>Logro del estudiante</span>
                <p>
                  {detalle.detalle?.logro_estudiante ||
                    "Sin información"}
                </p>
              </div>

              <div>
                <span>Recomendaciones</span>
                <p>
                  {detalle.detalle?.recomendaciones ||
                    "Sin información"}
                </p>
              </div>
            </div>

            <button onClick={() => setDetalle(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {mensaje && (
        <div className="reportes-popup-overlay">
          <div className="reportes-popup-card">
            <h2>Atención</h2>
            <p>{mensaje}</p>

            <button onClick={() => setMensaje("")}>
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MisReportes;