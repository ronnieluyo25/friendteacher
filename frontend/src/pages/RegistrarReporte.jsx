import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/registrarReporte.css";

function RegistrarReporte() {
  const [alumnos, setAlumnos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [modalidades, setModalidades] = useState([]);

  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("info");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id_alumno: "",
    id_curso: "",
    id_modalidad: "",
    fec_clase: "",
    hora_inicio: "",
    hora_final: "",
    tema_realizado: "",
    tarea_realizada: "",
    desarrollo_clase: "",
    actitud_estudiante: "",
    logro_estudiante: "",
    recomendaciones: "",
  });

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    cargarDatos();
  }, []);

  const volver = () => {
    sessionStorage.removeItem("pantalla");
    window.location.reload();
  };

  const cargarDatos = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const alumnosRes = await axios.get("/api/alumnos/", config);
      const cursosRes = await axios.get("/api/cursos/", config);
      const modalidadesRes = await axios.get("/api/modalidades/", config);

      setAlumnos(alumnosRes.data);
      setCursos(cursosRes.data);
      setModalidades(modalidadesRes.data);
    } catch (error) {
      setTipoMensaje("error");
      setMensaje("No se pudieron cargar los datos iniciales.");
    }
  };

  const manejarCambio = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const calcularHoras = () => {
    if (!form.hora_inicio || !form.hora_final) return null;

    const [hiH, hiM] = form.hora_inicio.split(":").map(Number);
    const [hfH, hfM] = form.hora_final.split(":").map(Number);

    const inicioMin = hiH * 60 + hiM;
    let finalMin = hfH * 60 + hfM;

    if (finalMin <= inicioMin) {
      finalMin += 24 * 60;
    }

    const diferenciaMin = finalMin - inicioMin;
    const horas = diferenciaMin / 60;

    return horas;
  };

  const validarHoras = () => {
    if (!form.hora_inicio || !form.hora_final) {
      setTipoMensaje("error");
      setMensaje("Debe ingresar la hora de inicio y la hora final.");
      return false;
    }

    const [hiH] = form.hora_inicio.split(":").map(Number);
    const [hfH] = form.hora_final.split(":").map(Number);

    const horas = calcularHoras();

    if (horas <= 0) {
      setTipoMensaje("error");
      setMensaje("Verifique la hora de inicio y la hora final.");
      return false;
    }

    if (form.hora_final < form.hora_inicio && hiH < 20) {
      setTipoMensaje("error");
      setMensaje("La hora final debe ser mayor que la hora de inicio. Verifique la hora.");
      return false;
    }

    if (horas > 4) {
      setTipoMensaje("error");
      setMensaje("La duración máxima permitida para una clase es de 4 horas.");
      return false;
    }

    return true;
  };

  const validarFormulario = () => {
    if (
      !form.id_alumno ||
      !form.id_curso ||
      !form.id_modalidad ||
      !form.fec_clase ||
      !form.tema_realizado ||
      !form.actitud_estudiante
    ) {
      setTipoMensaje("error");
      setMensaje("Complete los campos obligatorios antes de guardar.");
      return false;
    }

    return validarHoras();
  };

  const guardarReporte = async () => {
    if (loading) return;

    if (!validarFormulario()) return;

    try {
      setLoading(true);

      const data = {
        ...form,
        id_alumno: Number(form.id_alumno),
        id_curso: Number(form.id_curso),
        id_modalidad: Number(form.id_modalidad),
        hora_inicio: form.hora_inicio + ":00",
        hora_final: form.hora_final + ":00",
      };

      const response = await axios.post(
        "/api/reportes/",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTipoMensaje("success");
      setMensaje(
        `Reporte registrado correctamente. Horas: ${response.data.horas_calculadas} | Pago tutor: S/ ${response.data.monto_tutor} | Cobro alumno: S/ ${response.data.monto_alumno}`
      );

      setForm({
        id_alumno: "",
        id_curso: "",
        id_modalidad: "",
        fec_clase: "",
        hora_inicio: "",
        hora_final: "",
        tema_realizado: "",
        tarea_realizada: "",
        desarrollo_clase: "",
        actitud_estudiante: "",
        logro_estudiante: "",
        recomendaciones: "",
      });
    } catch (error) {
      setTipoMensaje("error");
      setMensaje("Error al registrar reporte. Verifique la información.");
    } finally {
      setLoading(false);
    }
  };

  const horasCalculadas = calcularHoras();

  return (
    <div className="reporte-page">
      {mensaje && (
        <div className="reporte-popup-overlay">
          <div className="reporte-popup-card">
            <div className={`reporte-popup-icon ${tipoMensaje}`}>
              {tipoMensaje === "success" ? "✅" : "⚠️"}
            </div>

            <h2>{tipoMensaje === "success" ? "Correcto" : "Atención"}</h2>
            <p>{mensaje}</p>

            <button onClick={() => setMensaje("")}>Aceptar</button>
          </div>
        </div>
      )}

      <div className="reporte-header">
        <div>
          <h1>Registrar Reporte</h1>
          <p>Completa la información de la clase realizada.</p>
        </div>

        <button onClick={volver}>← Volver</button>
      </div>

      <div className="reporte-card">
        <div className="reporte-section">
          <h2>Información general</h2>
          <p>Datos principales de la clase registrada.</p>
        </div>

        <div className="reporte-grid">
          <div className="reporte-group">
            <label>Alumno *</label>
            <select name="id_alumno" value={form.id_alumno} onChange={manejarCambio}>
              <option value="">Seleccione alumno</option>
              {alumnos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre} {a.apellido}
                </option>
              ))}
            </select>
          </div>

          <div className="reporte-group">
            <label>Curso *</label>
            <select name="id_curso" value={form.id_curso} onChange={manejarCambio}>
              <option value="">Seleccione curso</option>
              {cursos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.curso || c.des_curso}
                </option>
              ))}
            </select>
          </div>

          <div className="reporte-group">
            <label>Modalidad *</label>
            <select name="id_modalidad" value={form.id_modalidad} onChange={manejarCambio}>
              <option value="">Seleccione modalidad</option>
              {modalidades.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.modalidad || m.des_modalidad}
                </option>
              ))}
            </select>
          </div>

          <div className="reporte-group">
            <label>Fecha de clase *</label>
            <input type="date" name="fec_clase" value={form.fec_clase} onChange={manejarCambio} />
          </div>

          <div className="reporte-group">
            <label>Hora inicio *</label>
            <input type="time" name="hora_inicio" value={form.hora_inicio} onChange={manejarCambio} />
          </div>

          <div className="reporte-group">
            <label>Hora final *</label>
            <input type="time" name="hora_final" value={form.hora_final} onChange={manejarCambio} />
          </div>
        </div>

        <div className="duracion-box">
          <span>Duración calculada</span>
          <strong>
            {horasCalculadas ? `${horasCalculadas.toFixed(2)} horas` : "Pendiente"}
          </strong>
        </div>

        <div className="reporte-section">
          <h2>Desarrollo académico</h2>
          <p>Detalle de lo realizado durante la clase.</p>
        </div>

        <div className="reporte-group full">
          <label>Tema realizado *</label>
          <input
            name="tema_realizado"
            value={form.tema_realizado}
            onChange={manejarCambio}
            maxLength="120"
          />
        </div>

        <div className="reporte-group full">
          <label>Desarrollo de clase</label>
          <textarea
            name="desarrollo_clase"
            value={form.desarrollo_clase}
            onChange={manejarCambio}
            maxLength="1000"
          />
          <small>{form.desarrollo_clase.length}/1000</small>
        </div>

        <div className="reporte-group full">
          <label>Tarea realizada</label>
          <input
            name="tarea_realizada"
            value={form.tarea_realizada}
            onChange={manejarCambio}
          />
        </div>

        <div className="reporte-section">
          <h2>Evaluación del estudiante</h2>
          <p>Seguimiento del desempeño observado.</p>
        </div>

        <div className="reporte-grid two">
          <div className="reporte-group">
            <label>Actitud del estudiante *</label>
            <select
              name="actitud_estudiante"
              value={form.actitud_estudiante}
              onChange={manejarCambio}
            >
              <option value="">Seleccione</option>
              <option value="Excelente">Excelente</option>
              <option value="Muy buena">Muy buena</option>
              <option value="Buena">Buena</option>
              <option value="Regular">Regular</option>
              <option value="Deficiente">Deficiente</option>
            </select>
          </div>

          <div className="reporte-group">
            <label>Logro del estudiante</label>
            <input
              name="logro_estudiante"
              value={form.logro_estudiante}
              onChange={manejarCambio}
            />
          </div>
        </div>

        <div className="reporte-group full">
          <label>Recomendaciones</label>
          <textarea
            name="recomendaciones"
            value={form.recomendaciones}
            onChange={manejarCambio}
            maxLength="1000"
          />
          <small>{form.recomendaciones.length}/1000</small>
        </div>

        <div className="reporte-actions">
          <button className="btn-reporte-cancelar" onClick={volver}>
            Cancelar
          </button>

          <button className="btn-reporte-guardar" onClick={guardarReporte} disabled={loading}>
            {loading ? "Guardando..." : "Guardar Reporte"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegistrarReporte;