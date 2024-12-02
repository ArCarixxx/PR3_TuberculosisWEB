import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from "../components/LayoutAdmin";

const ListaPersonalSalud = () => {
  const navigate = useNavigate();
  const [personalSalud, setPersonalSalud] = useState([]);

  
  const userRole = localStorage.getItem("userRole");
  const userEstablecimiento = localStorage.getItem("userEstablecimiento");
  const userIdEstablecimiento = localStorage.getItem("userIdEstablecimiento");

  console.log(`Rol: ${userRole}, Establecimiento: ${userEstablecimiento}, IdEstablecimiento: ${userIdEstablecimiento}`);

  // Función para obtener el personal de salud desde la API
  const obtenerPersonalSalud = async () => {
  try {
    const response = await axios.get('http://localhost:3001/api/personalSaludEstablecimiento', {
      params: { userIdEstablecimiento, search: '' } // Enviar userIdEstablecimiento como parámetro
    });
    
    console.log("Datos filtrados:", response.data);
    setPersonalSalud(response.data); // Guardar los datos obtenidos en el estado
  } catch (error) {
    console.error('Error al obtener el personal de salud:', error);
  }
};

  // Llamar a la función para obtener los datos cuando el componente se monta
  useEffect(() => {
    obtenerPersonalSalud();
  }, []);

  return (
    <Layout>
    <div className="container mt-5">
      <h1 className="text-center mb-4">Lista de Personal de Salud</h1>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Celular</th>
          </tr>
        </thead>
        <tbody>
          {personalSalud.map((personal) => (
            <tr key={personal.idPersona}>
              <td>{`${personal.nombres} ${personal.primerApellido} ${personal.segundoApellido || ''}`}</td>
              <td>{personal.rol}</td>
              <td>{personal.numeroCelular}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="d-flex justify-content-center mt-4">
      <button className="btn btn-primary me-2" onClick={() => navigate('/registrar-personal-salud')}>
        Añadir Nuevo Personal de Salud
      </button>
      <button className="btn btn-primary" onClick={() => navigate('/actualizar-personal-salud')}>
        Actualizar Personal de Salud
      </button>
    </div>

    </div>
    </Layout> 
  );
};

export default ListaPersonalSalud;
