import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/LayoutAdmin";
import "./ListaTransferencias.css";

const ListaTransferenciasAdmin = () => {
  const [transferencias, setTransferencias] = useState([]);
  const [loading, setLoading] = useState(true);

  const [busqueda, setBusqueda] = useState("");
  const [filtroMotivo, setFiltroMotivo] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const userEstablecimiento =
    localStorage.getItem("userEstablecimiento");

  const userIdEstablecimiento = parseInt(
    localStorage.getItem("userIdEstablecimiento"),
    10
  );

  useEffect(() => {
    const fetchTransferencias = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/api/gettransferencias"
        );

        if (!response.ok)
          throw new Error(
            "Error al obtener las transferencias"
          );

        const data = await response.json();

        // 🔍 SOLO transferencias relacionadas
        const filteredData = data.filter(
          (t) =>
            t.idEstablecimientoSaludOrigen ===
              userIdEstablecimiento ||
            t.idEstablecimientoSaludDestino ===
              userIdEstablecimiento
        );

        setTransferencias(filteredData);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userIdEstablecimiento)
      fetchTransferencias();
  }, [userIdEstablecimiento]);

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
    return [
      ...new Set(
        transferencias
          .map((t) => t.motivo)
          .filter(Boolean)
      ),
    ].sort();
  }, [transferencias]);

  const transferenciasFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return [...transferencias]
      .sort(
        (a, b) =>
          new Date(b.fechaCreacion) -
          new Date(a.fechaCreacion)
      )
      .filter((t) => {
        const paciente = (
          t.nombreCompleto || ""
        ).toLowerCase();

        const motivo = (
          t.motivo || ""
        ).toLowerCase();

        const origen = (
          t.establecimientoOrigen || ""
        ).toLowerCase();

        const destino = (
          t.establecimientoDestino || ""
        ).toLowerCase();

        const observacion = (
          t.observacion || ""
        ).toLowerCase();

        const coincideBusqueda =
          paciente.includes(texto) ||
          motivo.includes(texto) ||
          origen.includes(texto) ||
          destino.includes(texto) ||
          observacion.includes(texto);

        const coincideMotivo = filtroMotivo
          ? t.motivo === filtroMotivo
          : true;

        // 🔹 ENVIADAS / RECIBIDAS
        let coincideTipo = true;

        if (filtroTipo === "enviadas") {
          coincideTipo =
            t.idEstablecimientoSaludOrigen ===
            userIdEstablecimiento;
        }

        if (filtroTipo === "recibidas") {
          coincideTipo =
            t.idEstablecimientoSaludDestino ===
            userIdEstablecimiento;
        }

        const fechaTransferencia = t.fechaCreacion
          ? new Date(t.fechaCreacion)
          : null;

        const coincideFechaDesde = fechaDesde
          ? fechaTransferencia &&
            fechaTransferencia >=
              new Date(fechaDesde)
          : true;

        const coincideFechaHasta = fechaHasta
          ? fechaTransferencia &&
            fechaTransferencia <=
              new Date(`${fechaHasta}T23:59:59`)
          : true;

        return (
          coincideBusqueda &&
          coincideMotivo &&
          coincideTipo &&
          coincideFechaDesde &&
          coincideFechaHasta
        );
      });
  }, [
    transferencias,
    busqueda,
    filtroMotivo,
    filtroTipo,
    fechaDesde,
    fechaHasta,
    userIdEstablecimiento,
  ]);

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroMotivo("");
    setFiltroTipo("");
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
            <h1>
              Transferencias -{" "}
              {userEstablecimiento}
            </h1>

            <p>
              Consulta las transferencias
              relacionadas con tu
              establecimiento.
            </p>
          </div>
        </div>

        <div className="transferencias-filters-card">
          <div className="transferencias-filters-row admin-transfer-filters">
            <div className="search-control">
              <span className="search-icon">
                🔎
              </span>

              <input
                type="text"
                placeholder="Buscar por paciente, motivo o establecimiento..."
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(e.target.value)
                }
              />
            </div>

            <select
              value={filtroMotivo}
              onChange={(e) =>
                setFiltroMotivo(
                  e.target.value
                )
              }
            >
              <option value="">
                Todos los motivos
              </option>

              {motivosDisponibles.map(
                (motivo) => (
                  <option
                    key={motivo}
                    value={motivo}
                  >
                    {motivo}
                  </option>
                )
              )}
            </select>

            <select
              value={filtroTipo}
              onChange={(e) =>
                setFiltroTipo(e.target.value)
              }
            >
              <option value="">
                Todas
              </option>

              <option value="enviadas">
                Enviadas
              </option>

              <option value="recibidas">
                Recibidas
              </option>
            </select>

            <input
              type="date"
              value={fechaDesde}
              onChange={(e) =>
                setFechaDesde(
                  e.target.value
                )
              }
            />

            <input
              type="date"
              value={fechaHasta}
              onChange={(e) =>
                setFechaHasta(
                  e.target.value
                )
              }
            />

            <button
              className="btn-clear-transfer"
              onClick={limpiarFiltros}
            >
              Limpiar
            </button>
          </div>

          <div className="transferencias-summary">
            Mostrando{" "}
            <strong>
              {
                transferenciasFiltradas.length
              }
            </strong>{" "}
            de{" "}
            <strong>
              {transferencias.length}
            </strong>{" "}
            transferencias
          </div>
        </div>

        {transferenciasFiltradas.length >
        0 ? (
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
                    <th>Fecha</th>
                    <th>Documento</th>
                  </tr>
                </thead>

                <tbody>
                  {transferenciasFiltradas.map(
                    (t) => (
                      <tr
                        key={
                          t.idTransferencia
                        }
                      >
                        <td className="patient-cell">
                          {
                            t.nombreCompleto
                          }
                        </td>

                        <td>
                          <span className="motivo-badge">
                            {t.motivo}
                          </span>
                        </td>

                        <td className="observacion-cell">
                          {t.observacion ||
                            "—"}
                        </td>

                        <td>
                          <span className="est-chip origen">
                            {
                              t.establecimientoOrigen
                            }
                          </span>
                        </td>

                        <td>
                          <span className="est-chip destino">
                            {
                              t.establecimientoDestino
                            }
                          </span>
                        </td>

                        <td className="date-cell">
                          {formatDate(
                            t.fechaCreacion
                          )}
                        </td>

                        <td>
                          <button
                            className="btn-download"
                            onClick={() =>
                              descargarDocumento(
                                t.documentoRef,
                                t.nombreCompleto
                              )
                            }
                          >
                            Descargar
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="transferencias-empty">
            <h3>
              No se encontraron
              transferencias
            </h3>

            <p>
              Prueba cambiando los
              filtros o limpiando la
              búsqueda.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ListaTransferenciasAdmin;