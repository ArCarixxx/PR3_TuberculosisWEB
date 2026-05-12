import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import "./ListaPersonalSalud.css";

const SeguimientoTratamientos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [pacientes, setPacientes] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [treatments, setTreatments] = useState([]);


  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/pacientes");
        const data = await response.json();
        setPacientes(data);
      } catch (error) {
        console.error("Error al obtener pacientes:", error);
      }
    };

    fetchPacientes();
  }, []);

  useEffect(() => {
    const texto = searchTerm.toLowerCase().trim();

    if (!texto || selectedPerson?.nombreCompleto === searchTerm) {
      setResults([]);
      return;
    }

    const filtrados = pacientes.filter((person) =>
      person.nombreCompleto?.toLowerCase().includes(texto)
    );

    setResults(filtrados);
  }, [searchTerm, pacientes, selectedPerson]);

  const fetchTreatments = async (personId) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/tratamientos/${personId}`
      );
      const data = await response.json();
      setTreatments(data);
    } catch (error) {
      console.error("Error al obtener tratamientos:", error);
    }
  };

  const handleSelectPerson = (person) => {
    setSelectedPerson(person);
    setResults([]);
    setSearchTerm(person.nombreCompleto);
    fetchTreatments(person.idPersona);
  };



  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("es-BO");
  };

  const totalTratamientos = useMemo(() => treatments.length, [treatments]);

  return (
    <Layout>
      <div className="personal-page">
        <div className="personal-header-simple">
          <div>
            <h1>Seguimiento de Tratamientos</h1>
            <p>Consulta y gestiona los tratamientos registrados por paciente.</p>
          </div>

          <div className="role-badge rol-admin">
            Visualización General
          </div>
        </div>

        <div className="filters-card seguimiento-search-card">
          <div className="filters-row seguimiento-filters-row">
            <div className="search-control">
              <span className="search-icon">🔎</span>
              <input
                type="text"
                placeholder="Buscar paciente por nombre..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedPerson(null);
                  setTreatments([]);
                }}
              />
            </div>
          </div>

          {results.length > 0 && (
            <div className="search-results-box">
              {results.map((person) => (
                <button
                  key={person.idPersona}
                  className="search-result-item"
                  onClick={() => handleSelectPerson(person)}
                >
                  <span>{person.nombreCompleto}</span>
                  <small>{person.nombreEstablecimiento || "Sin establecimiento"}</small>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedPerson && (
          <>
            <div className="patient-card">
              <div className="patient-card-header">
                <div>
                  <span className="page-badge">Paciente seleccionado</span>
                  <h3>{selectedPerson.nombreCompleto}</h3>
                </div>

                <span className="role-badge rol-medico">
                  {totalTratamientos} tratamiento(s)
                </span>
              </div>

              <div className="patient-info-grid">
                <div>
                  <span>Fecha de nacimiento</span>
                  <strong>{formatDate(selectedPerson.fechaNacimiento)}</strong>
                </div>

                <div>
                  <span>Sexo</span>
                  <strong>{selectedPerson.sexo || "Sin registro"}</strong>
                </div>

                <div>
                  <span>Establecimiento</span>
                  <strong>{selectedPerson.nombreEstablecimiento || "Sin registro"}</strong>
                </div>

                <div>
                  <span>Criterio de ingreso</span>
                  <strong>{selectedPerson.criterioIngreso || "Sin registro"}</strong>
                </div>
              </div>
            </div>

            <div className="table-card">
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Medicamento</th>
                      <th>Inicio</th>
                      <th>Finalización</th>
                      <th>Dosis</th>
                      <th>Intervalo</th>
                    </tr>
                  </thead>

                  <tbody>
                    {treatments.length > 0 ? (
                      treatments.map((t) => (
                        <tr key={t.idTratamiento}>
                          <td className="nombre-simple">{t.medicamento}</td>
                          <td>{formatDate(t.fechaInicio)}</td>
                          <td>{formatDate(t.fechaFinalizacion)}</td>
                          <td>
                            <span className="establishment-chip">
                              {t.cantDosis} mg
                            </span>
                          </td>
                          <td>
                            <span className="role-badge rol-default">
                              Cada {t.intervaloTiempo} hrs
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="no-data">
                          No hay tratamientos registrados para este paciente.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {!selectedPerson && (
          <div className="empty-state-card">
            <h3>Seleccione un paciente</h3>
            <p>
              Busque por nombre completo para visualizar los tratamientos registrados.
            </p>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default SeguimientoTratamientos;