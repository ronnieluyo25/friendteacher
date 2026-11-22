import "../styles/dashboard.css";

function AlumnoDashboard() {
  const cerrarSesion = () => {
    sessionStorage.clear();
    window.location.reload();
  };

  const cambiarPantalla = (pantalla) => {
    sessionStorage.setItem("pantalla", pantalla);
    window.location.reload();
  };

  const opciones = [
    {
      titulo: "Estado de Pago",
      descripcion: "Consulta tus pagos pendientes y realizados.",
      icono: "💰",
      color: "green",
      pantalla: "estado_pago_alumno",
    },
    {
      titulo: "Mis Clases",
      descripcion: "Visualiza el historial de tus clases registradas.",
      icono: "📚",
      color: "blue",
      pantalla: "mis_clases",
    },
    {
      titulo: "Material Adicional",
      descripcion: "Accede a recursos y materiales de apoyo.",
      icono: "📁",
      color: "orange",
      pantalla: "material_adicional",
    },
    {
      titulo: "Mis Reportes",
      descripcion: "Revisa los reportes asociados a tus clases.",
      icono: "📄",
      color: "purple",
      pantalla: "reportes_alumno",
    },
    {
      titulo: "Mi Horario",
      descripcion: "Consulta tus clases programadas.",
      icono: "📅",
      color: "orange",
      pantalla: "horario_alumno",
    },
    {
      titulo: "Mi Perfil",
      descripcion: "Consulta y actualiza tu información personal.",
      icono: "👤",
      color: "blue",
      pantalla: "perfil_alumno",
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-left">
          <div className="admin-logo">🎓</div>

          <div>
            <h1>Panel del Alumno</h1>
            <p>Consulta tus clases, pagos y material adicional.</p>
          </div>
        </div>

        <button className="btn-logout" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </div>

      <div className="admin-grid">
        {opciones.map((opcion) => (
          <div
            key={opcion.titulo}
            className="admin-card"
            onClick={() => cambiarPantalla(opcion.pantalla)}
          >
            <div className={`admin-card-icon ${opcion.color}`}>
              {opcion.icono}
            </div>

            <h3>{opcion.titulo}</h3>
            <p>{opcion.descripcion}</p>

            <div className={`admin-card-arrow ${opcion.color}`}>→</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AlumnoDashboard;