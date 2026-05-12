import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/LayoutAdmin";
import "./RegistrarPersonalSalud.css";

const ActualizarPersonalSalud = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const userEstablecimiento =
    localStorage.getItem("userEstablecimiento") || "Establecimiento no definido";

  const userIdEstablecimiento = localStorage.getItem("userIdEstablecimiento");

  const [formData, setFormData] = useState({
    nombres: "",
    primerApellido: "",
    segundoApellido: "",
    CI: "",
    complementoCI: "",
    numeroCelular: "",
    rol: "",
    EstablecimientoSalud_idEstablecimientoSalud: userIdEstablecimiento,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const separarCI = (ciCompleto = "") => {
    if (ciCompleto.includes("-")) {
      const [ciBase, complemento] = ciCompleto.split("-");
      return {
        CI: ciBase || "",
        complementoCI: complemento || "",
      };
    }

    return {
      CI: ciCompleto || "",
      complementoCI: "",
    };
  };

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/personalSalud/establecimiento",
          {
            params: {
              userIdEstablecimiento,
            },
          }
        );

        const listaPersonal = response.data;

        const personal = listaPersonal.find(
          (p) => String(p.idPersona) === String(id)
        );

        if (!personal) {
          setError("No se encontró el personal de salud seleccionado.");
          return;
        }

        const ciSeparado = separarCI(personal.CI);

        setFormData({
          nombres: personal.nombres || "",
          primerApellido: personal.primerApellido || "",
          segundoApellido: personal.segundoApellido || "",
          CI: ciSeparado.CI,
          complementoCI: ciSeparado.complementoCI,
          numeroCelular: personal.numeroCelular || "",
          rol: personal.rol || "",
          EstablecimientoSalud_idEstablecimientoSalud: userIdEstablecimiento,
        });
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setError("No se pudieron cargar los datos del personal de salud.");
      }
    };

    obtenerDatos();
  }, [id, userIdEstablecimiento]);

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

    if (!formData.numeroCelular.trim()) {
      setError("El número de celular es obligatorio.");
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
        EstablecimientoSalud_idEstablecimientoSalud: userIdEstablecimiento,
      };

      delete dataToSend.complementoCI;

      await axios.put(
        `http://localhost:3001/api/personalSalud/${id}`,
        dataToSend
      );

      alert("✅ Personal de salud actualizado correctamente.");

      navigate("/lista-personal-salud");
    } catch (error) {
      if (error.response && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError("Hubo un error al actualizar el personal de salud.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/lista-personal-salud");
  };

  return (
    <Layout>
      <div className="form-wrapper">
        <div className="form-card">
          <h2 className="text-center mb-4">Actualizar Personal de Salud</h2>

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
                </select>
              </div>

              <div className="col-md-12 mb-3">
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

export default ActualizarPersonalSalud;