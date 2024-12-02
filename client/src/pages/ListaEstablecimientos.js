import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const ListaEstablecimientos = () => {
  const [establecimientos, setEstablecimientos] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const userRole = localStorage.getItem("userRole");
  const userEstablecimiento = localStorage.getItem("userEstablecimiento");
  const userIdEstablecimiento = localStorage.getItem("userIdEstablecimiento");

  console.log(`Rol: ${userRole}, Establecimiento: ${userEstablecimiento}, IdEstablecimiento: ${userIdEstablecimiento}`);


  useEffect(() => {
    const fetchEstablecimientos = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/establecimientosLista');
        console.log('Respuesta de los establecimientos:', response.data);
        setEstablecimientos(response.data);
      } catch (error) {
        console.error('Error al obtener los establecimientos:', error);
        setError('No se pudieron cargar los establecimientos');
      }
    };

    fetchEstablecimientos();
  }, []);

  return (
    <Layout>
      <div className="container mt-5">
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Lista de Establecimientos Registrados</h2>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Atrás
          </button>
        </div>
        <table className="table table-striped mt-3">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Nivel E.S.</th>
              <th>Sede</th>
              <th>Red de Salud</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(establecimientos) && establecimientos.length > 0 ? (
              establecimientos.map((establecimiento) => (
                <tr key={establecimiento.id}>
                  <td>{establecimiento.nombreEstablecimiento}</td>
                  <td>{establecimiento.telefono}</td>
                  <td>{establecimiento.clasificacion}</td>
                  <td>{establecimiento.nombreSede}</td>
                  <td>{establecimiento.nombreRedSalud}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No se encontraron establecimientos</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default ListaEstablecimientos;
