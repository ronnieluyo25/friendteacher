import AdminDashboard from "./AdminDashboard";
import TutorDashboard from "./TutorDashboard";
import AlumnoDashboard from "./AlumnoDashboard";

function Dashboard() {

  const rol = Number(
    sessionStorage.getItem("id_rol")
  );

  if (rol === 1) return <AdminDashboard />;
  if (rol === 2) return <TutorDashboard />;
  if (rol === 3) return <AlumnoDashboard />;

  return (
    <h1>
      Rol no reconocido: {sessionStorage.getItem("id_rol")}
    </h1>
  );
}

export default Dashboard;