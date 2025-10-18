import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "./RegistrarPersonalSalud.css"; // nuevo estilo visual

const RegistrarPersonalSalud = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombres: "",
    primerApellido: "",
    segundoApellido: "",
    CI: "",
    numeroCelular: "",
    rol: "",
    EstablecimientoSalud_idEstablecimientoSalud: "",
  });

  const [establecimientos, setEstablecimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEstablecimientos = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/establecimientos");
        setEstablecimientos(response.data);
      } catch (error) {
        console.error("Error al obtener los establecimientos:", error);
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
    setError("");

    const { CI, numeroCelular } = formData;
    if (!/^\d+$/.test(CI) || !/^\d+$/.test(numeroCelular)) {
      setError("El CI y el número de celular solo pueden contener números.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:3001/api/personalSalud", formData);

      const usuario = `${formData.nombres.slice(0, 3).toLowerCase()}${formData.primerApellido
        .slice(0, 3)
        .toLowerCase()}`;
      const contrasenia = CI;

      alert(
        `✅ Personal de salud registrado.\n\nCredenciales generadas:\nUsuario: ${usuario}\nContraseña: ${contrasenia}`
      );

      navigate("/lista-personal-saludSA");
    } catch (error) {
      if (error.response && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError("Hubo un error al registrar el personal de salud.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/lista-personal-saludSA");
  };

  return (
    <Layout>
      <div className="form-wrapper">
        <div className="form-card">
          <h2 className="text-center mb-4">Registrar Personal de Salud</h2>

          {error && <div className="alert alert-danger text-center">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">* Nombres</label>
                <input
                  type="text"
                  className="form-control"
                  id="nombres"
                  placeholder="Ej: Juan Carlos"
                  value={formData.nombres}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">* Primer Apellido</label>
                <input
                  type="text"
                  className="form-control"
                  id="primerApellido"
                  placeholder="Ej: Pérez"
                  value={formData.primerApellido}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Segundo Apellido</label>
                <input
                  type="text"
                  className="form-control"
                  id="segundoApellido"
                  placeholder="Ej: Gómez"
                  value={formData.segundoApellido}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">* CI</label>
                <input
                  type="text"
                  className="form-control"
                  id="CI"
                  placeholder="Ej: 12345678"
                  value={formData.CI}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">* Número de Celular</label>
                <input
                  type="tel"
                  className="form-control"
                  id="numeroCelular"
                  placeholder="Ej: 76543210"
                  value={formData.numeroCelular}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">* Rol</label>
                <select
                  className="form-select"
                  id="rol"
                  value={formData.rol}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar Rol</option>
                  <option value="Medico">Médico</option>
                  <option value="Enfermero">Enfermero/a</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>

              <div className="col-md-12 mb-3">
                <label className="form-label">* Establecimiento de Salud</label>
                <select
                  className="form-select"
                  id="EstablecimientoSalud_idEstablecimientoSalud"
                  value={formData.EstablecimientoSalud_idEstablecimientoSalud}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar Establecimiento</option>
                  {establecimientos.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Registrando..." : "Registrar"}
              </button>
              <button
                type="button"
                className="btn btn-secondary ms-2"
                onClick={handleCancel}
              >
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
