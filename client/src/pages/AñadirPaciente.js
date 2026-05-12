import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/LayoutAdmin";
import "./RegistrarPersonalSalud.css";

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
    complementoCI: "",
    EstablecimientoSalud_idEstablecimientoSalud:
      userIdEstablecimiento,
    idCriterioIngreso: "",
    tipoExtrapulmonar: "",
  });

  const [criterios, setCriterios] = useState([]);
  const [esExtrapulmonar, setEsExtrapulmonar] = useState(false);
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

  // 🔹 Manejar cambios
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "CI") {
      const soloNumeros = value.replace(/\D/g, "");

      setNuevoPaciente((prev) => ({
        ...prev,
        CI: soloNumeros,
      }));

      return;
    }

    if (name === "complementoCI") {
      const complementoLimpio = value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 3);

      setNuevoPaciente((prev) => ({
        ...prev,
        complementoCI: complementoLimpio,
      }));

      return;
    }

    setNuevoPaciente((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Detectar si el criterio es extrapulmonar
    if (name === "idCriterioIngreso") {
      const criterioSeleccionado = criterios.find(
        (c) => c.idCriterioIngreso.toString() === value
      );

      if (
        criterioSeleccionado &&
        criterioSeleccionado.tipo === "Extrapulmonar"
      ) {
        setEsExtrapulmonar(true);
      } else {
        setEsExtrapulmonar(false);

        setNuevoPaciente((prev) => ({
          ...prev,
          tipoExtrapulmonar: "",
        }));
      }
    }
  };

  // 🔹 Registrar paciente
  const handleSubmit = async (e) => {
    e.preventDefault();

    const ciCompleto = nuevoPaciente.complementoCI
      ? `${nuevoPaciente.CI}-${nuevoPaciente.complementoCI}`
      : nuevoPaciente.CI;

    if (ciCompleto.length > 12) {
      alert("El CI con complemento no puede superar los 12 caracteres.");
      return;
    }

    if (nuevoPaciente.numeroCelular.length !== 8) {
      alert("El número de celular debe tener exactamente 8 dígitos.");
      return;
    }

    if (!nuevoPaciente.idCriterioIngreso) {
      alert("Por favor selecciona un criterio de ingreso.");
      return;
    }

    if (
      esExtrapulmonar &&
      !nuevoPaciente.tipoExtrapulmonar.trim()
    ) {
      alert("Por favor, especifica el tipo de extrapulmonar.");
      return;
    }

    try {
      const dataToSend = {
        ...nuevoPaciente,
        CI: ciCompleto,
      };

      delete dataToSend.complementoCI;

      await axios.post(
        "http://localhost:3001/api/pacientes",
        dataToSend
      );

      alert("✅ Paciente registrado correctamente.");
      navigate("/lista-pacientes");
    } catch (error) {
      console.error("Error al registrar paciente:", error);
      alert("❌ No se pudo registrar el paciente.");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center mt-5">
          Cargando datos...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="form-wrapper">
        <div className="form-card">
          <h2 className="text-center mb-4">
            Registrar Paciente
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">
                  * Nombres
                </label>
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
                <label className="form-label">
                  * Primer Apellido
                </label>
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
                <label className="form-label">
                  Segundo Apellido
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: Gómez"
                  name="segundoApellido"
                  value={nuevoPaciente.segundoApellido}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">* CI</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: 12345678"
                  name="CI"
                  value={nuevoPaciente.CI}
                  onChange={handleChange}
                  maxLength={10}
                  required
                />
              </div>

              <div className="col-md-2">
                <label className="form-label">
                  Complemento
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: 1A"
                  name="complementoCI"
                  value={nuevoPaciente.complementoCI}
                  onChange={handleChange}
                  maxLength={3}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  * Número de Celular
                </label>
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
                  <option value="">
                    Seleccionar Sexo
                  </option>
                  <option value="Masculino">
                    Masculino
                  </option>
                  <option value="Femenino">
                    Femenino
                  </option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  * Fecha de Nacimiento
                </label>
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
                <label className="form-label">
                  Dirección
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: Av. América #123"
                  name="direccion"
                  value={nuevoPaciente.direccion}
                  onChange={handleChange}
                />
              </div>

              {/* 🔹 Criterio de ingreso */}
              <div className="col-md-6">
                <label className="form-label">
                  * Criterio de Ingreso
                </label>
                <select
                  className="form-select"
                  name="idCriterioIngreso"
                  value={nuevoPaciente.idCriterioIngreso}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Seleccionar Criterio
                  </option>

                  {criterios.map((c) => (
                    <option
                      key={c.idCriterioIngreso}
                      value={c.idCriterioIngreso}
                    >
                      {`${c.tipo} ${
                        c.subtipo
                          ? `- ${c.subtipo}`
                          : ""
                      } (${c.estadoIngreso})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* 🔹 SOLO si es extrapulmonar */}
              {esExtrapulmonar && (
                <div className="col-md-6">
                  <label className="form-label">
                    * Tipo de Extrapulmonar
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="tipoExtrapulmonar"
                    placeholder="Ej: pleural, ganglionar..."
                    value={nuevoPaciente.tipoExtrapulmonar}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <div className="col-md-6">
                <label className="form-label">
                  Establecimiento de Salud
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={userEstablecimiento}
                  readOnly
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary me-2"
              >
                Registrar
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  navigate("/lista-pacientes")
                }
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