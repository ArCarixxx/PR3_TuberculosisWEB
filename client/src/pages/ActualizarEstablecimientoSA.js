import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import "./RegistrarPersonalSalud.css";

const ActualizarEstablecimientoSA = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    nombreEstablecimiento: "",
    telefono: "",
    clasificacion: "",
    nombreSede: "",
    nombreRedSalud: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const niveles = [
    "Primer Nivel",
    "Segundo Nivel",
    "Tercer Nivel",
  ];

  useEffect(() => {
    const obtenerEstablecimiento = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/establecimientos/lista"
        );

        const establecimiento = response.data.find(
          (e) => String(e.id) === String(id)
        );

        if (!establecimiento) {
          setError("No se encontró el establecimiento seleccionado.");
          return;
        }

        setFormData({
          nombreEstablecimiento: establecimiento.nombreEstablecimiento || "",
          telefono: establecimiento.telefono || "",
          clasificacion: establecimiento.clasificacion || "",
          nombreSede: establecimiento.nombreSede || "",
          nombreRedSalud: establecimiento.nombreRedSalud || "",
        });
      } catch (error) {
        console.error("Error al cargar establecimiento:", error);
        setError("No se pudieron cargar los datos del establecimiento.");
      }
    };

    obtenerEstablecimiento();
  }, [id]);

  const handleChange = (e) => {
    const { id, value } = e.target;

    if (id === "telefono") {
      const soloNumeros = value.replace(/\D/g, "");
      setFormData({
        ...formData,
        telefono: soloNumeros,
      });
      return;
    }

    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.telefono.trim()) {
      setError("El número de teléfono es obligatorio.");
      setLoading(false);
      return;
    }

    if (!/^\d+$/.test(formData.telefono)) {
      setError("El teléfono solo puede contener números.");
      setLoading(false);
      return;
    }

    if (!formData.clasificacion.trim()) {
      setError("Debe seleccionar el nivel del establecimiento.");
      setLoading(false);
      return;
    }

    try {
      const dataToSend = {
        telefono: formData.telefono,
        clasificacion: formData.clasificacion,
      };

      await axios.put(
        `http://localhost:3001/api/establecimientos/${id}`,
        dataToSend
      );

      alert("✅ Establecimiento actualizado correctamente.");

      navigate("/lista-establecimientos");
    } catch (error) {
      console.error("Error al actualizar establecimiento:", error);

      if (error.response && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError("Hubo un error al actualizar el establecimiento.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/lista-establecimientos");
  };

  return (
    <Layout>
      <div className="form-wrapper">
        <div className="form-card">
          <h2 className="text-center mb-4">Actualizar Establecimiento</h2>

          {error && (
            <div className="alert alert-danger text-center">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-12 mb-3">
                <label className="form-label">Nombre del Establecimiento</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.nombreEstablecimiento}
                  readOnly
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Sede</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.nombreSede}
                  readOnly
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Red de Salud</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.nombreRedSalud}
                  readOnly
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">* Teléfono</label>
                <input
                  type="text"
                  className="form-control"
                  id="telefono"
                  placeholder="Ej: 4256789"
                  value={formData.telefono}
                  onChange={handleChange}
                  maxLength={15}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">* Nivel E.S.</label>
                <select
                  className="form-select"
                  id="clasificacion"
                  value={formData.clasificacion}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar nivel</option>
                  {niveles.map((nivel) => (
                    <option key={nivel} value={nivel}>
                      {nivel}
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
                {loading ? "Actualizando..." : "Actualizar"}
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

export default ActualizarEstablecimientoSA;