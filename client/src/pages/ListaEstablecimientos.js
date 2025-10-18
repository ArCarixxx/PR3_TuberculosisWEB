import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "./ListaPersonalSalud.css"; // reutilizamos el mismo estilo moderno de tablas

const ListaEstablecimientos = () => {
  const [establecimientos, setEstablecimientos] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [redesSalud, setRedesSalud] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [sedeSeleccionada, setSedeSeleccionada] = useState("");
  const [redSeleccionada, setRedSeleccionada] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener establecimientos
        const resEst = await axios.get("http://localhost:3001/api/establecimientos/lista");
        setEstablecimientos(resEst.data);

        // Obtener sedes
        const resSedes = await axios.get("http://localhost:3001/api/sedes");
        setSedes(resSedes.data);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        setError("No se pudieron cargar los datos correctamente.");
      }
    };
    fetchData();
  }, []);

  // --- Filtrado ---
  const establecimientosFiltrados = establecimientos.filter((e) => {
    const coincideNombre = e.nombreEstablecimiento
      ?.toLowerCase()
      .includes(busqueda.toLowerCase());
    const coincideSede = sedeSeleccionada
      ? e.nombreSede === sedes.find((s) => s.idSede === parseInt(sedeSeleccionada))?.nombreSede
      : true;
    return coincideNombre && coincideSede;
  });

  return (
    <Layout>
      <div className="personal-container">
        <div className="header-section">
          <h1>Lista de Establecimientos</h1>
          <p>Visualiza y filtra los establecimientos por Sede y Red de Salud.</p>
        </div>

        {error && <div className="alert alert-danger text-center">{error}</div>}

        {/* Filtros */}
        <div className="filters-container mb-4">
          
          <div className="filter-group">
            <label className="fw-semibold">Sede:</label>
            <select
              className="form-select"
              value={sedeSeleccionada}
              onChange={(e) => setSedeSeleccionada(e.target.value)}
            >
              <option value="">Todas las sedes</option>
              {sedes.map((sede) => (
                <option key={sede.idSede} value={sede.idSede}>
                  {sede.nombreSede}
                </option>
              ))}
            </select>
          </div>


          <div className="filter-group search">
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

        </div>

        {/* Tabla */}
        <div className="table-container">
          <table className="custom-table">
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
              {establecimientosFiltrados.length > 0 ? (
                establecimientosFiltrados.map((establecimiento) => (
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
                  <td colSpan="5" className="no-data">
                    No se encontraron establecimientos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Botón */}
        <div className="actions">
          <button
            className="btn-action add"
            onClick={() => navigate("/registrar-establecimientoSA")}
          >
            Registrar Nuevo Establecimiento
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ListaEstablecimientos;
