import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/LayoutPersonalSalud";
import "./Transferencia.css";

const TransferenciaAdmin = () => {
  const [formData, setFormData] = useState({
    idEstablecimientoSaludOrigen: "",
    idEstablecimientoSaludDestino: "",
    persona_idPersona: "",
    Motivo: "",
    Observacion: "",
    documentoRef: null,
  });

  const [establecimientos, setEstablecimientos] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [personaSeleccionada, setPersonaSeleccionada] = useState(null);
  const [establecimientoDestino, setEstablecimientoDestino] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null); // 👈 NUEVO estado para vista previa
  const [statusMessage, setStatusMessage] = useState("");

  const navigate = useNavigate();

  const userEstablecimiento = localStorage.getItem("userEstablecimiento");
  const userIdEstablecimiento = localStorage.getItem("userIdEstablecimiento");

  // 🔹 Cargar establecimientos y pacientes
  useEffect(() => {
    Promise.all([
      fetch("http://localhost:3001/api/establecimientos").then((res) => res.json()),
      fetch(
        `http://localhost:3001/api/pacientesEstablecimiento?idEstablecimiento=${userIdEstablecimiento}`
      ).then((res) => res.json()),
    ])
      .then(([dataEst, dataPac]) => {
        setEstablecimientos(dataEst);
        setPersonas(dataPac);

        const estOrigen = dataEst.find(
          (e) => e.id.toString() === userIdEstablecimiento.toString()
        );
        if (estOrigen) {
          setFormData((prev) => ({
            ...prev,
            idEstablecimientoSaludOrigen: estOrigen.id.toString(),
          }));
        }
      })
      .catch((error) => console.error("Error cargando datos:", error));
  }, [userIdEstablecimiento]);

  // 🔹 Manejar cambios del formulario
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "documentoRef") {
      const file = files[0];
      setFormData({ ...formData, documentoRef: file });

      if (file && file.type === "application/pdf") {
        const fileURL = URL.createObjectURL(file);
        setPdfPreview(fileURL); // 👈 Generamos vista previa
      } else {
        setPdfPreview(null);
      }
    } else {
      setFormData({ ...formData, [name]: value });

      if (name === "persona_idPersona") {
        const selectedPersona = personas.find(
          (p) => p.idPersona.toString() === value.toString()
        );
        setPersonaSeleccionada(selectedPersona);
      }

      if (name === "idEstablecimientoSaludDestino") {
        const selectedDestino = establecimientos.find(
          (e) => e.id.toString() === value.toString()
        );
        setEstablecimientoDestino(selectedDestino);
      }
    }
  };

  // 🔹 Enviar datos
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      idEstablecimientoSaludOrigen: formData.idEstablecimientoSaludOrigen,
      idPersona: formData.persona_idPersona,
      idEstablecimientoSaludDestino: formData.idEstablecimientoSaludDestino,
      Motivo: formData.Motivo,
      Observacion: formData.Observacion,
      documentoRef: null,
    };

    if (formData.documentoRef) {
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
          console.error("Error al enviar la transferencia:", error);
          setStatusMessage("Error al enviar la transferencia.");
        }
      };

      reader.readAsDataURL(formData.documentoRef);
    } else {
      alert("Por favor, selecciona un archivo PDF de referencia.");
    }
  };

  return (
    <Layout>
      <div className="transferencia-wrapper">
        <h2 className="text-center mb-4">Registrar Transferencia</h2>
        
        <div className="transferencia-container">
            <button
                className="btn-action add"
                onClick={() => navigate("/r/lista-transferenciasPS")}
            >
                Ver todas las Transferencias
            </button> 
        </div>

        <div className="transferencia-container">
          {/* --- FORMULARIO --- */}
          <form onSubmit={handleSubmit} className="transfer-form">
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
              <input type="text" value={userEstablecimiento} readOnly className="readonly-input" />
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
                {establecimientos.map((e) => (
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
                <option value="Servicio/Especialidad">Servicio/Especialidad</option>
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
              <small>{200 - formData.Observacion.length} caracteres restantes</small>
            </div>

            <div className="form-group">
              <label>Documento de Transferencia (PDF)</label>
              <input
                type="file"
                name="documentoRef"
                onChange={handleChange}
                accept=".pdf"
              />
            </div>

            <button type="submit" className="btn-primary mt-2">
              Registrar Transferencia
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

          {/* --- DETALLES Y VISTA PREVIA --- */}
          <div className="transfer-detail">
            <h4>Detalles de la Transferencia</h4>

            <div className="detail-section">
              <h5>Paciente</h5>
              <p><strong>Nombre:</strong> {personaSeleccionada?.nombreCompleto || "N/A"}</p>
              <p><strong>CI:</strong> {personaSeleccionada?.CI || "N/A"}</p>
              <p><strong>Sexo:</strong> {personaSeleccionada?.sexo || "N/A"}</p>
              <p><strong>Fecha Nacimiento:</strong> {personaSeleccionada?.fechaNacimiento ? new Date(personaSeleccionada.fechaNacimiento).toLocaleDateString() : "N/A"}</p>
            </div>

            <div className="detail-section">
              <h5>Establecimiento Origen</h5>
              <p><strong>Nombre:</strong> {userEstablecimiento}</p>
            </div>

            <div className="detail-section">
              <h5>Establecimiento Destino</h5>
              <p><strong>Nombre:</strong> {establecimientoDestino?.nombre || "N/A"}</p>
              <p><strong>Clasificación:</strong> {establecimientoDestino?.clasificacion || "N/A"}</p>
              <p><strong>Teléfono:</strong> {establecimientoDestino?.telefono || "N/A"}</p>
            </div>

            {/* 👇 NUEVA SECCIÓN DE VISTA PREVIA DEL PDF */}
            {pdfPreview && (
              <div className="detail-section pdf-preview">
                <h5>Vista previa del documento</h5>
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
