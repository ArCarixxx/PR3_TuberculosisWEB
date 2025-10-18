import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import "./ListaPersonalSalud.css";

const ListaPersonalSalud = () => {
  const navigate = useNavigate();
  const [personalSalud, setPersonalSalud] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const obtenerPersonalSalud = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/personalSalud");
      setPersonalSalud(response.data);
    } catch (error) {
      console.error("Error al obtener el personal de salud:", error);
    }
  };

  useEffect(() => {
    obtenerPersonalSalud();
  }, []);

  const personalFiltrado = personalSalud.filter((p) =>
    `${p.nombres} ${p.primerApellido} ${p.segundoApellido || ""}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  // Funciones de acción
  const handleEditar = (id) => {
    navigate(`/actualizar-personal-saludSA/${id}`);
  };

  const handleEliminar = (id) => {
    if (window.confirm("¿Seguro que desea eliminar este registro?")) {
      axios
        .delete(`http://localhost:3001/api/personalSalud/${id}`)
        .then(() => obtenerPersonalSalud());
    }
  };

  return (
    <Layout>
      <div className="personal-container">
        <div className="header-section">
          <h1>Lista de Personal de Salud</h1>
          <p>Panel de gestión del personal registrado en el sistema.</p>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Nombre Completo</th>
                <th>Rol</th>
                <th>Celular</th>
                <th>CI.</th>
                <th>Establecimiento</th>
                <th className="acciones-col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {personalFiltrado.length > 0 ? (
                personalFiltrado.map((p) => (
                  <tr key={p.idPersona}>
                    <td>{`${p.nombres} ${p.primerApellido} ${p.segundoApellido || ""}`}</td>
                    <td>{p.rol}</td>
                    <td>{p.numeroCelular}</td>
                    <td>{p.CI}</td>
                    <td>{p.nombreEstablecimiento}</td>
                    <td className="acciones">
                      <button
                        className="icon-btn edit"
                        onClick={() => handleEditar(p.idPersona)}
                        title="Editar"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                        </svg>
                      </button>

                      <button
                        className="icon-btn delete"
                        onClick={() => handleEliminar(p.idPersona)}
                        title="Eliminar"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-2 14H7L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-data">
                    No se encontraron registros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="actions">
          <button
            className="btn-action add"
            onClick={() => navigate("/registrar-personal-saludSA")}
          >
            Añadir Nuevo Personal
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ListaPersonalSalud;
