import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import Layout from "../components/Layout";  

const RegistrarPersonalSalud = () => {
  const navigate = useNavigate(); // Inicializa useNavigate
  const [formData, setFormData] = useState({
    nombres: '',
    primerApellido: '',
    segundoApellido: '',
    CI: '',
    numeroCelular: '',
    rol: '',
    EstablecimientoSalud_idEstablecimientoSalud: '',
  });

  const [establecimientos, setEstablecimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEstablecimientos = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/establecimientos');
        setEstablecimientos(response.data);
      } catch (error) {
        console.error('Error al obtener los establecimientos:', error);
      }
    };

    fetchEstablecimientos();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { CI, numeroCelular } = formData;
    if (!/^\d+$/.test(CI) || !/^\d+$/.test(numeroCelular)) {
      setError('El CI y el número de celular solo pueden contener números.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/personalSalud', formData);
      const usuario = `${formData.nombres.slice(0, 3).toLowerCase()}${formData.primerApellido.slice(0, 3).toLowerCase()}`;
      const contrasenia = CI;
      alert(`Usuario: ${usuario}\nContraseña: ${contrasenia}`);
      alert('Personal de salud registrado exitosamente');
    } catch (error) {
      if (error.response && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError('Hubo un error al registrar el personal de salud');
      }
    } finally {
      setLoading(false);
    }
  };


  const handleCancel = () => {
    navigate('/lista-personal-saludSA');
  };

  return (
    <Layout>
    <div className="container mt-5">
      <div className="card p-4">
        <h2 className="text-center mb-4">Registrar Personal de Salud</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="nombres" className="form-label">* Nombres</label>
            <input
              type="text"
              className="form-control"
              id="nombres"
              placeholder="Nombres"
              value={formData.nombres}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="primerApellido" className="form-label">* Primer Apellido</label>
            <input
              type="text"
              className="form-control"
              id="primerApellido"
              placeholder="Primer Apellido"
              value={formData.primerApellido}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="segundoApellido" className="form-label">Segundo Apellido</label>
            <input
              type="text"
              className="form-control"
              id="segundoApellido"
              placeholder="Segundo Apellido"
              value={formData.segundoApellido}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="CI" className="form-label">* CI</label>
            <input
              type="text"
              className="form-control"
              id="CI"
              placeholder="CI"
              value={formData.CI}
              onChange={handleChange}
              required
              pattern="\d+"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="numeroCelular" className="form-label">* Número de Celular</label>
            <input
              type="tel"
              className="form-control"
              id="numeroCelular"
              placeholder="Número de Celular"
              value={formData.numeroCelular}
              onChange={handleChange}
              required
              pattern="\d+"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="rol" className="form-label">* Rol</label>
            <select
              className="form-select"
              id="rol"
              value={formData.rol}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar Rol</option>
              <option value="Medico">Médico</option>
              <option value="Enfermero/a">Enfermero/a</option>
              <option value="Administrador">Administrador</option>
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="EstablecimientoSalud_idEstablecimientoSalud" className="form-label">* Establecimiento de Salud</label>
            <select
              className="form-select"
              id="EstablecimientoSalud_idEstablecimientoSalud"
              value={formData.EstablecimientoSalud_idEstablecimientoSalud}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar Establecimiento</option>
              {establecimientos.map((establecimiento) => {
                return (
                  <option
                    key={establecimiento.id}
                    value={establecimiento.id}
                  >
                    {establecimiento.nombre}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="d-flex justify-content-center mt-4">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar'}
            </button>
            <button type="button" className="btn btn-secondary ms-2" onClick={handleCancel}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
    </Layout>
  );
};

export default RegistrarPersonalSalud;
