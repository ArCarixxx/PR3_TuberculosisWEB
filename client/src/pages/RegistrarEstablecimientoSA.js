import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from "../components/Layout";

const RegistrarEstablecimiento = () => {
  const [selectedSede, setSelectedSede] = useState('');
  const [selectedRedSalud, setSelectedRedSalud] = useState('');
  const [sedes, setSedes] = useState([]);
  const [redesSalud, setRedesSalud] = useState([]);
  const [nuevaRedSalud, setNuevaRedSalud] = useState('');
  const [clasificacion, setClasificacion] = useState('');
  const [telefono, setTelefono] = useState(''); // Estado para el teléfono


  useEffect(() => {
    const fetchSedes = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/sedes');
        setSedes(response.data);
      } catch (error) {
        console.error('Error al obtener las sedes:', error);
      }
    };
    fetchSedes();
  }, []);

  useEffect(() => {
    const fetchRedesSalud = async () => {
      if (selectedSede) {
        try {
          const response = await axios.get(`http://localhost:3001/api/redesSalud/${selectedSede}`);
          setRedesSalud(response.data);
        } catch (error) {
          console.error('Error al obtener las redes de salud:', error);
        }
      } else {
        setRedesSalud([]);
      }
    };
    fetchRedesSalud();
  }, [selectedSede]);

  const handleSedeChange = (event) => {
    setSelectedSede(event.target.value);
    setSelectedRedSalud('');
    setRedesSalud([]);
    setNuevaRedSalud('');
  };

  const handleRedSaludChange = (event) => {
    setSelectedRedSalud(event.target.value);
  };

  const handleNuevaRedSaludChange = (event) => {
    setNuevaRedSalud(event.target.value);
  };

  const handleClasificacionChange = (event) => {
    setClasificacion(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    const nombreEstablecimiento = event.target[0].value;
    const telefono = event.target[1].value;
    const selectedRedSaludId = selectedRedSalud;
  
    if (selectedRedSaludId && selectedRedSaludId !== 'nueva') {
      try {
        const response = await axios.post('http://localhost:3001/api/establecimientoSalud', {
          nombreEstablecimiento,
          telefono,
          clasificacion,
          idRedSalud: selectedRedSaludId,
        });
        alert(response.data.message); // Mensaje de éxito
      } catch (error) {
        if (error.response && error.response.data.error) {
          // Si hay un error relacionado con el establecimiento ya existente
          alert(error.response.data.error);
        } else {
          console.error('Error registrando el establecimiento:', error);
          alert('Error registrando el establecimiento. Inténtalo nuevamente.');
        }
      }
    }
  };
  

  // Función para crear la nueva red de salud
  const handleCreateRedSalud = async () => {
    if (!nuevaRedSalud) {
      alert('Por favor, ingrese el nombre de la nueva red de salud.');
      return;
    }

    try {
      await axios.post('http://localhost:3001/api/redesSalud', {
        nombreRedSalud: nuevaRedSalud,
        idSede: selectedSede,
      });
      alert('Nueva red de salud creada!');
      setNuevaRedSalud('');
      setSelectedRedSalud('');
      const response = await axios.get(`http://localhost:3001/api/redesSalud/${selectedSede}`);
      setRedesSalud(response.data);
    } catch (error) {
      console.error('Error creando la nueva red de salud:', error);
    }
  };

  return (
    <Layout>
    <div className="container mt-5">
      <div className="card p-4">
        <h2 className="text-center mb-4">Registrar Establecimiento</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>* Ingrese Nombre Del Establecimiento</label>
            <input type="text" className="form-control" placeholder="Nombre" required />
          </div>
          <div className="row mb-3">
          <div className="col-md-6">
            <label>* Ingrese Número de Teléfono</label>
            <input
              type="tel"
              className="form-control"
              placeholder="Teléfono"
              required
              value={telefono} // Aquí debes agregar un estado para manejar el valor
              onChange={(e) => {
                const inputValue = e.target.value;
                // Solo permitir dígitos
                if (/^\d*$/.test(inputValue)) {
                  setTelefono(inputValue); // Aquí necesitas definir el estado de telefono
                }
              }}
            />
          </div>
            <div className="col-md-6">
              <label>* SEDE</label>
              <select className="form-control" value={selectedSede} onChange={handleSedeChange}>
                <option value="">Seleccione una sede</option>
                {sedes.map((sede) => (
                  <option key={sede.idSede} value={sede.idSede}>
                    {sede.nombreSede}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-6">
              <label>* Red de Salud</label>
              <select className="form-control" value={selectedRedSalud} onChange={handleRedSaludChange} required>
                <option value="">Seleccione una red de salud</option>
                {redesSalud.map((red) => (
                  <option key={red.idRedSalud} value={red.idRedSalud}>
                    {red.nombreRedSalud}
                  </option>
                ))}
                <option value="nueva">Agregar nueva red de salud</option>
              </select>
              {selectedRedSalud === 'nueva' && (
                <>
                  <input
                    type="text"
                    className="form-control mt-2"
                    placeholder="Ingrese nueva red de salud"
                    value={nuevaRedSalud}
                    onChange={handleNuevaRedSaludChange}
                    required
                  />
                  {/* Botón para confirmar la creación de la nueva red de salud */}
                  <button type="button" className="btn btn-success mt-2" onClick={handleCreateRedSalud}>
                    Crear Nueva Red de Salud
                  </button>
                </>
              )}
            </div>
            <div className="col-md-6">
              <label>* Nivel E.S.</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nivel E.S."
                value={clasificacion}
                onChange={handleClasificacionChange}
                required
              />
            </div>
          </div>
          <div className="d-flex justify-content-center mt-4">
            <button type="submit" className="btn btn-primary">
              Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
    </Layout>
  );
};

export default RegistrarEstablecimiento;
