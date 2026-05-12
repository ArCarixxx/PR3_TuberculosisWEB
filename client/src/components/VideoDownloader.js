import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useVideoNotifications from "../hooks/useVideoNotifications";
import "./VideoDownloader.css";

const VideoDownloaderAdmin = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [expandedPatient, setExpandedPatient] = useState(null);

  const role = localStorage.getItem("userRole");
  const establecimiento = localStorage.getItem("userIdEstablecimiento");
  const nombreEstablecimiento = localStorage.getItem("userEstablecimiento");

  const fetchVideos = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/videos?role=${role}&establecimiento=${establecimiento}`
      );

      const data = await response.json();

      const sorted = data.sort(
        (a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)
      );

      setVideos(sorted);
    } catch (err) {
      console.error("❌ Error al obtener videos:", err);
    } finally {
      setLoading(false);
    }
  };

  useVideoNotifications((nuevoVideo) => {
    if (String(nuevoVideo.idEstablecimientoSalud) === String(establecimiento)) {
      alert(`📹 Nuevo video del paciente ${nuevoVideo.nombrecompleto}`);
      fetchVideos();
    }
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const groupedVideos = useMemo(() => {
    const grouped = {};

    videos.forEach((video) => {
      const patientId = video.idPersona;

      if (!grouped[patientId]) {
        grouped[patientId] = {
          paciente: video.nombrecompleto,
          establecimiento: video.nombreEstablecimiento || nombreEstablecimiento,
          idPersona: video.idPersona,
          videos: [],
        };
      }

      grouped[patientId].videos.push(video);
    });

    return Object.values(grouped)
      .sort((a, b) => {
        const fechaA = new Date(a.videos[0].uploadDate);
        const fechaB = new Date(b.videos[0].uploadDate);
        return fechaB - fechaA;
      })
      .filter((group) =>
        group.paciente.toLowerCase().includes(search.toLowerCase())
      );
  }, [videos, search, nombreEstablecimiento]);

  const downloadFile = (base64Data, fileName) => {
    const link = document.createElement("a");
    link.href = base64Data;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="videos-page-loading">
        <div className="spinner"></div>
        <h2>Cargando videos...</h2>
      </div>
    );
  }

  return (
    <div className="videos-page">
      <div className="videos-header">
        <div>
          <h1>Videos del Establecimiento</h1>
          <p>
            Videos subidos por pacientes de{" "}
            <strong>{nombreEstablecimiento}</strong>.
          </p>
        </div>
      </div>

      <div className="videos-filters-card">
        <div className="search-control">
          <span className="search-icon">🔎</span>
          <input
            type="text"
            placeholder="Buscar paciente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="videos-summary">
          <strong>{groupedVideos.length}</strong> pacientes con videos
        </div>
      </div>

      <div className="folders-grid">
        {groupedVideos.map((group) => {
          const latestVideo = group.videos[0];
          const isOpen = expandedPatient === group.idPersona;

          return (
            <div
              className={`folder-card ${isOpen ? "expanded" : ""}`}
              key={group.idPersona}
            >
              <div
                className="folder-header"
                onClick={() =>
                  setExpandedPatient(isOpen ? null : group.idPersona)
                }
              >
                <div className="folder-icon">📁</div>

                <div className="folder-info">
                  <h3>{group.paciente}</h3>
                  <p>{group.establecimiento}</p>

                  <div className="folder-meta">
                    <span>{group.videos.length} videos</span>
                    <span>
                      Último:{" "}
                      {new Date(latestVideo.uploadDate).toLocaleDateString(
                        "es-BO"
                      )}
                    </span>
                  </div>
                </div>

                <div className="folder-arrow">{isOpen ? "▲" : "▼"}</div>
              </div>

              {isOpen && (
                <div className="videos-inside">
                  <div className="patient-link-wrapper">
                    <Link
                      to={`/actualizar-paciente/${group.idPersona}`}
                      className="patient-link"
                    >
                      Ver paciente
                    </Link>
                  </div>

                  <div className="videos-grid">
                    {group.videos.map((video) => (
                      <div key={video.id} className="video-card">
                        <video controls>
                          <source src={video.base64} type="video/mp4" />
                          Tu navegador no soporta video.
                        </video>

                        <div className="video-card-info">
                          <h4>{video.name}</h4>

                          <p>
                            {new Date(video.uploadDate).toLocaleString("es-BO")}
                          </p>

                          <button
                            className="btn-download"
                            onClick={() =>
                              downloadFile(video.base64, video.name)
                            }
                          >
                            Descargar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {groupedVideos.length === 0 && (
        <div className="videos-empty">
          <h3>No se encontraron videos</h3>
          <p>No hay videos disponibles en este establecimiento.</p>
        </div>
      )}
    </div>
  );
};

export default VideoDownloaderAdmin;