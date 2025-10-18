import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Layout from "../components/Layout";
import "./ListaPersonalSalud.css"; // mismo estilo que lista de personal

const ListaPacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/pacientes");
      setPacientes(res.data);
    } catch (error) {
      console.error("Error al obtener pacientes:", error);
      alert("❌ No se pudieron cargar los pacientes.");
    }
  };

  const desactivarPaciente = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este paciente?")) return;

    try {
      await axios.put(`http://localhost:3001/api/pacientesDelete/${id}/estado`);
      alert("✅ Paciente eliminado correctamente");
      setPacientes((prev) => prev.filter((p) => p.idPersona !== id));
    } catch (error) {
      console.error("Error al eliminar paciente:", error);
      alert("❌ No se pudo eliminar el paciente.");
    }
  };

  const handleActualizarPaciente = (id) => {
    navigate(`/actualizar-pacienteSA/${id}`);
  };

  const formatearFecha = (fecha) => {
    try {
      return new Date(fecha).toLocaleDateString("es-ES");
    } catch {
      return "—";
    }
  };

  const pacientesFiltrados = pacientes.filter((p) =>
    p.nombreCompleto?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <Layout>
      <div className="personal-container">
        <div className="header-section">
          <h1>Lista de Pacientes</h1>
          <p>Consulta y administra los pacientes registrados en el sistema.</p>
        </div>

        {/* 🔹 Barra de búsqueda */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar paciente por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* 🔹 Tabla */}
        <div className="table-container mt-4">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Nombre Completo</th>
                <th>Celular</th>
                <th>Fecha Nac.</th>
                <th>Sexo</th>
                <th>Dirección</th>
                <th>CI</th>
                <th>Establecimiento</th>
                <th>Criterio Ingreso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pacientesFiltrados.length > 0 ? (
                pacientesFiltrados.map((p) => (
                  <tr key={p.idPersona}>
                    <td>{p.nombreCompleto}</td>
                    <td>{p.numeroCelular}</td>
                    <td>{formatearFecha(p.fechaNacimiento)}</td>
                    <td>{p.sexo}</td>
                    <td>{p.direccion}</td>
                    <td>{p.CI}</td>
                    <td>{p.nombreEstablecimiento}</td>
                    <td>{p.criterioIngreso}</td>
                    <td className="acciones">
                      <button
                        className="icon-btn edit"
                        title="Editar"
                        onClick={() => handleActualizarPaciente(p.idPersona)}
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
                        title="Eliminar"
                        onClick={() => desactivarPaciente(p.idPersona)}
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
                  <td colSpan="9" className="no-data">
                    No se encontraron pacientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 🔹 Botón añadir */}
        <div className="actions mt-4">
          <Link to="/añadir-pacienteSA" className="btn-action add">
            Añadir Nuevo Paciente
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default ListaPacientes;