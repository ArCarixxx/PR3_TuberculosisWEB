import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import "./RegistrarPersonalSalud.css"; // reutilizamos el mismo estilo elegante

const ActualizarPersonalSalud = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [establecimientos, setEstablecimientos] = useState([]);
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

  // --- Obtener datos iniciales ---
  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const resPersonal = await axios.get("http://localhost:3001/api/personalSalud");
        const personal = resPersonal.data.find((p) => p.idPersona === parseInt(id));

        if (!personal) {
          alert("No se encontró el personal de salud.");
          navigate("/lista-personal-saludSA");
          return;
        }

        const establecimientoId =
          personal.EstablecimientoSalud_idEstablecimientoSalud ||
          personal.idEstablecimientoSalud ||
          (personal.EstablecimientoSalud &&
            personal.EstablecimientoSalud.idEstablecimientoSalud) ||
          "";

        setFormData({
          nombres: personal.nombres || "",
          primerApellido: personal.primerApellido || "",
          segundoApellido: personal.segundoApellido || "",
          numeroCelular: personal.numeroCelular || "",
          rol: personal.rol || "",
          CI: personal.CI || "",
          EstablecimientoSalud_idEstablecimientoSalud: establecimientoId,
        });

        const resEst = await axios.get("http://localhost:3001/api/establecimientos");
        setEstablecimientos(resEst.data);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setCargando(false);
      }
    };

    obtenerDatos();
  }, [id, navigate]);

  // --- Manejar cambios en inputs ---
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
      await axios.put(`http://localhost:3001/api/personalSalud/${id}`, formData);
      alert("✅ Personal de salud actualizado correctamente.");
      navigate("/lista-personal-saludSA");
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("❌ No se pudo actualizar el registro.");
    }
  };

  // --- Cancelar ---
  const manejarCancelar = () => navigate("/lista-personal-saludSA");

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
                  <option value="Administrador">Administrador/a</option>
                </select>
              </div>

              <div className="col-md-12 mb-3">
                <label className="form-label">Establecimiento:</label>
                <select
                  className="form-select"
                  name="EstablecimientoSalud_idEstablecimientoSalud"
                  value={formData.EstablecimientoSalud_idEstablecimientoSalud}
                  onChange={handleInputChange}
                >
                  <option value="">Selecciona un establecimiento</option>
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
