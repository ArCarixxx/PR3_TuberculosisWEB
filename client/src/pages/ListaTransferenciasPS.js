import React, { useState, useEffect } from "react";
import Layout from "../components/LayoutPersonalSalud";
import './ListaTransferencias.css';


const ListasTransferencias = () => {
  const [transferencias, setTransferencias] = useState([]);
  const [loading, setLoading] = useState(true);

  const userRole = localStorage.getItem("userRole");
  const userEstablecimiento = localStorage.getItem("userEstablecimiento");
  const userIdEstablecimiento = localStorage.getItem("userIdEstablecimiento");

  console.log(`Rol: ${userRole}, Establecimiento: ${userEstablecimiento}, IdEstablecimiento: ${userIdEstablecimiento}`);

  useEffect(() => {
    const fetchTransferencias = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/gettransferencias');
        if (!response.ok) {
          throw new Error("Error al obtener las transferencias");
        }
        const data = await response.json();

        console.log("Datos del backend:", data);

        const establecimientoId = parseInt(userIdEstablecimiento, 10);

        const filteredData = data.filter(
          (transferencia) => transferencia.idEstablecimientoSaludOrigen === establecimientoId
        );
        

        console.log("Datos filtrados:", filteredData);

        setTransferencias(filteredData);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    if (userIdEstablecimiento) {
      fetchTransferencias();
    } else {
      console.error("ID de establecimiento no definido en localStorage");
    }
  }, [userIdEstablecimiento]);

  if (loading) {
    return <div>Cargando transferencias...</div>;
  }

  return (
    <Layout>
    <div className="listas-transferencias-container">
      <h1>Lista de Transferencias</h1>
      <table className="transferencias-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Establecimiento Origen</th>
            <th>Establecimiento Destino</th>
            <th>Persona</th>
            <th>Motivo</th>
            <th>Observación</th>
            <th>Documento</th>
          </tr>
        </thead>
        <tbody>
          {transferencias.map((transferencia) => (
            <tr key={transferencia.idTransferencia}>
              <td>{transferencia.idTransferencia}</td>
              <td>{transferencia.establecimientoOrigen}</td>
              <td>{transferencia.establecimientoDestino}</td>
              <td>{transferencia.nombreCompleto}</td>
              <td>{transferencia.motivo}</td>
              <td>{transferencia.observacion}</td>
              <td>
                {transferencia.documentoRef ? (
                  <button
                  className="submit-button"
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = `data:application/pdf;base64,${transferencia.documentoRef}`;
                      link.download = `documento-${transferencia.nombreCompleto}.pdf`; // Nombre del archivo descargado
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    Descargar Documento
                  </button>
                ) : (
                  "No disponible"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </Layout>
  );
};

export default ListasTransferencias;
