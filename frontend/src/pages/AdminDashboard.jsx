import "../styles/dashboard.css";

function AdminDashboard() {
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
      titulo: "Crear usuario",
      descripcion: "Registra tutores, alumnos o usuarios del sistema.",
      icono: "➕",
      color: "orange",
      pantalla: "crear_usuario",
    },
    {
      titulo: "Lista de Tutores",
      descripcion: "Gestiona y visualiza la información de los tutores.",
      icono: "👨‍🏫",
      color: "blue",
      pantalla: "lista_tutores",
    },
    {
      titulo: "Lista de Alumnos",
      descripcion: "Gestiona y visualiza la información de los alumnos.",
      icono: "🎓",
      color: "green",
      pantalla: "lista_alumnos",
    },
    {
      titulo: "Registrar Reporte",
      descripcion: "Crea reportes académicos de clases realizadas.",
      icono: "📝",
      color: "purple",
      pantalla: "registrar_reporte",
    },
    {
      titulo: "Ver Reportes",
      descripcion: "Consulta y administra los reportes registrados.",
      icono: "📄",
      color: "orange",
      pantalla: "ver_reportes",
    },
    {
      titulo: "Dashboard",
      descripcion: "Visualiza estadísticas generales del sistema.",
      icono: "📊",
      color: "blue",
      pantalla: "dashboard_bi",
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-left">
          <div className="admin-logo">🎓</div>

          <div>
            <h1>Panel Administrador</h1>
            <p>Bienvenido a FriendTeacher</p>
          </div>
        </div>

        <button className="btn-logout" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </div>

      <div className="admin-grid">
        {opciones.map((opcion) => (
          <div
            className="admin-card"
            key={opcion.titulo}
            onClick={() => cambiarPantalla(opcion.pantalla)}
          >
            <div className={`admin-card-icon ${opcion.color}`}>
              {opcion.icono}
            </div>

            <h3>{opcion.titulo}</h3>

            <p>{opcion.descripcion}</p>

            <div className={`admin-card-arrow ${opcion.color}`}>
              →
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;