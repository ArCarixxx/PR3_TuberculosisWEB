import React, { useState, useEffect } from "react";
import Layout from "../components/LayoutPersonalSalud";
import "./ListaPersonalSalud.css"; // reutiliza estilos modernos

const SeguimientoTratamientos = () => {
  const userRole = localStorage.getItem("userRole");
  const userEstablecimiento = localStorage.getItem("userEstablecimiento");
  const userIdEstablecimiento = localStorage.getItem("userIdEstablecimiento");

  console.log(
    `Rol: ${userRole}, Establecimiento: ${userEstablecimiento}, IdEstablecimiento: ${userIdEstablecimiento}`
  );

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

  // --- Buscar pacientes por establecimiento ---
  useEffect(() => {
    const fetchResults = async () => {
      if (searchTerm.trim()) {
        try {
          const response = await fetch(
            `http://localhost:3001/api/pacientesEst?userIdEstablecimiento=${userIdEstablecimiento}`
          );
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
  }, [searchTerm, userIdEstablecimiento]);

  // --- Obtener tratamientos del paciente ---
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

  // --- Registrar nuevo tratamiento ---
  const handleAddTreatment = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/tratamientos`, {
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
        alert("❌ Error al registrar el tratamiento.");
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
          <p>
            Gestión de tratamientos y seguimiento de pacientes en tu
            establecimiento.
          </p>
        </div>

        {/* 🔹 Búsqueda de pacientes */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar paciente por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 🔹 Resultados de búsqueda */}
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

        {/* 🔹 Información del paciente */}
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
                <button
                  className="btn-action add"
                  onClick={() => setShowModal(true)}
                >
                  + Nuevo Tratamiento
                </button>
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
                      <th>Acciones</th>
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
                        <td>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteTreatment(t.idTratamiento)}
                          >
                            Eliminar
                          </button>
                        </td>
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

        {/* 🔹 Modal de registro de tratamiento */}
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
