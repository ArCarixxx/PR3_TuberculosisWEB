import React, { useState, useEffect } from "react";
import './Transferencia.css';
import { useNavigate } from "react-router-dom";
import Layout from "../components/LayoutAdmin";

const Transferencia = () => {
    const [formData, setFormData] = useState({
        idEstablecimientoSaludOrigen: "",
        idEstablecimientoSaludDestino: "",
        persona_idPersona: "",
        Motivo: "",
        Observacion: "",
        documentoRef: null
    });
    const [establecimientos, setEstablecimientos] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [establecimientoOrigen, setEstablecimientoOrigen] = useState(null);
    const [establecimientoDestino, setEstablecimientoDestino] = useState(null);
    const [personaSeleccionada, setPersonaSeleccionada] = useState(null);
    const [statusMessage, setStatusMessage] = useState("");
    const navigate = useNavigate();

    const userRole = localStorage.getItem("userRole");
    const userEstablecimiento = localStorage.getItem("userEstablecimiento");
    const userIdEstablecimiento = localStorage.getItem("userIdEstablecimiento");
    
    console.log(`Rol: ${userRole}, Establecimiento: ${userEstablecimiento}, IdEstablecimiento: ${userIdEstablecimiento}`);



    useEffect(() => {
        fetch('http://localhost:3001/api/establecimientos')
            .then(response => response.json())
            .then(data => setEstablecimientos(data))
            .catch(error => console.error('Error fetching establecimientos:', error));

        fetch(`http://localhost:3001/api/pacientesEstablecimiento?idEstablecimiento=${userIdEstablecimiento}`)
            .then(response => response.json())
            .then(data => {
                console.log("Pacientes filtrados:", data); // Depuración
                setPersonas(data);
            })
            .catch(error => console.error('Error fetching pacientes:', error));

    }, []);
    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === "documentoRef") {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });

            if (name === "idEstablecimientoSaludOrigen") {
                const selectedEst = establecimientos.find(est => est.id.toString() === value.toString());
                setEstablecimientoOrigen(selectedEst);
            } else if (name === "idEstablecimientoSaludDestino") {
                const selectedEst = establecimientos.find(est => est.id.toString() === value.toString());
                setEstablecimientoDestino(selectedEst);
            } else if (name === "persona_idPersona") {
                const selectedPersona = personas.find(persona => persona.idPersona.toString() === value.toString());
                setPersonaSeleccionada(selectedPersona);

                if (selectedPersona && selectedPersona.EstablecimientoSalud_idEstablecimientoSalud) {
                    const personaEstablecimiento = establecimientos.find(est => est.id.toString() === selectedPersona.EstablecimientoSalud_idEstablecimientoSalud.toString());
                    if (personaEstablecimiento) {
                        setFormData(prevFormData => ({
                            ...prevFormData,
                            idEstablecimientoSaludOrigen: personaEstablecimiento.id.toString(),
                        }));
                        setEstablecimientoOrigen(personaEstablecimiento);
                    } else {
                        console.warn("No se encontró un establecimiento correspondiente a la persona seleccionada.");
                    }
                }                
            }
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
          idEstablecimientoSaludOrigen: formData.idEstablecimientoSaludOrigen,
          idPersona: formData.persona_idPersona,
          idEstablecimientoSaludDestino: formData.idEstablecimientoSaludDestino,
          Motivo: formData.Motivo,
          Observacion: formData.Observacion,
          documentoRef: null, // Aquí se agregará el archivo en Base64
        };
      
        if (formData.documentoRef) {
          const file = formData.documentoRef; // Obtenemos el archivo
      
          // Convertir el archivo a Base64 usando FileReader
          const reader = new FileReader();
      
          reader.onloadend = async () => {
            // El resultado de FileReader es un Data URL. Extraemos la parte Base64
            payload.documentoRef = reader.result.split(",")[1]; // Base64 puro
      
            try {
              // Enviar los datos al backend como JSON
              const response = await fetch("http://localhost:3001/api/transferencias", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(payload), // Aquí se envían los datos completos
              });
      
              const data = await response.json();
              console.log("Respuesta del servidor:", data);

              if (response.ok) {
                setStatusMessage("Registro exitoso");
                setTimeout(() => window.location.reload(), 5000); // Recarga la página después de 2 segundos
            } else {
                const errorText = await response.text();
                setStatusMessage(`Error al registrar transferencia: ${errorText}`);
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            } catch (error) {
              console.error("Error al enviar los datos:", error);
            }
          };
      
          reader.readAsDataURL(file); // Convertir archivo a Data URL (Base64)
        } else {
          console("Por favor, selecciona un archivo.");
        }
      };
      
    

    const handleRedirect = () => {
        navigate("/lista-transferencias");
    };



    return (
        <Layout>
        <div className="transfer-container">
            <h2>Formulario de Transferencia</h2>
            <div className="transfer-content">
                <form onSubmit={handleSubmit} className="transfer-form">
                    <div className="form-group">
                        <label>Persona</label>
                        <select
                            name="persona_idPersona"
                            value={formData.persona_idPersona}
                            onChange={handleChange}
                            required
                            className="select-input"
                        >
                            <option value="">Selecciona una persona</option>
                            {personas.map(persona => (
                                <option key={persona.idPersona} value={persona.idPersona}>
                                    {persona.nombreCompleto}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Establecimiento de Origen</label>
                        <select
                            name="idEstablecimientoSaludOrigen"
                            value={formData.idEstablecimientoSaludOrigen}
                            onChange={handleChange}
                            required
                            className="select-input"
                            disabled 
                        >
                            <option value="">Selecciona un establecimiento</option>
                            {establecimientos.map(est => (
                                <option key={est.id} value={est.id}>{est.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Establecimiento de Destino</label>
                        <select
                            name="idEstablecimientoSaludDestino"
                            value={formData.idEstablecimientoSaludDestino}
                            onChange={handleChange}
                            required
                            className="select-input"
                        >
                            <option value="">Selecciona un establecimiento</option>
                            {establecimientos.map(est => (
                                <option key={est.id} value={est.id}>{est.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Motivo</label>
                        <select
                            name="Motivo"
                            value={formData.Motivo}
                            onChange={handleChange}
                            required
                            className="select-input"
                        >
                            <option value="">Selecciona un motivo</option>
                            <option value="Urgencia">Urgencia</option>
                            <option value="Emergencia">Emergencia</option>
                            <option value="consulta externa">Consulta Externa</option>
                            <option value="interconsulta">Interconsulta</option>
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
                            maxLength="200"
                            rows="4"
                            className="textarea-input"
                        />
                        <small>{200 - formData.Observacion.length} caracteres restantes</small>
                    </div>

                    <div className="form-group">
                        <label>Documento Transferencia</label>
                        <input
                            type="file"
                            name="documentoRef"
                            onChange={handleChange}
                            accept=".pdf"
                            className="file-input"
                        />
                    </div>
                    <button type="submit" className="submit-button">Registrar Transferencia</button>
                    {/* Mostrar el mensaje debajo del botón */}
                    {statusMessage && (
                        <div className={`status-message ${statusMessage === "Registro exitoso" ? "success" : "error"}`}>
                            <span className="icon">{statusMessage === "Registro exitoso" ? "✔️" : "❌"}</span>
                            {statusMessage}
                        </div>
                    )}

                    <button type="button" className="submit-button" onClick={handleRedirect}>
                        Ver Transferencias
                    </button>

                </form>


                {/* Vista de datos seleccionados */}
                <div className="transfer-summary">
                    <h3>Detalles de la Transferencia</h3>
                    <div>
                        <h4>Paciente</h4>
                        <p>Nombre completo: {personaSeleccionada?.nombreCompleto || 'N/A'}</p>
                        <p>Fecha de Nacimiento: {personaSeleccionada?.fechaNacimiento ? new Date(personaSeleccionada.fechaNacimiento).toLocaleDateString() : 'N/A'}</p>
                        <p>Sexo: {personaSeleccionada?.sexo || 'N/A'}</p>
                        <p>CI: {personaSeleccionada?.CI || 'N/A'}</p>
                        <p>Numero de Celular: {personaSeleccionada?.numeroCelular || 'N/A'}</p>
                        <p>Direccion: {personaSeleccionada?.direccion || 'N/A'}</p>
                    </div>
                    <div>
                        <h4>Establecimiento de Origen</h4>
                        <p>Nombre: {establecimientoOrigen?.nombre || 'N/A'}</p>
                        <p>Clasificación: {establecimientoOrigen?.clasificacion || 'N/A'}</p>
                        <p>Telefono: {establecimientoOrigen?.telefono || 'N/A'}</p>
                    </div>
                    <div>
                        <h4>Establecimiento de Destino</h4>
                        <p>Nombre: {establecimientoDestino?.nombre || 'N/A'}</p>
                        <p>Clasificación: {establecimientoDestino?.clasificacion || 'N/A'}</p>
                        <p>Telefono: {establecimientoDestino?.telefono || 'N/A'}</p>
                    </div>


                </div>
            </div>
        </div>
        </Layout>
    );
};

export default Transferencia;
