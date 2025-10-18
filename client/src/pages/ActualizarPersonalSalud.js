import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/LayoutAdmin";
import "./RegistrarPersonalSalud.css"; // reutilizamos el mismo CSS elegante

const ActualizarPersonalSalud = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    nombres: "",
    primerApellido: "",
    segundoApellido: "",
    numeroCelular: "",
    rol: "",
    CI: "",
    EstablecimientoSalud_idEstablecimientoSalud: "",
  });
  const [cargando, setCargando] = useState(true);

  const userEstablecimiento = localStorage.getItem("userEstablecimiento");
  const userIdEstablecimiento = localStorage.getItem("userIdEstablecimiento");

  // --- Cargar datos del personal seleccionado ---
  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3001/api/personalSalud/establecimiento",
          { params: { userIdEstablecimiento } }
        );

        const personal = res.data.find(
          (p) => p.idPersona === parseInt(id, 10)
        );

        if (!personal) {
          alert("No se encontró el personal seleccionado.");
          navigate("/lista-personal-salud");
          return;
        }

        setFormData({
          nombres: personal.nombres || "",
          primerApellido: personal.primerApellido || "",
          segundoApellido: personal.segundoApellido || "",
          numeroCelular: personal.numeroCelular || "",
          rol: personal.rol || "",
          CI: personal.CI || "",
          EstablecimientoSalud_idEstablecimientoSalud:
            personal.EstablecimientoSalud_idEstablecimientoSalud ||
            userIdEstablecimiento,
        });
      } catch (error) {
        console.error("Error al obtener los datos:", error);
        alert("Error al cargar los datos del personal.");
      } finally {
        setCargando(false);
      }
    };

    obtenerDatos();
  }, [id, userIdEstablecimiento, navigate]);

  // --- Manejar cambios ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --- Guardar cambios ---
  const actualizarPersonalSalud = async () => {
    try {
      await axios.put(
        `http://localhost:3001/api/personalSalud/${id}`,
        formData
      );
      alert("✅ Personal de salud actualizado correctamente.");
      navigate("/lista-personal-salud");
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("❌ No se pudo actualizar el registro.");
    }
  };

  const manejarCancelar = () => navigate("/lista-personal-salud");

  if (cargando) {
    return (
      <Layout>
        <div className="container text-center mt-5">
          <h5>Cargando datos del personal...</h5>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="form-wrapper">
        <div className="form-card">
          <h2 className="text-center mb-4">Actualizar Personal de Salud</h2>

          <form>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Nombres:</label>
                <input
                  type="text"
                  className="form-control"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Primer Apellido:</label>
                <input
                  type="text"
                  className="form-control"
                  name="primerApellido"
                  value={formData.primerApellido}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Segundo Apellido:</label>
                <input
                  type="text"
                  className="form-control"
                  name="segundoApellido"
                  value={formData.segundoApellido}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">CI:</label>
                <input
                  type="text"
                  className="form-control"
                  name="CI"
                  value={formData.CI}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Número de Celular:</label>
                <input
                  type="text"
                  className="form-control"
                  name="numeroCelular"
                  value={formData.numeroCelular}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Rol:</label>
                <select
                  className="form-select"
                  name="rol"
                  value={formData.rol}
                  onChange={handleInputChange}
                >
                  <option value="">Selecciona un rol</option>
                  <option value="Medico">Médico</option>
                  <option value="Enfermero">Enfermero/a</option>
                </select>
              </div>

              <div className="col-md-12 mb-3">
                <label className="form-label">Establecimiento de Salud:</label>
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
                type="button"
                className="btn btn-primary"
                onClick={actualizarPersonalSalud}
              >
                Actualizar
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

export default ActualizarPersonalSalud;
