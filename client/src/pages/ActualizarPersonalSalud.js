import React, { useEffect, useState } from 'react'; 
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import Layout from "../components/LayoutAdmin";

const ActualizarPersonalSalud = () => {
  const [personalSalud, setPersonalSalud] = useState([]);
  const [establecimientos, setEstablecimientos] = useState([]);
  const [selectedPersonal, setSelectedPersonal] = useState(null);
  
  const userRole = localStorage.getItem("userRole");
  const userEstablecimiento = localStorage.getItem("userEstablecimiento");
  const userIdEstablecimiento = localStorage.getItem("userIdEstablecimiento");
  const [formData, setFormData] = useState({
    nombres: '',
    primerApellido: '',
    segundoApellido: '',
    numeroCelular: '',
    rol: '',
    CI: '',
    EstablecimeintoSalud_idEstablecimeintoSalud: userIdEstablecimiento ,
  });

  const navigate = useNavigate(); // Inicializa useNavigate

  // Obtener el listado de personal de salud y establecimientos
  useEffect(() => {
      const obtenerPersonalSalud = async () => {
        try {
          const response = await axios.get('http://localhost:3001/api/personalSaludEstablecimiento', {
            params: { userIdEstablecimiento, search: '' } // Enviar userIdEstablecimiento como parámetro
          });
          
          console.log("Datos filtrados:", response.data);
          setPersonalSalud(response.data); // Guardar los datos obtenidos en el estado
        } catch (error) {
          console.error('Error al obtener el personal de salud:', error);
        }
      };

    const obtenerEstablecimientos = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/establecimientos');
        setEstablecimientos(response.data);
      } catch (error) {
        console.error('Error al obtener los establecimientos:', error);
      }
    };

    obtenerPersonalSalud();
    obtenerEstablecimientos();
  }, []);

  // Manejar cambios en el combobox
  const handleSelectChange = (e) => {
    const id = e.target.value;
    const selected = personalSalud.find(p => p.idPersona === parseInt(id));
    setSelectedPersonal(selected);
    setFormData({
      nombres: selected.nombres,
      primerApellido: selected.primerApellido,
      segundoApellido: selected.segundoApellido,
      numeroCelular: selected.numeroCelular,
      rol: selected.rol || '', // Asegúrate de que el rol se inicialice
      CI: selected.CI || '',
      EstablecimientoSalud_idEstablecimientoSalud: selected.EstablecimientoSalud_idEstablecimientoSalud || '',
    });
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Función para actualizar el personal de salud
  const actualizarPersonalSalud = async () => {
    try {
      await axios.put(`http://localhost:3001/api/personalSalud/${selectedPersonal.idPersona}`, formData);
      alert('Personal de salud actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar el personal de salud:', error);
    }
  };

  // Función para manejar el botón de cancelar
  const manejarCancelar = () => {
    navigate('/lista-personal-salud'); // Redirige a la lista de personal de salud
  };

  return (
    <Layout>
    <div className="container mt-5">
      <h1 className="text-center mb-4">Actualizar Personal de Salud</h1>
      <div className="mb-4">
        <label>Seleccionar Personal de Salud:</label>
        <select className="form-control" onChange={handleSelectChange}>
          <option value="">Selecciona una opción</option>
          {personalSalud.map((personal) => (
            <option key={personal.idPersona} value={personal.idPersona}>
              {`${personal.nombres} ${personal.primerApellido}`}
            </option>
          ))}
        </select>
      </div>

      {selectedPersonal && (
        <form>
          <div className="form-group">
            <label>Nombres:</label>
            <input
              type="text"
              className="form-control"
              name="nombres"
              value={formData.nombres}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Primer Apellido:</label>
            <input
              type="text"
              className="form-control"
              name="primerApellido"
              value={formData.primerApellido}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Segundo Apellido:</label>
            <input
              type="text"
              className="form-control"
              name="segundoApellido"
              value={formData.segundoApellido}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Número de Celular:</label>
            <input
              type="text"
              className="form-control"
              name="numeroCelular"
              value={formData.numeroCelular}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>CI:</label>
            <input
              type="text"
              className="form-control"
              name="CI"
              value={formData.CI}
              onChange={handleInputChange}
            />
          </div>
        
          <div className="form-group">
            <label>Rol:</label>
            <select
              className="form-control"
              name="rol"
              value={formData.rol}
              onChange={handleInputChange}
            >
              <option value="">Selecciona un rol</option>
              <option value="Medico">Médico</option>
              <option value="Enfermero/a">Enfermero/a</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Establecimiento de Salud</label>
            <input
              type="text"
              className="form-control"
              value={userEstablecimiento}
              readOnly
            />
          </div>
          
          <br />
          <button type="button" className="btn btn-primary" onClick={actualizarPersonalSalud}>
            Actualizar
          </button>
          <button 
            type="button" 
            className="btn btn-secondary ml-2" // Clase para el botón de cancelar
            onClick={manejarCancelar} 
            style={{ marginLeft: '8px' }} 
          >
            Cancelar
          </button>
        </form>
      )}
    </div>
    </Layout>
  );
};

export default ActualizarPersonalSalud;
