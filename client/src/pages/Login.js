import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [mostrarContrasenia, setMostrarContrasenia] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:3001/api/login?nombreUsuario=${encodeURIComponent(
          nombreUsuario
        )}&contrasenia=${encodeURIComponent(contrasenia)}`
      );
      const data = await response.json();

      if (response.ok) {
        const { rol, idEstablecimiento, establecimiento } = data;
        localStorage.setItem("userRole", rol);
        localStorage.setItem("userEstablecimiento", establecimiento);
        localStorage.setItem("userIdEstablecimiento", idEstablecimiento);

        const roleRoutes = {
          administrador: "/homea",
          medico: "/homeps",
          superadmin: "/homesa",
          enfermero: "/homeps",
        };
        navigate(roleRoutes[rol.toLowerCase()] || "/");

        localStorage.setItem("token", data.token);
        localStorage.setItem("userNombre", data.nombreCorto);
        localStorage.setItem("userRol", data.rol);
        localStorage.setItem("userNombreCompleto", data.nombreCompleto);
        localStorage.setItem("userIdPersona", response.data.idPersona); 
      } else {
        setError(data.error || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setError("Error de conexión, intente nuevamente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title2}>Acceso al Sistema</h2>
          <h2 style={styles.title}>TUBERCULOSIS SEDES</h2>
          <p style={styles.subtitle}>Ingrese sus credenciales para continuar</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Usuario</label>
            <input
              type="text"
              placeholder="Ej: jmedico"
              value={nombreUsuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña</label>
            <div style={styles.passwordWrapper}>
              <input
                type={mostrarContrasenia ? "text" : "password"}
                placeholder="Ingrese su contraseña"
                value={contrasenia}
                onChange={(e) => setContrasenia(e.target.value)}
                style={{ ...styles.input, paddingRight: "40px" }}
                required
              />
              <button
                type="button"
                onClick={() => setMostrarContrasenia(!mostrarContrasenia)}
                style={styles.iconButton}
                title={
                  mostrarContrasenia
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
              >
                {mostrarContrasenia ? (
                  // Icono tipo Material "visibility_off"
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="20"
                    viewBox="0 -960 960 960"
                    width="20"
                    fill="#555"
                  >
                    <path d="M479.823-319Q534-319 574.5-359.688q40.5-40.687 40.5-94.864 0-23-8-44.5t-22-38.5L387.176-404q8.824 40.352 41.824 62.676T479.823-319ZM221-196 171-246l100-100q-58-40-99-90.5T101-454q38-88 121.5-154.5T480-675q61 0 116 18.5T701-604l88-88 50 50-618 546ZM480-255q-134 0-236-73t-143-188q28-72 82-132t122-99q68-39 142-59t145-20q47 0 91 8t86 22l-56 56q-38-9-76-13.5T480-758q-113 0-210 57t-152 147q52 95 145 157t217 62q41 0 80-7t77-22l56 56q-40 19-86 28t-87 9Z" />
                  </svg>
                ) : (
                  // Icono tipo Material "visibility"
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="20"
                    viewBox="0 -960 960 960"
                    width="20"
                    fill="#555"
                  >
                    <path d="M480-316q66 0 113-46.984Q640-409.969 640-476q0-66.031-47-113.016Q546-636 480-636q-66 0-113 46.984Q320-542.031 320-476q0 66.031 47 113.016Q414-316 480-316Zm0-60q-43 0-73.5-30.5T376-480q0-43 30.5-73.5T480-584q43 0 73.5 30.5T584-480q0 43-30.5 73.5T480-376Zm0 160q-134 0-236.5-72T100-476q28-72 82-132t122-99q68-39 142-59t145-20q134 0 236.5 72T860-476q-28 72-82 132t-122 99q-68 39-142 59t-145 20Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

          {error && <p style={styles.error}>{error}</p>}
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(90deg, #82a6d0ff 0%, #1565c0 50% , #82a6d0ff 100%)",
    fontFamily: "'Poppins', sans-serif",
  },
  card: {
    backgroundColor: "#fff",
    padding: "45px 50px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    width: "500px",
    transition: "transform 0.2s ease",
  },
  header: {
    textAlign: "center",
    marginBottom: "25px",
  },
  logo: {
    width: "120px",
    height: "100px",
    marginBottom: "10px",
  },
  title: {
    color: "#1565c0",
    fontWeight: 600,
    fontSize: "20px",
    marginBottom: "4px",
  },title2: {
    color: "#012856ff",
    fontWeight: 600,
    fontSize: "20px",
    marginBottom: "4px",
  },
  subtitle: {
    color: "#777",
    fontSize: "13px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  inputGroup: {
    marginBottom: "18px",
    textAlign: "left",
  },
  label: {
    color: "#555",
    fontWeight: 500,
    fontSize: "14px",
    marginBottom: "6px",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
  },
  passwordWrapper: {
    position: "relative",
  },
  iconButton: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: 0,
  },
  button: {
    backgroundColor: "#1565c0",
    color: "#fff",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    marginTop: "10px",
    transition: "background 0.3s ease",
  },
  buttonHover: {
    backgroundColor: "#012856ff",
  },
  error: {
    color: "#E53935",
    textAlign: "center",
    marginTop: "15px",
    fontSize: "14px",
  },
};

export default Login;
