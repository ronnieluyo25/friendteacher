import "../styles/dashboard.css";

function TutorDashboard() {

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
      titulo: "Registrar Reporte",
      descripcion:
        "Registra las clases realizadas con tus alumnos.",
      icono: "📝",
      color: "purple",
      pantalla: "registrar_reporte"
    },

    {
      titulo: "Mis Reportes",
      descripcion:
        "Consulta el historial de reportes enviados.",
      icono: "📄",
      color: "blue",
      pantalla: "mis_reportes"
    },

    {
      titulo: "Estado de Pago",
      descripcion:
        "Consulta tus horas aprobadas y honorarios generados.",
      icono: "💰",
      color: "green",
      pantalla: "estado_pago",
    },

    {
      titulo: "Mi Horario",
      descripcion:
        "Visualiza tus clases programadas.",
      icono: "📅",
      color: "orange",
      pantalla: "mi_horario"
    },

    {
      titulo: "Mi Perfil",
      descripcion:
        "Consulta y actualiza tus datos personales.",
      icono: "👤",
      color: "purple",
      pantalla: "mi_perfil",
    },

    {
      titulo: "Mi Resumen",
      descripcion:
        "Visualiza estadísticas de tus clases.",
      icono: "📊",
      color: "orange",
      pantalla: "dashboard_tutor"
    }

  ];

  return (

    <div className="admin-page">

      <div className="admin-header">

        <div className="admin-header-left">

          <div className="admin-logo">
            👨‍🏫
          </div>

          <div>

            <h1>Panel del Tutor</h1>

            <p>
              Bienvenido a FriendTeacher
            </p>

          </div>

        </div>

        <button
          className="btn-logout"
          onClick={cerrarSesion}
        >
          Cerrar sesión
        </button>

      </div>

      <div className="admin-grid">

        {

          opciones.map((opcion) => (

            <div
              key={opcion.titulo}
              className="admin-card"
              onClick={() => cambiarPantalla(opcion.pantalla)}
            >

              <div
                className={`admin-card-icon ${opcion.color}`}
              >
                {opcion.icono}
              </div>

              <h3>{opcion.titulo}</h3>

              <p>{opcion.descripcion}</p>

              <div
                className={`admin-card-arrow ${opcion.color}`}
              >
                →
              </div>

            </div>

          ))

        }

      </div>

    </div>

  );

}

export default TutorDashboard;