import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/LayoutAdmin";
import "./RegistrarPersonalSalud.css";

const ActualizarPacienteAdmin = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const userEstablecimiento = localStorage.getItem("userEstablecimiento");
  const userIdEstablecimiento = localStorage.getItem("userIdEstablecimiento");

  const [paciente, setPaciente] = useState({
    nombres: "",
    primerApellido: "",
    segundoApellido: "",
    numeroCelular: "",
    fechaNacimiento: "",
    sexo: "",
    direccion: "",
    CI: "",
    complementoCI: "",
    EstablecimientoSalud_idEstablecimientoSalud: userIdEstablecimiento,
    idCriterioIngreso: "",
    tipoExtrapulmonar: "",
  });

  const [criterios, setCriterios] = useState([]);
  const [esExtrapulmonar, setEsExtrapulmonar] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resPaciente, resCrit] = await Promise.all([
          axios.get(`http://localhost:3001/api/pacientes/${id}`),
          axios.get("http://localhost:3001/api/criterios"),
        ]);

        const data = resPaciente.data;

        if (data.fechaNacimiento) {
          data.fechaNacimiento = new Date(data.fechaNacimiento)
            .toISOString()
            .split("T")[0];
        }

        let ciBase = data.CI || "";
        let complementoCI = "";

        if (ciBase.includes("-")) {
          const partes = ciBase.split("-");
          ciBase = partes[0] || "";
          complementoCI = partes[1] || "";
        }

        const criterioActual = resCrit.data.find(
          (c) => c.idCriterioIngreso === data.idCriterioIngreso
        );

        if (criterioActual && criterioActual.tipo === "Extrapulmonar") {
          setEsExtrapulmonar(true);
        }

        setPaciente({
          ...data,
          CI: ciBase,
          complementoCI,
          EstablecimientoSalud_idEstablecimientoSalud: userIdEstablecimiento,
        });

        setCriterios(resCrit.data);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        alert("No se pudieron cargar los datos del paciente.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, userIdEstablecimiento]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "CI") {
      const soloNumeros = value.replace(/\D/g, "");

      setPaciente((prev) => ({
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

      setPaciente((prev) => ({
        ...prev,
        complementoCI: complementoLimpio,
      }));

      return;
    }

    setPaciente((prev) => ({ ...prev, [name]: value }));

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

        setPaciente((prev) => ({
          ...prev,
          tipoExtrapulmonar: "",
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const ciCompleto = paciente.complementoCI
      ? `${paciente.CI}-${paciente.complementoCI}`
      : paciente.CI;

    if (ciCompleto.length > 12) {
      alert("El CI con complemento no puede superar los 12 caracteres.");
      return;
    }

    if (paciente.numeroCelular.length !== 8) {
      alert("El número de celular debe tener exactamente 8 dígitos.");
      return;
    }

    if (esExtrapulmonar && !paciente.tipoExtrapulmonar.trim()) {
      alert("Por favor, especifica el tipo de extrapulmonar.");
      return;
    }

    try {
      const dataToSend = {
        ...paciente,
        CI: ciCompleto,
      };

      delete dataToSend.complementoCI;

      await axios.put(`http://localhost:3001/api/pacientes/${id}`, dataToSend);

      alert("✅ Paciente actualizado correctamente.");
      navigate("/lista-pacientes");
    } catch (error) {
      console.error("Error al actualizar paciente:", error);
      alert("❌ No se pudo actualizar el paciente.");
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
          <h2 className="text-center mb-4">Actualizar Paciente</h2>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">* Nombres</label>
                <input
                  type="text"
                  name="nombres"
                  className="form-control"
                  value={paciente.nombres}
                  onChange={handleChange}
                  placeholder="Ej: Juan Carlos"
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">* Primer Apellido</label>
                <input
                  type="text"
                  name="primerApellido"
                  className="form-control"
                  value={paciente.primerApellido}
                  onChange={handleChange}
                  placeholder="Ej: Pérez"
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Segundo Apellido</label>
                <input
                  type="text"
                  name="segundoApellido"
                  className="form-control"
                  value={paciente.segundoApellido || ""}
                  onChange={handleChange}
                  placeholder="Ej: Gómez"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">* CI</label>
                <input
                  type="text"
                  name="CI"
                  className="form-control"
                  value={paciente.CI}
                  onChange={handleChange}
                  placeholder="Ej: 12345678"
                  maxLength={10}
                  required
                />
              </div>

              <div className="col-md-2">
                <label className="form-label">Complemento</label>
                <input
                  type="text"
                  name="complementoCI"
                  className="form-control"
                  value={paciente.complementoCI || ""}
                  onChange={handleChange}
                  placeholder="Ej: 1A"
                  maxLength={3}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">* Número de Celular</label>
                <input
                  type="text"
                  name="numeroCelular"
                  className="form-control"
                  value={paciente.numeroCelular}
                  onChange={handleChange}
                  placeholder="Ej: 76543210"
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">* Sexo</label>
                <select
                  name="sexo"
                  className="form-select"
                  value={paciente.sexo}
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
                  name="fechaNacimiento"
                  className="form-control"
                  value={paciente.fechaNacimiento}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  className="form-control"
                  value={paciente.direccion || ""}
                  onChange={handleChange}
                  placeholder="Ej: Av. América #123"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">* Criterio de Ingreso</label>
                <select
                  name="idCriterioIngreso"
                  className="form-select"
                  value={paciente.idCriterioIngreso}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar Criterio</option>
                  {criterios.map((c) => (
                    <option
                      key={c.idCriterioIngreso}
                      value={c.idCriterioIngreso}
                    >
                      {`${c.tipo} ${c.subtipo ? `- ${c.subtipo}` : ""} (${c.estadoIngreso})`}
                    </option>
                  ))}
                </select>
              </div>

              {esExtrapulmonar && (
                <div className="col-md-6">
                  <label className="form-label">* Tipo de Extrapulmonar</label>
                  <input
                    type="text"
                    name="tipoExtrapulmonar"
                    className="form-control"
                    placeholder="Ej: pleural, ganglionar..."
                    value={paciente.tipoExtrapulmonar || ""}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

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
                Actualizar
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/lista-pacientes")}
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

export default ActualizarPacienteAdmin;