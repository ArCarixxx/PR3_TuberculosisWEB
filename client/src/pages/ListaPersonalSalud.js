import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/LayoutAdmin";
import "./ListaPersonalSalud.css";

const ListaPersonalSaludEstablecimiento = () => {
  const navigate = useNavigate();

  const [personalSalud, setPersonalSalud] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("");

  const userEstablecimiento =
    localStorage.getItem("userEstablecimiento") || "Establecimiento";

  const userIdEstablecimiento =
    localStorage.getItem("userIdEstablecimiento");

  // OBTENER PERSONAL
  const obtenerPersonalSalud = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/api/personalSalud/establecimiento",
        {
          params: {
            userIdEstablecimiento,
          },
        }
      );

      setPersonalSalud(response.data);
    } catch (error) {
      console.error("Error al obtener el personal:", error);
    }
  };

  useEffect(() => {
    obtenerPersonalSalud();
  }, []);

  // ROLES DISPONIBLES
  const rolesDisponibles = useMemo(() => {
    return [...new Set(personalSalud.map((p) => p.rol).filter(Boolean))].sort();
  }, [personalSalud]);

  // FILTRADO
  const personalFiltrado = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return personalSalud.filter((p) => {
      const nombreCompleto =
        `${p.nombres} ${p.primerApellido} ${p.segundoApellido || ""}`.toLowerCase();

      const coincideBusqueda =
        nombreCompleto.includes(texto) ||
        (p.CI || "").toLowerCase().includes(texto) ||
        (p.numeroCelular || "").toLowerCase().includes(texto);

      const coincideRol = filtroRol ? p.rol === filtroRol : true;

      return coincideBusqueda && coincideRol;
    });
  }, [personalSalud, busqueda, filtroRol]);

  // LIMPIAR FILTROS
  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroRol("");
  };

  // EDITAR
  const handleEditar = (id) => {
    navigate(`/actualizar-personal-salud/${id}`);
  };

  // ELIMINAR
  const handleEliminar = async (id) => {
    if (window.confirm("¿Seguro que desea eliminar este registro?")) {
      try {
        await axios.delete(
          `http://localhost:3001/api/personalSalud/${id}`
        );

        obtenerPersonalSalud();
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  // COLORES DE ROL
  const getRolClass = (rol = "") => {
    const rolLower = rol.toLowerCase();

    if (rolLower.includes("admin")) return "rol-admin";
    if (rolLower.includes("medico") || rolLower.includes("médico"))
      return "rol-medico";
    if (rolLower.includes("enfer")) return "rol-enfermera";

    return "rol-default";
  };

  return (
    <Layout>
      <div className="personal-page">
        {/* HEADER */}
        <div className="personal-header-simple">
          <div>
            <h1>Lista de Personal de Salud</h1>

            <p>
              Establecimiento:
              <span className="establecimiento-title">
                {userEstablecimiento}
              </span>
            </p>
          </div>

          <button
            className="btn-add-top"
            onClick={() => navigate("/registrar-personal-salud")}
          >
            + Añadir personal
          </button>
        </div>

        {/* FILTROS */}
        <div className="filters-card">
          <div className="filters-row">
            <div className="search-control">
              <span className="search-icon">🔎</span>

              <input
                type="text"
                placeholder="Buscar por nombre, CI o celular..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <select
              className="filter-select"
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
            >
              <option value="">Todos los roles</option>

              {rolesDisponibles.map((rol) => (
                <option key={rol} value={rol}>
                  {rol}
                </option>
              ))}
            </select>

            <button
              className="btn-clear-filters"
              onClick={limpiarFiltros}
            >
              Limpiar
            </button>
          </div>

          <div className="filters-summary">
            Mostrando <strong>{personalFiltrado.length}</strong> de{" "}
            <strong>{personalSalud.length}</strong> registros
          </div>
        </div>

        {/* TABLA */}
        <div className="table-card">
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Nombre completo</th>
                  <th>Rol</th>
                  <th>Celular</th>
                  <th>CI</th>
                  <th className="acciones-col">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {personalFiltrado.length > 0 ? (
                  personalFiltrado.map((p) => {
                    const nombreCompleto = `${p.nombres} ${
                      p.primerApellido
                    } ${p.segundoApellido || ""}`.trim();

                    return (
                      <tr key={p.idPersona}>
                        <td className="name-cell">
                          <div className="mini-avatar">
                            {p.nombres?.charAt(0)?.toUpperCase() || "U"}
                          </div>

                          <span>{nombreCompleto}</span>
                        </td>

                        <td>
                          <span
                            className={`role-badge ${getRolClass(p.rol)}`}
                          >
                            {p.rol}
                          </span>
                        </td>

                        <td>{p.numeroCelular}</td>

                        <td>{p.CI}</td>

                        <td className="acciones">
                          <button
                            className="icon-btn edit"
                            onClick={() => handleEditar(p.idPersona)}
                            title="Editar"
                          >
                            ✎
                          </button>

                          <button
                            className="icon-btn delete"
                            onClick={() => handleEliminar(p.idPersona)}
                            title="Eliminar"
                          >
                            🗑
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">
                      No se encontraron registros con los filtros seleccionados.
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

export default ListaPersonalSaludEstablecimiento;