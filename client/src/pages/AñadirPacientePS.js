import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/LayoutPersonalSalud";
import "./RegistrarPersonalSalud.css"; // Usa el mismo CSS para mantener el estilo

const RegistrarPacienteAdmin = () => {
  const navigate = useNavigate();

  const userEstablecimiento = localStorage.getItem("userEstablecimiento");
  const userIdEstablecimiento = localStorage.getItem("userIdEstablecimiento");

  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombres: "",
    primerApellido: "",
    segundoApellido: "",
    numeroCelular: "",
    fechaNacimiento: "",
    sexo: "",
    direccion: "",
    CI: "",
    EstablecimientoSalud_idEstablecimientoSalud: userIdEstablecimiento,
    idCriterioIngreso: "",
  });

  const [criterios, setCriterios] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Cargar criterios
  useEffect(() => {
    const fetchCriterios = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/criterios");
        setCriterios(res.data);
      } catch (error) {
        console.error("Error al obtener los criterios:", error);
        alert("No se pudieron cargar los criterios de ingreso.");
      } finally {
        setLoading(false);
      }
    };
    fetchCriterios();
  }, []);

  // 🔹 Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoPaciente((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nuevoPaciente.numeroCelular.length !== 8) {
      alert("El número de celular debe tener exactamente 8 dígitos.");
      return;
    }

    if (!nuevoPaciente.idCriterioIngreso) {
      alert("Por favor selecciona un criterio de ingreso.");
      return;
    }

    try {
      await axios.post("http://localhost:3001/api/pacientes", nuevoPaciente);
      alert("✅ Paciente registrado correctamente.");
      navigate("/lista-pacientesPS");
    } catch (error) {
      console.error("Error al registrar paciente:", error);
      alert("❌ No se pudo registrar el paciente.");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center mt-5">Cargando datos...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="form-wrapper">
        <div className="form-card">
          <h2 className="text-center mb-4">Registrar Paciente</h2>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">* Nombres</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: Juan Carlos"
                  name="nombres"
                  value={nuevoPaciente.nombres}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">* Primer Apellido</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: Pérez"
                  name="primerApellido"
                  value={nuevoPaciente.primerApellido}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Segundo Apellido</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: Gómez"
                  name="segundoApellido"
                  value={nuevoPaciente.segundoApellido}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">* CI</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: 12345678"
                  name="CI"
                  value={nuevoPaciente.CI}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">* Número de Celular</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: 76543210"
                  name="numeroCelular"
                  value={nuevoPaciente.numeroCelular}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">* Sexo</label>
                <select
                  className="form-select"
                  name="sexo"
                  value={nuevoPaciente.sexo}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar Sexo</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">* Fecha de Nacimiento</label>
                <input
                  type="date"
                  className="form-control"
                  name="fechaNacimiento"
                  value={nuevoPaciente.fechaNacimiento}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Dirección</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: Av. América #123"
                  name="direccion"
                  value={nuevoPaciente.direccion}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">* Criterio de Ingreso</label>
                <select
                  className="form-select"
                  name="idCriterioIngreso"
                  value={nuevoPaciente.idCriterioIngreso}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar Criterio</option>
                  {criterios.map((c) => (
                    <option key={c.idCriterioIngreso} value={c.idCriterioIngreso}>
                      {`${c.tipo} ${c.subtipo ? `- ${c.subtipo}` : ""} (${c.estadoIngreso})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Establecimiento de Salud</label>
                <input
                  type="text"
                  className="form-control"
                  value={userEstablecimiento}
                  readOnly
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary me-2">
                Registrar
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/lista-pacientesPS")}
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

export default RegistrarPacienteAdmin;
