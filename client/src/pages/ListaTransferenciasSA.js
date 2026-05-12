import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import "./ListaTransferencias.css";

const ListaTransferenciasSA = () => {
  const [transferencias, setTransferencias] = useState([]);
  const [loading, setLoading] = useState(true);

  const [busqueda, setBusqueda] = useState("");
  const [filtroMotivo, setFiltroMotivo] = useState("");
  const [filtroOrigen, setFiltroOrigen] = useState("");
  const [filtroDestino, setFiltroDestino] = useState("");
  
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  useEffect(() => {
    const fetchTransferencias = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/gettransferencias");
        if (!response.ok) throw new Error("Error al obtener las transferencias");

        const data = await response.json();
        setTransferencias(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransferencias();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Sin fecha";

    const date = new Date(dateString);

    return date.toLocaleString("es-BO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const descargarDocumento = (base64, nombre) => {
    const link = document.createElement("a");
    link.href = `data:application/pdf;base64,${base64}`;
    link.download = `transferencia-${nombre}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const motivosDisponibles = useMemo(() => {
    return [...new Set(transferencias.map((t) => t.motivo).filter(Boolean))].sort();
  }, [transferencias]);

  const origenesDisponibles = useMemo(() => {
    return [
      ...new Set(transferencias.map((t) => t.establecimientoOrigen).filter(Boolean)),
    ].sort();
  }, [transferencias]);

  const destinosDisponibles = useMemo(() => {
    return [
      ...new Set(transferencias.map((t) => t.establecimientoDestino).filter(Boolean)),
    ].sort();
  }, [transferencias]);

  const transferenciasFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return [...transferencias]
  .sort(
    (a, b) =>
      new Date(b.fechaCreacion) - new Date(a.fechaCreacion)
  )
  .filter((t) => {
      const paciente = (t.nombreCompleto || "").toLowerCase();
      const motivo = (t.motivo || "").toLowerCase();
      const observacion = (t.observacion || "").toLowerCase();
      const origen = (t.establecimientoOrigen || "").toLowerCase();
      const destino = (t.establecimientoDestino || "").toLowerCase();

      const coincideBusqueda =
        paciente.includes(texto) ||
        motivo.includes(texto) ||
        observacion.includes(texto) ||
        origen.includes(texto) ||
        destino.includes(texto);

      const coincideMotivo = filtroMotivo ? t.motivo === filtroMotivo : true;

      const coincideOrigen = filtroOrigen
        ? t.establecimientoOrigen === filtroOrigen
        : true;

      const coincideDestino = filtroDestino
        ? t.establecimientoDestino === filtroDestino
        : true;

        

      const fechaTransferencia = t.fechaCreacion
        ? new Date(t.fechaCreacion)
        : null;

      const coincideFechaDesde = fechaDesde
        ? fechaTransferencia && fechaTransferencia >= new Date(fechaDesde)
        : true;

      const coincideFechaHasta = fechaHasta
        ? fechaTransferencia &&
          fechaTransferencia <= new Date(`${fechaHasta}T23:59:59`)
        : true;

      return (
        coincideBusqueda &&
        coincideMotivo &&
        coincideOrigen &&
        coincideDestino &&
        
        coincideFechaDesde &&
        coincideFechaHasta
      );
    });
  }, [
    transferencias,
    busqueda,
    filtroMotivo,
    filtroOrigen,
    filtroDestino,
    fechaDesde,
    fechaHasta,
  ]);

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroMotivo("");
    setFiltroOrigen("");
    setFiltroDestino("");
    setFechaDesde("");
    setFechaHasta("");
  };

  if (loading) {
    return (
      <Layout>
        <div className="transferencias-loading">
          <div className="spinner"></div>
          <h2>Cargando transferencias...</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="transferencias-page">
        <div className="transferencias-header">
          <div>
            <h1>Lista de Transferencias</h1>
            <p>Consulta y filtra las transferencias registradas en el sistema.</p>
          </div>
        </div>

        <div className="transferencias-filters-card">
          <div className="transferencias-filters-row">
            <div className="search-control">
              <span className="search-icon">🔎</span>
              <input
                type="text"
                placeholder="Buscar por paciente, motivo, origen o destino..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <select
              value={filtroMotivo}
              onChange={(e) => setFiltroMotivo(e.target.value)}
            >
              <option value="">Todos los motivos</option>
              {motivosDisponibles.map((motivo) => (
                <option key={motivo} value={motivo}>
                  {motivo}
                </option>
              ))}
            </select>

            <select
              value={filtroOrigen}
              onChange={(e) => setFiltroOrigen(e.target.value)}
            >
              <option value="">Todos los orígenes</option>
              {origenesDisponibles.map((origen) => (
                <option key={origen} value={origen}>
                  {origen}
                </option>
              ))}
            </select>

            <select
              value={filtroDestino}
              onChange={(e) => setFiltroDestino(e.target.value)}
            >
              <option value="">Todos los destinos</option>
              {destinosDisponibles.map((destino) => (
                <option key={destino} value={destino}>
                  {destino}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              title="Desde"
            />

            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              title="Hasta"
            />

            <button onClick={limpiarFiltros} className="btn-clear-transfer">
              Limpiar
            </button>
          </div>

          <div className="transferencias-summary">
            Mostrando <strong>{transferenciasFiltradas.length}</strong> de{" "}
            <strong>{transferencias.length}</strong> transferencias
          </div>
        </div>

        {transferenciasFiltradas.length > 0 ? (
          <div className="transferencias-table-card">
            <div className="table-responsive">
              <table className="transferencias-table">
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Motivo</th>
                    <th>Observación</th>
                    <th>Origen</th>
                    <th>Destino</th>
                    <th>Fecha transferencia</th>
                    <th>Documento</th>
                  </tr>
                </thead>

                <tbody>
                  {transferenciasFiltradas.map((t) => (
                    <tr key={t.idTransferencia}>
                      <td className="patient-cell">{t.nombreCompleto}</td>

                      <td>
                        <span className="motivo-badge">{t.motivo}</span>
                      </td>

                      <td className="observacion-cell">
                        {t.observacion || "—"}
                      </td>

                      <td>
                        <span className="est-chip origen">
                          {t.establecimientoOrigen}
                        </span>
                      </td>

                      <td>
                        <span className="est-chip destino">
                          {t.establecimientoDestino}
                        </span>
                      </td>

                      <td className="date-cell">{formatDate(t.fechaCreacion)}</td>

                      <td>
                        {t.documentoRef ? (
                          <button
                            className="btn-download"
                            onClick={() =>
                              descargarDocumento(t.documentoRef, t.nombreCompleto)
                            }
                          >
                            Descargar
                          </button>
                        ) : (
                          <span className="no-doc">No disponible</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="transferencias-empty">
            <h3>No se encontraron transferencias</h3>
            <p>Prueba limpiando los filtros o cambiando los criterios de búsqueda.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ListaTransferenciasSA;