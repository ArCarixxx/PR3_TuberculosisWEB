import React, { useState, useEffect } from 'react';
import Layout from "../components/Layout";

const SeguimientoTratamientos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [newTreatment, setNewTreatment] = useState({
    medicamento: '',
    fechaInicio: '',
    fechaFinalizacion: '',
    cantDosis: '',
    intervaloTiempo: '',
  });
  const [showModal, setShowModal] = useState(false);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const fetchResults = async () => {
    if (searchTerm.trim()) {
      try {
        const response = await fetch(`http://localhost:3001/api/pacientes`);
        const data = await response.json();
        const filteredResults = data.filter(person =>
          person.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setResults(filteredResults);
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    } else {
      setResults([]);
    }
  };

  const fetchTreatments = async (personId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/tratamientos/${personId}`);
      const data = await response.json();
      setTreatments(data);
    } catch (error) {
      console.error('Error fetching treatments:', error);
    }
  };

  const handleSelectPerson = (person) => {
    setSelectedPerson(person);
    setResults([]);
    setSearchTerm(person.nombreCompleto);
    fetchTreatments(person.idPersona);
  };

  useEffect(() => {
    fetchResults();
  }, [searchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTreatment({ ...newTreatment, [name]: value });
  };

  const handleAddTreatment = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/tratamientos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newTreatment,
          Persona_idPersona: selectedPerson.idPersona,
        }),
      });
      if (response.ok) {
        fetchTreatments(selectedPerson.idPersona);
        setShowModal(false);
        setNewTreatment({
          medicamento: '',
          fechaInicio: '',
          fechaFinalizacion: '',
          cantDosis: '',
          intervaloTiempo: '',
        });
      } else {
        console.error('Error al agregar tratamiento');
      }
    } catch (error) {
      console.error('Error al agregar tratamiento:', error);
    }
  };

  return (
    <Layout>
    <div className="container mt-5">
      <h2>Seguimiento de Tratamientos</h2>
      <div className="form-group">
        <label htmlFor="search">Buscar Persona</label>
        <input
          type="text"
          id="search"
          className="form-control search-input"
          placeholder="Ingresa el nombre de la persona"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {results.length > 0 && (
        <ul className="list-group mt-3">
          {results.map((person) => (
            <li
              key={person.idPersona}
              className="list-group-item"
              onClick={() => handleSelectPerson(person)}
              style={{ cursor: 'pointer' }}
            >
              {person.nombreCompleto}
            </li>
          ))}
        </ul>
      )}

      {selectedPerson && (
        <div className="mt-4">
          <h4>Persona Seleccionada:</h4>
          <p>
            Nombre Completo: {selectedPerson.nombreCompleto} <br />
            Fecha de Nacimiento: {new Date(selectedPerson.fechaNacimiento).toLocaleDateString()} <br />
            Sexo: {selectedPerson.sexo} <br />
            Establecimiento: {selectedPerson.nombreEstablecimiento} <br />
            Criterio de Ingreso: {selectedPerson.criterioIngreso} <br />
            
          </p>

          <h4>Tratamientos:</h4>
          {treatments.length > 0 ? (
            <table className="table mt-3">
              <thead>
                <tr>
                  <th>Medicamento</th>
                  <th>Fecha Inicio</th>
                  <th>Fecha Finalización</th>
                  <th>Cantidad de Dosis</th>
                  <th>Intervalo de Tiempo (hrs)</th>
                </tr>
              </thead>
              <tbody>
                {treatments.map((treatment) => (
                  <tr key={treatment.idTratamiento}>
                    <td>{treatment.medicamento}</td>
                    <td>{new Date(treatment.fechaInicio).toLocaleDateString()}</td>
                    <td>{treatment.fechaFinalizacion ? new Date(treatment.fechaFinalizacion).toLocaleDateString() : 'N/A'}</td>
                    <td>{treatment.cantDosis}</td>
                    <td>{treatment.intervaloTiempo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No se encontraron tratamientos para esta persona.</p>
          )}
        </div>
      )}
    </div>
    </Layout>
  );
};

export default SeguimientoTratamientos;
