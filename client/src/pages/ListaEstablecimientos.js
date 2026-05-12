import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "./ListaPersonalSalud.css";

const ListaEstablecimientos = () => {
  const [establecimientos, setEstablecimientos] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [sedeSeleccionada, setSedeSeleccionada] = useState("");
  const [redSeleccionada, setRedSeleccionada] = useState("");
  const [nivelSeleccionado, setNivelSeleccionado] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const obtenerDatos = async () => {
    try {
      const resEst = await axios.get(
        "http://localhost:3001/api/establecimientos/lista"
      );
      setEstablecimientos(resEst.data);

      const resSedes = await axios.get("http://localhost:3001/api/sedes");
      setSedes(resSedes.data);
    } catch (error) {
      console.error("Error al cargar los datos:", error);
      setError("No se pudieron cargar los datos correctamente.");
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  const sedeNombreSeleccionada = useMemo(() => {
    if (!sedeSeleccionada) return "";

    return (
      sedes.find((s) => String(s.idSede) === String(sedeSeleccionada))
        ?.nombreSede || ""
    );
  }, [sedeSeleccionada, sedes]);

  const redesDisponibles = useMemo(() => {
    const establecimientosPorSede = sedeSeleccionada
      ? establecimientos.filter((e) => e.nombreSede === sedeNombreSeleccionada)
      : establecimientos;

    return [
      ...new Set(
        establecimientosPorSede.map((e) => e.nombreRedSalud).filter(Boolean)
      ),
    ].sort();
  }, [establecimientos, sedeSeleccionada, sedeNombreSeleccionada]);

  const nivelesDisponibles = useMemo(() => {
    return [
      ...new Set(
        establecimientos.map((e) => e.clasificacion).filter(Boolean)
      ),
    ].sort();
  }, [establecimientos]);

  const establecimientosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return establecimientos.filter((e) => {
      const coincideNombre = (e.nombreEstablecimiento || "")
        .toLowerCase()
        .includes(texto);

      const coincideSede = sedeSeleccionada
        ? e.nombreSede === sedeNombreSeleccionada
        : true;

      const coincideRed = redSeleccionada
        ? e.nombreRedSalud === redSeleccionada
        : true;

      const coincideNivel = nivelSeleccionado
        ? e.clasificacion === nivelSeleccionado
        : true;

      return coincideNombre && coincideSede && coincideRed && coincideNivel;
    });
  }, [
    establecimientos,
    busqueda,
    sedeSeleccionada,
    sedeNombreSeleccionada,
    redSeleccionada,
    nivelSeleccionado,
  ]);

  const limpiarFiltros = () => {
    setBusqueda("");
    setSedeSeleccionada("");
    setRedSeleccionada("");
    setNivelSeleccionado("");
  };

  const handleSedeChange = (e) => {
    setSedeSeleccionada(e.target.value);
    setRedSeleccionada("");
  };

  const handleEditar = (id) => {
    navigate(`/actualizar-establecimientoSA/${id}`);
  };

  return (
    <Layout>
      <div className="personal-page">
        <div className="personal-header-simple">
          <div>
            <h1>Lista de Establecimientos</h1>
            <p>Visualiza y filtra los establecimientos por sede, red y nivel.</p>
          </div>

          <button
            className="btn-add-top"
            onClick={() => navigate("/registrar-establecimientoSA")}
          >
            + Registrar establecimiento
          </button>
        </div>

        {error && <div className="alert alert-danger text-center">{error}</div>}

        <div className="filters-card">
          <div className="filters-row establecimientos-filters-row">
            <div className="search-control">
              <span className="search-icon">🔎</span>
              <input
                type="text"
                placeholder="Buscar por nombre del establecimiento..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <select
              className="filter-select"
              value={sedeSeleccionada}
              onChange={handleSedeChange}
            >
              <option value="">Todas las sedes</option>
              {sedes.map((sede) => (
                <option key={sede.idSede} value={sede.idSede}>
                  {sede.nombreSede}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={redSeleccionada}
              onChange={(e) => setRedSeleccionada(e.target.value)}
            >
              <option value="">Todas las redes</option>
              {redesDisponibles.map((red) => (
                <option key={red} value={red}>
                  {red}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={nivelSeleccionado}
              onChange={(e) => setNivelSeleccionado(e.target.value)}
            >
              <option value="">Todos los niveles</option>
              {nivelesDisponibles.map((nivel) => (
                <option key={nivel} value={nivel}>
                  {nivel}
                </option>
              ))}
            </select>

            <button className="btn-clear-filters" onClick={limpiarFiltros}>
              Limpiar
            </button>
          </div>

          <div className="filters-summary">
            Mostrando <strong>{establecimientosFiltrados.length}</strong> de{" "}
            <strong>{establecimientos.length}</strong> establecimientos
          </div>
        </div>

        <div className="table-card">
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Nivel E.S.</th>
                  <th>Sede</th>
                  <th>Red de Salud</th>
                  <th className="acciones-col">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {establecimientosFiltrados.length > 0 ? (
                  establecimientosFiltrados.map((establecimiento) => (
                    <tr key={establecimiento.id}>
                      <td className="nombre-simple">
                        {establecimiento.nombreEstablecimiento}
                      </td>

                      <td>{establecimiento.telefono || "Sin registro"}</td>

                      <td>
                        <span className="role-badge rol-default">
                          {establecimiento.clasificacion || "Sin nivel"}
                        </span>
                      </td>

                      <td>
                        <span className="establishment-chip">
                          {establecimiento.nombreSede || "Sin sede"}
                        </span>
                      </td>

                      <td>
                        <span className="establishment-chip">
                          {establecimiento.nombreRedSalud || "Sin red"}
                        </span>
                      </td>

                      <td className="acciones">
                        <button
                          className="icon-btn edit"
                          onClick={() => handleEditar(establecimiento.id)}
                          title="Editar teléfono o nivel"
                        >
                          ✎
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">
                      No se encontraron establecimientos con los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ListaEstablecimientos;