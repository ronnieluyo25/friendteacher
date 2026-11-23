import { useState } from "react";
import axios from "axios";
import "../styles/login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const iniciarSesion = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const response = await axios.post(
        "/api/auth/login",
        formData
      );

      sessionStorage.setItem("token", response.data.access_token);
      sessionStorage.setItem("id_rol", response.data.id_rol);
      sessionStorage.setItem("username", response.data.username);

      window.location.reload();
    } catch (err) {
      setError("Usuario o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  const enter = (e) => {
    if (e.key === "Enter") {
      iniciarSesion();
    }
  };

  return (
    <>
      {error && (
        <div className="popup-overlay">
          <div className="popup-card">

            <div className="popup-icon">
              ⚠️
            </div>

            <h2>Acceso denegado</h2>

            <p>{error}</p>

            <button
              className="popup-button"
              onClick={() => setError("")}
            >
              Aceptar
            </button>

          </div>
        </div>
      )}

      <div className="login-modern-page">
        <div className="login-modern-card">

          <div className="login-brand">

            <div className="brand-logo-row">
              <div className="brand-icon">🎓</div>
              <h1>FRIENDTEACHER</h1>
            </div>

            <h2>
              TU CLASE,<br />
              TU <span>REPORTE,</span><br />
              TU CONTROL.
            </h2>

            <p>
              Portal académico para tutores, alumnos y administradores.
              Gestiona reportes, pagos y seguimiento en un solo lugar.
            </p>

            <div className="brand-stats">

              <div>
                <strong>100%</strong>
                <small>CONTROL</small>
              </div>

              <div>
                <strong>24/7</strong>
                <small>DISPONIBLE</small>
              </div>

              <div>
                <strong>S/</strong>
                <small>PAGOS</small>
              </div>

            </div>

          </div>

          <div className="login-form-area">

            <h2>BIENVENIDO</h2>

            <p>
              Ingresa tu usuario y contraseña para acceder a tu panel.
            </p>

            <label>Usuario</label>

            <input
              placeholder="Ej: admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={enter}
            />

            <label>Contraseña</label>

            <input
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={enter}
            />

            <button
              onClick={iniciarSesion}
              disabled={loading}
            >
              {loading ? "Verificando credenciales..." : "Ingresar →"}
            </button>

          </div>

        </div>
      </div>
    </>
  );
}

export default Login;