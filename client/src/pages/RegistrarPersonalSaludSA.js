import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "./RegistrarPersonalSalud.css";

const RegistrarPersonalSalud = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombres: "",
    primerApellido: "",
    segundoApellido: "",
    CI: "",
    complementoCI: "",
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
        const response = await axios.get(
          "http://localhost:3001/api/establecimientos"
        );
        setEstablecimientos(response.data);
      } catch (error) {
        console.error("Error al obtener los establecimientos:", error);
      }
    };

    fetchEstablecimientos();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;

    if (id === "CI") {
      const soloNumeros = value.replace(/\D/g, "");
      setFormData({
        ...formData,
        CI: soloNumeros,
      });
      return;
    }

    if (id === "complementoCI") {
      const complementoLimpio = value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 3);

      setFormData({
        ...formData,
        complementoCI: complementoLimpio,
      });
      return;
    }

    if (id === "numeroCelular") {
      const soloNumeros = value.replace(/\D/g, "");
      setFormData({
        ...formData,
        numeroCelular: soloNumeros,
      });
      return;
    }

    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const construirCICompleto = () => {
    const ciBase = formData.CI.trim();
    const complemento = formData.complementoCI.trim();

    return complemento ? `${ciBase}-${complemento}` : ciBase;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const ciCompleto = construirCICompleto();

    if (!formData.CI.trim()) {
      setError("El número de CI es obligatorio.");
      setLoading(false);
      return;
    }

    if (!/^\d+$/.test(formData.CI)) {
      setError("El número de CI solo puede contener números.");
      setLoading(false);
      return;
    }

    if (ciCompleto.length > 12) {
      setError("El CI con complemento no puede superar los 12 caracteres.");
      setLoading(false);
      return;
    }

    if (!/^\d+$/.test(formData.numeroCelular)) {
      setError("El número de celular solo puede contener números.");
      setLoading(false);
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        CI: ciCompleto,
      };

      delete dataToSend.complementoCI;

      await axios.post("http://localhost:3001/api/personalSalud", dataToSend);

      const usuario = `${formData.nombres
        .slice(0, 3)
        .toLowerCase()}${formData.primerApellido.slice(0, 3).toLowerCase()}`;

      const contrasenia = ciCompleto;

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

          {error && (
            <div className="alert alert-danger text-center">{error}</div>
          )}

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

              <div className="col-md-4 mb-3">
                <label className="form-label">* CI</label>
                <input
                  type="text"
                  className="form-control"
                  id="CI"
                  placeholder="Ej: 12345678"
                  value={formData.CI}
                  onChange={handleChange}
                  maxLength={10}
                  required
                />
              </div>

              <div className="col-md-2 mb-3">
                <label className="form-label">Complemento</label>
                <input
                  type="text"
                  className="form-control"
                  id="complementoCI"
                  placeholder="Ej: 1A"
                  value={formData.complementoCI}
                  onChange={handleChange}
                  maxLength={3}
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
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
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