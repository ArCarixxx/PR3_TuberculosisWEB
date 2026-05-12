import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/LayoutPersonalSalud";
import "./ListaPersonalSalud.css";

const ListaPacientesAdmin = () => {
  const navigate = useNavigate();

  const userEstablecimiento =
    localStorage.getItem("userEstablecimiento") || "Establecimiento";

  const userIdEstablecimiento = localStorage.getItem("userIdEstablecimiento");

  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCriterio, setFiltroCriterio] = useState("");
  const [filtroSexo, setFiltroSexo] = useState("");
  const [filtroTipoExtra, setFiltroTipoExtra] = useState("");
  const [filtroEdad, setFiltroEdad] = useState("");

  const obtenerPacientes = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/pacientesEst?userIdEstablecimiento=${userIdEstablecimiento}`
      );

      setPacientes(response.data);
    } catch (error) {
      console.error("Error al obtener pacientes:", error);
    }
  };

  useEffect(() => {
    obtenerPacientes();
  }, [userIdEstablecimiento]);

  const formatDate = (date) => {
    if (!date) return "Sin registro";
    return new Date(date).toLocaleDateString("es-BO");
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return null;

    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  };

  const criteriosDisponibles = useMemo(() => {
    return [
      ...new Set(pacientes.map((p) => p.criterioIngreso).filter(Boolean)),
    ].sort();
  }, [pacientes]);

  const sexosDisponibles = useMemo(() => {
    return [...new Set(pacientes.map((p) => p.sexo).filter(Boolean))].sort();
  }, [pacientes]);

  const tiposExtraDisponibles = useMemo(() => {
    return [
      ...new Set(pacientes.map((p) => p.tipoExtrapulmonar).filter(Boolean)),
    ].sort();
  }, [pacientes]);

  const criterioEsExtrapulmonar = filtroCriterio
    .toLowerCase()
    .includes("extrapulmonar");

  const pacientesFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return pacientes.filter((p) => {
      const nombreCompleto = (p.nombreCompleto || "").toLowerCase();
      const ci = (p.CI || "").toLowerCase();

      const coincideBusqueda =
        nombreCompleto.includes(texto) || ci.includes(texto);

      const coincideCriterio = filtroCriterio
        ? p.criterioIngreso === filtroCriterio
        : true;

      const coincideSexo = filtroSexo ? p.sexo === filtroSexo : true;

      const coincideTipoExtra =
        criterioEsExtrapulmonar && filtroTipoExtra
          ? p.tipoExtrapulmonar === filtroTipoExtra
          : true;

      const edad = calcularEdad(p.fechaNacimiento);

      let coincideEdad = true;

      if (filtroEdad === "menor") {
        coincideEdad = edad !== null && edad < 18;
      } else if (filtroEdad === "adulto") {
        coincideEdad = edad !== null && edad >= 18 && edad < 60;
      } else if (filtroEdad === "adultoMayor") {
        coincideEdad = edad !== null && edad >= 60;
      }

      return (
        coincideBusqueda &&
        coincideCriterio &&
        coincideSexo &&
        coincideTipoExtra &&
        coincideEdad
      );
    });
  }, [
    pacientes,
    busqueda,
    filtroCriterio,
    filtroSexo,
    filtroTipoExtra,
    filtroEdad,
    criterioEsExtrapulmonar,
  ]);

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroCriterio("");
    setFiltroSexo("");
    setFiltroTipoExtra("");
    setFiltroEdad("");
  };

  const handleCriterioChange = (e) => {
    setFiltroCriterio(e.target.value);
    setFiltroTipoExtra("");
  };

  const handleEditar = (id) => {
    navigate(`/actualizar-pacientePS/${id}`);
  };

  const handleEliminar = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que desea eliminar este paciente?"
    );

    if (!confirmar) return;

    try {
      await axios.delete(`http://localhost:3001/api/pacientes/${id}`);
      obtenerPacientes();
    } catch (error) {
      console.error("Error al eliminar paciente:", error);
      alert("No se pudo eliminar el paciente.");
    }
  };

  const getSexoClass = (sexo = "") => {
    const s = sexo.toLowerCase();

    if (s.includes("femenino")) return "rol-enfermera";
    if (s.includes("masculino")) return "rol-admin";

    return "rol-default";
  };

  return (
    <Layout>
      <div className="personal-page">
        <div className="personal-header-simple">
          <div>
            <h1>Lista de Pacientes</h1>
            <p>
              Establecimiento:
              <span className="establecimiento-title">
                {userEstablecimiento}
              </span>
            </p>
          </div>

          <button
            className="btn-add-top"
            onClick={() => navigate("/añadir-pacientePS")}
          >
            + Registrar paciente
          </button>
        </div>

        <div className="filters-card">
          <div className="filters-row pacientes-filters-row">
            <div className="search-control">
              <span className="search-icon">🔎</span>
              <input
                type="text"
                placeholder="Buscar por nombre o CI..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <select
              className="filter-select"
              value={filtroCriterio}
              onChange={handleCriterioChange}
            >
              <option value="">Todos los criterios</option>
              {criteriosDisponibles.map((criterio) => (
                <option key={criterio} value={criterio}>
                  {criterio}
                </option>
              ))}
            </select>

            {criterioEsExtrapulmonar && (
              <select
                className="filter-select"
                value={filtroTipoExtra}
                onChange={(e) => setFiltroTipoExtra(e.target.value)}
              >
                <option value="">Tipo extrapulmonar</option>
                {tiposExtraDisponibles.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            )}

            <select
              className="filter-select"
              value={filtroSexo}
              onChange={(e) => setFiltroSexo(e.target.value)}
            >
              <option value="">Todos los sexos</option>
              {sexosDisponibles.map((sexo) => (
                <option key={sexo} value={sexo}>
                  {sexo}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={filtroEdad}
              onChange={(e) => setFiltroEdad(e.target.value)}
            >
              <option value="">Todas las edades</option>
              <option value="menor">Menores de edad</option>
              <option value="adulto">Adultos</option>
              <option value="adultoMayor">Adultos mayores</option>
            </select>

            <button className="btn-clear-filters" onClick={limpiarFiltros}>
              Limpiar
            </button>
          </div>

          <div className="filters-summary">
            Mostrando <strong>{pacientesFiltrados.length}</strong> de{" "}
            <strong>{pacientes.length}</strong> pacientes
          </div>
        </div>

        <div className="table-card">
          <div className="table-responsive">
            <table className="custom-table pacientes-table">
              <thead>
                <tr>
                  <th>Nombre completo</th>
                  <th>Celular</th>
                  <th>Fecha nacimiento</th>
                  <th>Sexo</th>
                  <th>Dirección</th>
                  <th>CI</th>
                  <th>Criterio de ingreso</th>
                  <th className="acciones-col">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {pacientesFiltrados.length > 0 ? (
                  pacientesFiltrados.map((p) => (
                    <tr key={p.idPersona}>
                      <td className="nombre-simple">
                        {p.nombreCompleto || "Sin nombre"}
                      </td>

                      <td>{p.numeroCelular || "Sin registro"}</td>

                      <td>{formatDate(p.fechaNacimiento)}</td>

                      <td>
                        <span className={`role-badge ${getSexoClass(p.sexo)}`}>
                          {p.sexo || "Sin registro"}
                        </span>
                      </td>

                      <td className="direccion-cell">
                        {p.direccion || "Sin dirección"}
                      </td>

                      <td>{p.CI || "Sin registro"}</td>

                      <td className="criterio-cell">
                        <div className="criterio-principal">
                          {p.criterioIngreso || "Sin criterio"}
                        </div>

                        {p.tipoExtrapulmonar && (
                          <div className="criterio-extra">
                            Tipo extrapulmonar: {p.tipoExtrapulmonar}
                          </div>
                        )}
                      </td>

                      <td className="acciones">
                        <button
                          className="icon-btn edit"
                          onClick={() => handleEditar(p.idPersona)}
                          title="Editar paciente"
                        >
                          ✎
                        </button>

                        <button
                          className="icon-btn delete"
                          onClick={() => handleEliminar(p.idPersona)}
                          title="Eliminar paciente"
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-data">
                      No se encontraron pacientes con los filtros seleccionados.
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

export default ListaPacientesAdmin;