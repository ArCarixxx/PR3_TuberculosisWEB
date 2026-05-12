import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/LayoutPersonalSalud";
import "./Transferencia.css";

const TransferenciaAdmin = () => {
  const navigate = useNavigate();

  const userEstablecimiento = localStorage.getItem("userEstablecimiento");
  const userIdEstablecimiento = localStorage.getItem("userIdEstablecimiento");

  const [formData, setFormData] = useState({
    idEstablecimientoSaludOrigen: userIdEstablecimiento,
    idEstablecimientoSaludDestino: "",
    persona_idPersona: "",
    Motivo: "",
    Observacion: "",
    documentoRef: null,
  });

  const [establecimientos, setEstablecimientos] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [personaSeleccionada, setPersonaSeleccionada] = useState(null);
  const [establecimientoOrigen, setEstablecimientoOrigen] = useState(null);
  const [establecimientoDestino, setEstablecimientoDestino] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:3001/api/establecimientos").then((res) =>
        res.json()
      ),
      fetch(
        `http://localhost:3001/api/pacientesEst?userIdEstablecimiento=${userIdEstablecimiento}`
      ).then((res) => res.json()),
    ])
      .then(([dataEst, dataPac]) => {
        setEstablecimientos(dataEst);
        setPersonas(dataPac);

        const origen = dataEst.find(
          (e) => String(e.id) === String(userIdEstablecimiento)
        );

        setEstablecimientoOrigen(origen || null);
      })
      .catch((error) => {
        console.error("Error cargando datos:", error);
        setStatusMessage("Error al cargar datos iniciales.");
      });
  }, [userIdEstablecimiento]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "documentoRef") {
      const file = files[0];

      if (!file) return;

      if (file.type !== "application/pdf") {
        alert("Solo se permite subir documentos PDF.");
        setPdfPreview(null);
        setFormData((prev) => ({ ...prev, documentoRef: null }));
        return;
      }

      setFormData((prev) => ({ ...prev, documentoRef: file }));
      setPdfPreview(URL.createObjectURL(file));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "persona_idPersona") {
      const selectedPersona = personas.find(
        (p) => String(p.idPersona) === String(value)
      );

      setPersonaSeleccionada(selectedPersona || null);
    }

    if (name === "idEstablecimientoSaludDestino") {
      const estDestino = establecimientos.find(
        (e) => String(e.id) === String(value)
      );

      setEstablecimientoDestino(estDestino || null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.documentoRef) {
      alert("Por favor seleccione un documento PDF de referencia.");
      return;
    }

    if (
      String(formData.idEstablecimientoSaludOrigen) ===
      String(formData.idEstablecimientoSaludDestino)
    ) {
      alert("El establecimiento de origen y destino no pueden ser el mismo.");
      return;
    }

    setLoading(true);
    setStatusMessage("");

    const payload = {
      idEstablecimientoSaludOrigen: formData.idEstablecimientoSaludOrigen,
      idPersona: formData.persona_idPersona,
      idEstablecimientoSaludDestino: formData.idEstablecimientoSaludDestino,
      Motivo: formData.Motivo,
      Observacion: formData.Observacion,
      documentoRef: null,
    };

    const reader = new FileReader();

    reader.onloadend = async () => {
      payload.documentoRef = reader.result.split(",")[1];

      try {
        const response = await fetch("http://localhost:3001/api/transferencias", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          setStatusMessage("Registro exitoso");
          setTimeout(() => navigate("/lista-transferenciasPS"), 1500);
        } else {
          const errorText = await response.text();
          setStatusMessage(`Error: ${errorText}`);
        }
      } catch (error) {
        console.error("Error al enviar:", error);
        setStatusMessage("Error al enviar la transferencia.");
      } finally {
        setLoading(false);
      }
    };

    reader.readAsDataURL(formData.documentoRef);
  };

  return (
    <Layout>
      <div className="transfer-page">
        <div className="transfer-header">
          <div>
            <h1>Registrar Transferencia</h1>
            <p>
              Registra la transferencia de un paciente desde{" "}
              <strong>{userEstablecimiento}</strong>.
            </p>
          </div>

          <button
            className="btn-transfer-secondary"
            onClick={() => navigate("/lista-transferenciasPS")}
          >
            Ver transferencias
          </button>
        </div>

        <div className="transfer-grid">
          <form onSubmit={handleSubmit} className="transfer-card">
            <h3>Datos de transferencia</h3>

            <div className="form-group">
              <label>Paciente *</label>
              <select
                name="persona_idPersona"
                value={formData.persona_idPersona}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione un paciente</option>
                {personas.map((p) => (
                  <option key={p.idPersona} value={p.idPersona}>
                    {p.nombreCompleto}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Establecimiento de Origen *</label>
              <input
                type="text"
                value={userEstablecimiento || ""}
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Establecimiento de Destino *</label>
              <select
                name="idEstablecimientoSaludDestino"
                value={formData.idEstablecimientoSaludDestino}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione un establecimiento</option>
                {establecimientos
                  .filter(
                    (e) =>
                      String(e.id) !== String(userIdEstablecimiento)
                  )
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre}
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-group">
              <label>Motivo *</label>
              <select
                name="Motivo"
                value={formData.Motivo}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar motivo</option>
                <option value="Urgencia">Urgencia</option>
                <option value="Emergencia">Emergencia</option>
                <option value="Consulta Externa">Consulta Externa</option>
                <option value="Interconsulta">Interconsulta</option>
                <option value="Servicio/Especialidad">
                  Servicio/Especialidad
                </option>
                <option value="Telesalud">Telesalud</option>
              </select>
            </div>

            <div className="form-group">
              <label>Observación</label>
              <textarea
                name="Observacion"
                value={formData.Observacion}
                onChange={handleChange}
                rows="3"
                maxLength="200"
                placeholder="Máximo 200 caracteres..."
              ></textarea>
              <small>
                {200 - formData.Observacion.length} caracteres restantes
              </small>
            </div>

            <div className="form-group">
              <label>Documento de Transferencia PDF *</label>
              <input
                type="file"
                name="documentoRef"
                onChange={handleChange}
                accept=".pdf"
                required
              />
            </div>

            <button
              type="submit"
              className="btn-transfer-primary"
              disabled={loading}
            >
              {loading ? "Registrando..." : "Registrar Transferencia"}
            </button>

            {statusMessage && (
              <p
                className={`status-msg ${
                  statusMessage === "Registro exitoso" ? "success" : "error"
                }`}
              >
                {statusMessage}
              </p>
            )}
          </form>

          <div className="transfer-detail-card">
            <h3>Vista previa de la transferencia</h3>

            <div className="detail-section">
              <h5>Paciente</h5>
              <p>
                <strong>Nombre:</strong>{" "}
                {personaSeleccionada?.nombreCompleto || "N/A"}
              </p>
              <p>
                <strong>CI:</strong> {personaSeleccionada?.CI || "N/A"}
              </p>
              <p>
                <strong>Sexo:</strong> {personaSeleccionada?.sexo || "N/A"}
              </p>
              <p>
                <strong>Fecha Nacimiento:</strong>{" "}
                {personaSeleccionada?.fechaNacimiento
                  ? new Date(
                      personaSeleccionada.fechaNacimiento
                    ).toLocaleDateString("es-BO")
                  : "N/A"}
              </p>
            </div>

            <div className="detail-section">
              <h5>Establecimiento Origen</h5>
              <p>
                <strong>Nombre:</strong>{" "}
                {establecimientoOrigen?.nombre || userEstablecimiento || "N/A"}
              </p>
              <p>
                <strong>Clasificación:</strong>{" "}
                {establecimientoOrigen?.clasificacion || "N/A"}
              </p>
              <p>
                <strong>Teléfono:</strong>{" "}
                {establecimientoOrigen?.telefono || "N/A"}
              </p>
            </div>

            <div className="detail-section">
              <h5>Establecimiento Destino</h5>
              <p>
                <strong>Nombre:</strong>{" "}
                {establecimientoDestino?.nombre || "N/A"}
              </p>
              <p>
                <strong>Clasificación:</strong>{" "}
                {establecimientoDestino?.clasificacion || "N/A"}
              </p>
              <p>
                <strong>Teléfono:</strong>{" "}
                {establecimientoDestino?.telefono || "N/A"}
              </p>
            </div>

            {pdfPreview && (
              <div className="detail-section pdf-preview">
                <h5>Documento seleccionado</h5>
                <iframe
                  src={pdfPreview}
                  title="Vista previa PDF"
                  className="pdf-frame"
                ></iframe>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TransferenciaAdmin;