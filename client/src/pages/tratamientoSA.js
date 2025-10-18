import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import "./ListaPersonalSalud.css"; // reutilizamos estilos

const SeguimientoTratamientos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [newTreatment, setNewTreatment] = useState({
    medicamento: "",
    fechaInicio: "",
    fechaFinalizacion: "",
    cantDosis: "",
    intervaloTiempo: "",
  });
  const [showModal, setShowModal] = useState(false);

  // --- Buscar pacientes ---
  useEffect(() => {
    const fetchResults = async () => {
      if (searchTerm.trim()) {
        try {
          const response = await fetch("http://localhost:3001/api/pacientes");
          const data = await response.json();
          const filteredResults = data.filter((person) =>
            person.nombreCompleto
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          );
          setResults(filteredResults);
        } catch (error) {
          console.error("Error fetching search results:", error);
        }
      } else {
        setResults([]);
      }
    };
    fetchResults();
  }, [searchTerm]);

  // --- Obtener tratamientos ---
  const fetchTreatments = async (personId) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/tratamientos/${personId}`
      );
      const data = await response.json();
      setTreatments(data);
    } catch (error) {
      console.error("Error fetching treatments:", error);
    }
  };

  // --- Seleccionar paciente ---
  const handleSelectPerson = (person) => {
    setSelectedPerson(person);
    setResults([]);
    setSearchTerm(person.nombreCompleto);
    fetchTreatments(person.idPersona);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTreatment({ ...newTreatment, [name]: value });
  };

  const handleAddTreatment = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/tratamientos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTreatment,
          Persona_idPersona: selectedPerson.idPersona,
        }),
      });
      if (response.ok) {
        fetchTreatments(selectedPerson.idPersona);
        setShowModal(false);
        setNewTreatment({
          medicamento: "",
          fechaInicio: "",
          fechaFinalizacion: "",
          cantDosis: "",
          intervaloTiempo: "",
        });
      } else {
        alert("❌ Error al agregar tratamiento");
      }
    } catch (error) {
      console.error("Error al agregar tratamiento:", error);
    }
  };
  
  const handleDeleteTreatment = async (idTratamiento) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de eliminar este tratamiento?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:3001/api/tratamientos/${idTratamiento}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        alert("✅ Tratamiento eliminado correctamente");
        fetchTreatments(selectedPerson.idPersona); // recargar lista
      } else {
        alert("❌ No se pudo eliminar el tratamiento");
      }
    } catch (error) {
      console.error("Error al eliminar tratamiento:", error);
      alert("❌ Error al conectar con el servidor");
    }
  };


  return (
    <Layout>
      <div className="personal-container">
        <div className="header-section">
          <h1>Seguimiento de Tratamientos</h1>
          <p>Consulta, gestiona y registra los tratamientos de los pacientes.</p>
        </div>

        {/* 🔹 Búsqueda de persona */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar paciente por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 🔹 Lista de resultados */}
        {results.length > 0 && (
          <ul className="list-group search-results mt-3">
            {results.map((person) => (
              <li
                key={person.idPersona}
                className="list-group-item"
                onClick={() => handleSelectPerson(person)}
              >
                {person.nombreCompleto}
              </li>
            ))}
          </ul>
        )}

        {/* 🔹 Datos del paciente seleccionado */}
        {selectedPerson && (
          <div className="patient-info mt-4">
            <h3>Paciente Seleccionado</h3>
            <div className="info-card">
              <p>
                <strong>Nombre Completo:</strong> {selectedPerson.nombreCompleto}
              </p>
              <p>
                <strong>Fecha de Nacimiento:</strong>{" "}
                {new Date(selectedPerson.fechaNacimiento).toLocaleDateString()}
              </p>
              <p>
                <strong>Sexo:</strong> {selectedPerson.sexo}
              </p>
              <p>
                <strong>Establecimiento:</strong>{" "}
                {selectedPerson.nombreEstablecimiento}
              </p>
              <p>
                <strong>Criterio de Ingreso:</strong>{" "}
                {selectedPerson.criterioIngreso}
              </p>
            </div>

            {/* 🔹 Tabla de tratamientos */}
            <div className="table-container mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Tratamientos</h4>
                
              </div>

              {treatments.length > 0 ? (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Medicamento</th>
                      <th>Inicio</th>
                      <th>Finalización</th>
                      <th>Dosis</th>
                      <th>Intervalo (hrs)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {treatments.map((t) => (
                      <tr key={t.idTratamiento}>
                        <td>{t.medicamento}</td>
                        <td>{new Date(t.fechaInicio).toLocaleDateString()}</td>
                        <td>
                          {t.fechaFinalizacion
                            ? new Date(t.fechaFinalizacion).toLocaleDateString()
                            : "—"}
                        </td>
                        <td>{t.cantDosis}</td>
                        <td>{t.intervaloTiempo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

              ) : (
                <p className="no-data">No hay tratamientos registrados.</p>
              )}
            </div>
          </div>
        )}

        {/* 🔹 Modal para registrar tratamiento */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h4 className="text-center mb-3">Registrar Nuevo Tratamiento</h4>

              <div className="form-group">
                <label>Medicamento:</label>
                <input
                  type="text"
                  className="form-control"
                  name="medicamento"
                  value={newTreatment.medicamento}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Fecha de Inicio:</label>
                <input
                  type="date"
                  className="form-control"
                  name="fechaInicio"
                  value={newTreatment.fechaInicio}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Fecha de Finalización:</label>
                <input
                  type="date"
                  className="form-control"
                  name="fechaFinalizacion"
                  value={newTreatment.fechaFinalizacion}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Cantidad de Dosis:</label>
                <input
                  type="number"
                  className="form-control"
                  name="cantDosis"
                  value={newTreatment.cantDosis}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Intervalo de Tiempo (horas):</label>
                <input
                  type="number"
                  className="form-control"
                  name="intervaloTiempo"
                  value={newTreatment.intervaloTiempo}
                  onChange={handleInputChange}
                />
              </div>

              <div className="d-flex justify-content-center gap-3 mt-3">
                <button className="btn btn-primary" onClick={handleAddTreatment}>
                  Guardar
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SeguimientoTratamientos;
