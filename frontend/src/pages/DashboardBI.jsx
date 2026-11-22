import "../styles/dashboardBI.css";

function DashboardBI() {
  const volver = () => {
    sessionStorage.removeItem("pantalla");
    window.location.reload();
  };

  return (
    <div className="dashboard-bi-page">
      <div className="dashboard-bi-header">
        <div>
          <h1>Dashboard Power BI</h1>
          <p>Reporte FriendTeacher integrado al sistema.</p>
        </div>

        <button onClick={volver}>← Volver</button>
      </div>

      <div className="dashboard-bi-card">
        <iframe title="PB_Reporte_FriendTeacher" width="600" height="373.5" src="https://app.powerbi.com/view?r=eyJrIjoiMzc5Mzk1NzQtOGI1ZS00NDE4LTkwOGEtZWY5ZjlmNDg2OWZkIiwidCI6ImRjMTZmYTc4LWJhNTYtNGM4My1iM2E3LWI2OGMxY2Q1ODZjOCIsImMiOjR9" frameborder="0" allowFullScreen="true"></iframe>
      </div>
    </div>
  );
}

export default DashboardBI;