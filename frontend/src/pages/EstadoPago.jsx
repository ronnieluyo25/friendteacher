import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../styles/estadoPago.css";

function EstadoPago() {
  const [reportes, setReportes] = useState([]);
  const [tutor, setTutor] = useState("");
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [detallePeriodo, setDetallePeriodo] = useState(null);

  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");

  const token = sessionStorage.getItem("token");

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

  const volver = () => {
    sessionStorage.removeItem("pantalla");
    window.location.reload();
  };

  const cargarEstadoPago = async () => {
    try {
      setLoading(true);
      setMensaje("");

      const response = await axios.get(
        "/api/reportes/estado-pagos",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTutor(response.data.tutor?.nombre || "");
      setReportes(response.data.reportes || []);
    } catch (error) {
      console.error(error);

      setMensaje(
        error.response?.data?.detail ||
          "No se pudo cargar el estado de pagos."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEstadoPago();
  }, []);

  const aniosDisponibles = useMemo(() => {
    return [
      ...new Set(
        reportes
          .map((reporte) => String(reporte.anio))
          .filter((valor) => valor && valor !== "null")
      ),
    ].sort((a, b) => Number(b) - Number(a));
  }, [reportes]);

  const reportesFiltrados = useMemo(() => {
    return reportes.filter((reporte) => {
      const coincideMes =
        !mes || String(reporte.mes) === mes;

      const coincideAnio =
        !anio || String(reporte.anio) === anio;

      return coincideMes && coincideAnio;
    });
  }, [reportes, mes, anio]);

  const resumen = useMemo(() => {
    const totalHoras = reportesFiltrados.reduce(
      (total, reporte) =>
        total + Number(reporte.horas_calculadas || 0),
      0
    );

    const totalGenerado = reportesFiltrados.reduce(
      (total, reporte) =>
        total + Number(reporte.monto_tutor || 0),
      0
    );

    return {
      reportes: reportesFiltrados.length,
      horas: totalHoras,
      generado: totalGenerado,
    };
  }, [reportesFiltrados]);

  const periodos = useMemo(() => {
    const agrupados = {};

    reportesFiltrados.forEach((reporte) => {
      const clave = `${reporte.anio}-${String(
        reporte.mes
      ).padStart(2, "0")}`;

      if (!agrupados[clave]) {
        agrupados[clave] = {
          clave,
          anio: reporte.anio,
          mes: reporte.mes,
          nombrePeriodo: `${
            nombresMeses[reporte.mes - 1]
          } ${reporte.anio}`,
          cantidadReportes: 0,
          totalHoras: 0,
          totalGenerado: 0,
          reportes: [],
        };
      }

      agrupados[clave].cantidadReportes += 1;

      agrupados[clave].totalHoras += Number(
        reporte.horas_calculadas || 0
      );

      agrupados[clave].totalGenerado += Number(
        reporte.monto_tutor || 0
      );

      agrupados[clave].reportes.push(reporte);
    });

    return Object.values(agrupados).sort(
      (a, b) => b.clave.localeCompare(a.clave)
    );
  }, [reportesFiltrados]);

  const limpiarFiltros = () => {
    setMes("");
    setAnio("");
  };

  return (
    <div className="estado-pago-page">
      <header className="estado-pago-header">
        <div>
          <h1>Estado de Pago</h1>

          <p>
            Consulta tus horas aprobadas y honorarios
            generados.
          </p>

          {tutor && (
            <span className="estado-pago-tutor">
              Tutor: {tutor}
            </span>
          )}
        </div>

        <button
          type="button"
          className="btn-volver-pago"
          onClick={volver}
        >
          ← Volver
        </button>
      </header>

      <section className="estado-pago-kpis">
        <article className="pago-kpi-card">
          <span>Reportes aprobados</span>
          <strong>{resumen.reportes}</strong>
        </article>

        <article className="pago-kpi-card">
          <span>Horas aprobadas</span>
          <strong>{resumen.horas.toFixed(2)}</strong>
        </article>

        <article className="pago-kpi-card pago-kpi-dinero">
          <span>Honorarios generados</span>
          <strong>
            S/ {resumen.generado.toFixed(2)}
          </strong>
        </article>
      </section>

      <section className="estado-pago-card">
        <div className="estado-pago-card-title">
          <div>
            <h2>Resumen por periodo</h2>
            <p>
              Se consideran únicamente reportes aprobados
              por el administrador.
            </p>
          </div>

          <div className="estado-pago-filtros">
            <select
              value={mes}
              onChange={(evento) =>
                setMes(evento.target.value)
              }
            >
              <option value="">Todos los meses</option>

              {nombresMeses.map((nombre, indice) => (
                <option
                  key={nombre}
                  value={indice + 1}
                >
                  {nombre}
                </option>
              ))}
            </select>

            <select
              value={anio}
              onChange={(evento) =>
                setAnio(evento.target.value)
              }
            >
              <option value="">Todos los años</option>

              {aniosDisponibles.map((valor) => (
                <option key={valor} value={valor}>
                  {valor}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={limpiarFiltros}
            >
              Limpiar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="estado-pago-mensaje">
            Cargando estado de pago...
          </div>
        ) : periodos.length === 0 ? (
          <div className="estado-pago-vacio">
            <div className="estado-pago-vacio-icono">
              💰
            </div>

            <h3>No hay honorarios aprobados</h3>

            <p>
              Los reportes aparecerán aquí cuando sean
              aprobados por el administrador.
            </p>
          </div>
        ) : (
          <div className="estado-pago-table-container">
            <table className="estado-pago-table">
              <thead>
                <tr>
                  <th>Periodo</th>
                  <th>Reportes aprobados</th>
                  <th>Horas aprobadas</th>
                  <th>Honorarios generados</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {periodos.map((periodo) => (
                  <tr key={periodo.clave}>
                    <td>
                      <strong>
                        {periodo.nombrePeriodo}
                      </strong>
                    </td>

                    <td>
                      {periodo.cantidadReportes}
                    </td>

                    <td>
                      {periodo.totalHoras.toFixed(2)}
                    </td>

                    <td className="importe-pago">
                      S/{" "}
                      {periodo.totalGenerado.toFixed(2)}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="btn-ver-pago"
                        onClick={() =>
                          setDetallePeriodo(periodo)
                        }
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {detallePeriodo && (
        <div className="pago-modal-overlay">
          <div className="pago-modal">
            <div className="pago-modal-header">
              <div>
                <h2>
                  {detallePeriodo.nombrePeriodo}
                </h2>

                <p>
                  Detalle de reportes aprobados
                </p>
              </div>

              <button
                type="button"
                className="pago-modal-cerrar"
                onClick={() =>
                  setDetallePeriodo(null)
                }
              >
                ×
              </button>
            </div>

            <div className="pago-modal-resumen">
              <div>
                <span>Reportes</span>
                <strong>
                  {detallePeriodo.cantidadReportes}
                </strong>
              </div>

              <div>
                <span>Horas</span>
                <strong>
                  {detallePeriodo.totalHoras.toFixed(2)}
                </strong>
              </div>

              <div>
                <span>Honorarios</span>
                <strong>
                  S/{" "}
                  {detallePeriodo.totalGenerado.toFixed(2)}
                </strong>
              </div>
            </div>

            <div className="pago-detalle-table-container">
              <table className="pago-detalle-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Alumno</th>
                    <th>Curso</th>
                    <th>Modalidad</th>
                    <th>Horario</th>
                    <th>Horas</th>
                    <th>Importe</th>
                  </tr>
                </thead>

                <tbody>
                  {detallePeriodo.reportes.map(
                    (reporte) => (
                      <tr key={reporte.id}>
                        <td>
                          {reporte.fec_clase}
                        </td>

                        <td>{reporte.alumno}</td>

                        <td>{reporte.curso}</td>

                        <td>
                          {reporte.modalidad}
                        </td>

                        <td>
                          {reporte.hora_inicio} -{" "}
                          {reporte.hora_final}
                        </td>

                        <td>
                          {Number(
                            reporte.horas_calculadas
                          ).toFixed(2)}
                        </td>

                        <td className="importe-pago">
                          S/{" "}
                          {Number(
                            reporte.monto_tutor
                          ).toFixed(2)}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="pago-modal-footer">
              <button
                type="button"
                onClick={() =>
                  setDetallePeriodo(null)
                }
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {mensaje && (
        <div className="pago-modal-overlay">
          <div className="pago-mensaje-modal">
            <h2>Atención</h2>
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

export default EstadoPago;