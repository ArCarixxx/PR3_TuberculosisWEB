// import Layout from '../components/Layout';
import React, { useState } from 'react';
import Signin from '../components/Signin';
import { useNavigate } from 'react-router-dom';


const Login = () => {
    const [nombreUsuario, setNombreUsuario] = useState('');       // Nombre de usuario
    const [contrasenia, setContrasenia] = useState('');       // Contrasenia
    const [error, setError] = useState('');             // Mensajes de error
    const navigate = useNavigate();

    const handleLogin = async (e) => {
      e.preventDefault();
      setError("");
    
      try {
        const response = await fetch(
          `http://localhost:3001/api/login?nombreUsuario=${encodeURIComponent(
            nombreUsuario
          )}&contrasenia=${encodeURIComponent(contrasenia)}`
        );
    
        const data = await response.json();
    
        if (response.ok) {
          const { rol, idEstablecimiento, establecimiento } = data;
    
          // Guardar datos en localStorage
          localStorage.setItem("userRole", rol);
          localStorage.setItem("userEstablecimiento", establecimiento);
          localStorage.setItem("userIdEstablecimiento", idEstablecimiento);
    
          // Redirigir al usuario según su rol
          const roleRoutes = {
            administrador: "/homea",
            medico: "/homeps",
            superadmin: "/homesa"
          };
          navigate(roleRoutes[rol.toLowerCase()] || "/");
        } else {
          setError(data.error || "Credenciales incorrectas");
        }
      } catch (error) {
        console.error("Error al iniciar sesión:", error);
        setError("Error de conexión, intente nuevamente");
      }
    };      
    
    
    return (
        <div>
            <Signin 
                usuario={nombreUsuario} 
                setUsuario={setNombreUsuario} 
                contrasenia={contrasenia} 
                setContrasenia={setContrasenia} 
                handleLogin={handleLogin} />
            {error && <p style={{color: 'red'}}>{error}</p>}
        </div>
    );
};

export default Login;