import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RegistrarReporte from "./pages/RegistrarReporte";
import CrearUsuario from "./pages/CrearUsuario";
import ListaTutores from "./pages/ListaTutores";
import ListaAlumnos from "./pages/ListaAlumnos";
import VerReportes from "./pages/VerReportes";
import DashboardBI from "./pages/DashboardBI";

import MisReportes from "./pages/MisReportes";
import EstadoPago from "./pages/EstadoPago";
import MiPerfilTutor from "./pages/MiPerfilTutor";

function App() {

  const token = sessionStorage.getItem("token");
  const pantalla = sessionStorage.getItem("pantalla");
  const rol = Number(sessionStorage.getItem("id_rol"));
  

  if (!token) {
    return <Login />;
  }

  if (pantalla === "registrar_reporte") {
    return <RegistrarReporte />;
  }

  if (pantalla === "crear_usuario") {
  return <CrearUsuario />;
  }

  if (pantalla === "lista_tutores") {
  return <ListaTutores />;
  }

  if (pantalla === "lista_alumnos") {
  return <ListaAlumnos />;
  }

  if (pantalla === "ver_reportes") {
  return <VerReportes />;
  }

  if (pantalla === "dashboard_bi") {
    return <DashboardBI />;
  }

  if (
  pantalla === "mis_reportes" &&
  Number(sessionStorage.getItem("id_rol")) === 2
  ) {
    return <MisReportes />;
  }

  if (
    pantalla === "estado_pago" &&
    rol === 2
  ) {
    return <EstadoPago />;
  }

  if (
  pantalla === "mi_perfil" &&
  rol === 2
  ) {
    return <MiPerfilTutor />;
  }

  return <Dashboard />;
}

export default App;