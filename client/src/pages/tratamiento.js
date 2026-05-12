import React, { useEffect, useState } from "react";
import Layout from "../components/LayoutPersonalSalud";
import "./ListaPersonalSalud.css";

const SeguimientoTratamientosPS = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const userIdEstablecimiento = localStorage.getItem("userIdEstablecimiento");

  const [newTreatment, setNewTreatment] = useState({
    medicamento: "",
    faseSeleccionada: "",
    fechaInicio: "",
    fechaFinalizacion: "",
    cantDosis: "",
    intervaloTiempo: "",
  });

  // Buscar pacientes por establecimiento
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
              ?.toLowerCase()
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

  // Obtener tratamientos del paciente
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

  // Seleccionar paciente
  const handleSelectPerson = (person) => {
    setSelectedPerson(person);
    setResults([]);
    setSearchTerm(person.nombreCompleto);
    fetchTreatments(person.idPersona);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setNewTreatment({
      ...newTreatment,
      [name]: value,
    });
  };

  const limpiarFormularioTratamiento = () => {
    setNewTreatment({
      medicamento: "",
      faseSeleccionada: "",
      fechaInicio: "",
      fechaFinalizacion: "",
      cantDosis: "",
      intervaloTiempo: "",
    });
  };

  // Registrar tratamiento
  const handleAddTreatment = async () => {
    if (!selectedPerson) {
      alert("Debe seleccionar un paciente.");
      return;
    }

    if (
      !newTreatment.fechaInicio ||
      !newTreatment.cantDosis ||
      !newTreatment.intervaloTiempo
    ) {
      alert("Complete los campos obligatorios.");
      return;
    }

    let medicamentoFinal = newTreatment.medicamento;

    if (newTreatment.faseSeleccionada === "fase1") {
      medicamentoFinal = "Fase intensiva: RHZE";
    } else if (newTreatment.faseSeleccionada === "fase2") {
      medicamentoFinal = "Fase de continuación: RH";
    }

    if (!medicamentoFinal.trim()) {
      alert("Debe seleccionar una fase o escribir un medicamento.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/tratamientos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newTreatment,
          medicamento: medicamentoFinal,
          Persona_idPersona: selectedPerson.idPersona,
        }),
      });

      if (response.ok) {
        alert("✅ Tratamiento registrado correctamente.");
        fetchTreatments(selectedPerson.idPersona);
        setShowModal(false);
        limpiarFormularioTratamiento();
      } else {
        alert("❌ Error al registrar el tratamiento.");
      }
    } catch (error) {
      console.error("Error al agregar tratamiento:", error);
      alert("❌ Error al conectar con el servidor.");
    }
  };

  // Eliminar tratamiento
  const handleDeleteTreatment = async (idTratamiento) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de eliminar este tratamiento?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:3001/api/tratamientos/${idTratamiento}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("✅ Tratamiento eliminado correctamente");
        fetchTreatments(selectedPerson.idPersona);
      } else {
        alert("❌ No se pudo eliminar el tratamiento");
      }
    } catch (error) {
      console.error("Error al eliminar tratamiento:", error);
      alert("❌ Error al conectar con el servidor");
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("es-BO");
  };

  return (
    <Layout>
      <div className="personal-page">
        <div className="personal-header-simple">
          <div>
            <h1>Seguimiento de Tratamientos</h1>
            <p>Busca un paciente y registra su tratamiento correspondiente.</p>
          </div>

          <button
            className="btn-add-top"
            onClick={() => setShowModal(true)}
            disabled={!selectedPerson}
            title={!selectedPerson ? "Seleccione un paciente primero" : ""}
          >
            + Registrar tratamiento
          </button>
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
                  <small>
                    {person.nombreEstablecimiento || "Sin establecimiento"}
                  </small>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedPerson ? (
          <>
            <div className="patient-card">
              <div className="patient-card-header">
                <div>
                  <span className="page-badge">Paciente seleccionado</span>
                  <h3>{selectedPerson.nombreCompleto}</h3>
                </div>

                <span className="role-badge rol-medico">
                  {treatments.length} tratamiento(s)
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
                  <strong>
                    {selectedPerson.nombreEstablecimiento || "Sin registro"}
                  </strong>
                </div>

                <div>
                  <span>Criterio de ingreso</span>
                  <strong>
                    {selectedPerson.criterioIngreso || "Sin registro"}
                  </strong>
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
                      <th className="acciones-col">Acciones</th>
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
                          <td className="acciones">
                            <button
                              className="icon-btn delete"
                              onClick={() =>
                                handleDeleteTreatment(t.idTratamiento)
                              }
                              title="Eliminar tratamiento"
                            >
                              🗑
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="no-data">
                          No hay tratamientos registrados para este paciente.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state-card">
            <h3>Seleccione un paciente</h3>
            <p>
              Busque por nombre completo para registrar o consultar tratamientos.
            </p>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content treatment-modal">
              <h4>Registrar Nuevo Tratamiento</h4>

              <div className="modal-form-grid">
                <div className="form-group">
                  <label>Fase del tratamiento</label>
                  <select
                    className="form-select"
                    name="faseSeleccionada"
                    value={newTreatment.faseSeleccionada}
                    onChange={handleInputChange}
                  >
                    <option value="">Seleccionar fase</option>
                    <option value="fase1">Fase intensiva: RHZE</option>
                    <option value="fase2">Fase de continuación: RH</option>
                    <option value="otro">Otro medicamento</option>
                  </select>
                </div>

                {newTreatment.faseSeleccionada === "otro" && (
                  <div className="form-group">
                    <label>* Medicamento</label>
                    <input
                      type="text"
                      className="form-control"
                      name="medicamento"
                      value={newTreatment.medicamento}
                      onChange={handleInputChange}
                      placeholder="Ej: Rifampicina"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>* Fecha de Inicio</label>
                  <input
                    type="date"
                    className="form-control"
                    name="fechaInicio"
                    value={newTreatment.fechaInicio}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Fecha de Finalización</label>
                  <input
                    type="date"
                    className="form-control"
                    name="fechaFinalizacion"
                    value={newTreatment.fechaFinalizacion}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>* Cantidad de Dosis</label>
                  <input
                    type="number"
                    className="form-control"
                    name="cantDosis"
                    value={newTreatment.cantDosis}
                    onChange={handleInputChange}
                    placeholder="mg"
                  />
                </div>

                <div className="form-group">
                  <label>* Intervalo de Tiempo</label>
                  <input
                    type="number"
                    className="form-control"
                    name="intervaloTiempo"
                    value={newTreatment.intervaloTiempo}
                    onChange={handleInputChange}
                    placeholder="horas"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="btn-modal-primary"
                  onClick={handleAddTreatment}
                >
                  Guardar
                </button>

                <button
                  className="btn-modal-secondary"
                  onClick={() => {
                    setShowModal(false);
                    limpiarFormularioTratamiento();
                  }}
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

export default SeguimientoTratamientosPS;