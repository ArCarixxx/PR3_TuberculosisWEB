import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "./RegistrarPersonalSalud.css"; // reutilizamos los estilos modernos

const RegistrarEstablecimiento = () => {
  const navigate = useNavigate();
  const [selectedSede, setSelectedSede] = useState("");
  const [selectedRedSalud, setSelectedRedSalud] = useState("");
  const [sedes, setSedes] = useState([]);
  const [redesSalud, setRedesSalud] = useState([]);
  const [nuevaRedSalud, setNuevaRedSalud] = useState("");
  const [clasificacion, setClasificacion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [nombreEstablecimiento, setNombreEstablecimiento] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSedes = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/sedes");
        setSedes(response.data);
      } catch (error) {
        console.error("Error al obtener las sedes:", error);
      }
    };
    fetchSedes();
  }, []);

  useEffect(() => {
    const fetchRedesSalud = async () => {
      if (selectedSede) {
        try {
          const response = await axios.get(
            `http://localhost:3001/api/redesSalud/${selectedSede}`
          );
          setRedesSalud(response.data);
        } catch (error) {
          console.error("Error al obtener las redes de salud:", error);
        }
      } else {
        setRedesSalud([]);
      }
    };
    fetchRedesSalud();
  }, [selectedSede]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRedSalud || !clasificacion || !telefono || !nombreEstablecimiento) {
      alert("Por favor, complete todos los campos obligatorios.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:3001/api/establecimientos",
        {
          nombreEstablecimiento,
          telefono,
          clasificacion,
          idRedSalud: selectedRedSalud,
        }
      );
      alert(response.data.message || "✅ Establecimiento registrado correctamente.");
      setNombreEstablecimiento("");
      setTelefono("");
      setClasificacion("");
      setSelectedSede("");
      setSelectedRedSalud("");
    } catch (error) {
      if (error.response && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        alert("❌ Error registrando el establecimiento. Inténtelo nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRedSalud = async () => {
    if (!nuevaRedSalud || !selectedSede) {
      alert("Ingrese una nueva red de salud y seleccione una sede.");
      return;
    }

    try {
      await axios.post("http://localhost:3001/api/redesSalud", {
        nombreRedSalud: nuevaRedSalud,
        idSede: selectedSede,
      });
      alert("✅ Nueva red de salud creada.");
      setNuevaRedSalud("");
      const response = await axios.get(
        `http://localhost:3001/api/redesSalud/${selectedSede}`
      );
      setRedesSalud(response.data);
    } catch (error) {
      console.error("Error creando la nueva red de salud:", error);
      alert("❌ No se pudo crear la red de salud.");
    }
  };
  const manejarCancelar = () => navigate("/lista-establecimientos");


  return (
    <Layout>
      <div className="form-wrapper">
        <div className="form-card">
          <h2 className="text-center mb-4">Registrar Establecimiento</h2>

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-12 mb-3">
                <label className="form-label">* Nombre del Establecimiento</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: Centro de Salud San Pedro"
                  value={nombreEstablecimiento}
                  onChange={(e) => setNombreEstablecimiento(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">* Teléfono</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Ej: 44556677"
                  value={telefono}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    if (/^\d*$/.test(inputValue)) setTelefono(inputValue);
                  }}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">* Nivel E.S.</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: Primario"
                  value={clasificacion}
                  onChange={(e) => setClasificacion(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">* Sede</label>
                <select
                  className="form-select"
                  value={selectedSede}
                  onChange={(e) => setSelectedSede(e.target.value)}
                  required
                >
                  <option value="">Seleccione una sede</option>
                  {sedes.map((sede) => (
                    <option key={sede.idSede} value={sede.idSede}>
                      {sede.nombreSede}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">* Red de Salud</label>
                <select
                  className="form-select"
                  value={selectedRedSalud}
                  onChange={(e) => setSelectedRedSalud(e.target.value)}
                  required
                >
                  <option value="">Seleccione una red</option>
                  {redesSalud.map((red) => (
                    <option key={red.idRedSalud} value={red.idRedSalud}>
                      {red.nombreRedSalud}
                    </option>
                  ))}
                  <option value="nueva">+ Crear nueva red de salud</option>
                </select>

                {selectedRedSalud === "nueva" && (
                  <div className="mt-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ingrese nueva red de salud"
                      value={nuevaRedSalud}
                      onChange={(e) => setNuevaRedSalud(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-success mt-2"
                      onClick={handleCreateRedSalud}
                    >
                      Crear Red de Salud
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Registrando..." : "Registrar"}
              </button>

                    <button
                      type="button"
                      className="btn btn-secondary ms-2"
                      onClick={manejarCancelar}
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

export default RegistrarEstablecimiento;
