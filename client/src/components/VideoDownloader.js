import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./VideoDownloader.css";

const VideoDownloaderAdmin = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const role = localStorage.getItem("userRole"); // debería ser "Admin"
        const establecimiento = localStorage.getItem("userIdEstablecimiento");

        const response = await fetch(
          `http://localhost:3001/api/videos?role=${role}&establecimiento=${establecimiento}`
        );
        const data = await response.json();
        setVideos(data);
      } catch (error) {
        console.error("Error al obtener los videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

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
      <div className="video-container text-center">
        <h2>Cargando videos...</h2>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="video-container">
      <h2 className="text-center mb-4">Videos del Establecimiento</h2>

      {videos.length > 0 ? (
        <div className="video-grid">
          {videos.map((video) => (
            <div key={video.id} className="video-card">
              <h4 className="video-title">{video.name}</h4>

              <p>
                <strong>Paciente:</strong>{" "}
                <Link
                  to={`/actualizar-paciente/${video.idPersona}`}
                  className="patient-link"
                >
                  {video.nombrecompleto}
                </Link>
              </p>

              <p>
                <strong>Fecha de subida:</strong>{" "}
                {new Date(video.uploadDate).toLocaleDateString("es-ES")}
              </p>

              <div className="video-preview">
                <video controls width="100%">
                  <source src={video.base64} type="video/mp4" />
                  Tu navegador no soporta video.
                </video>
              </div>

              <div className="video-actions">
                <button
                  className="btn-download"
                  onClick={() => downloadFile(video.base64, video.name)}
                >
                  Descargar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-videos">
          <p>No hay videos disponibles en este establecimiento.</p>
        </div>
      )}
    </div>
  );
};

export default VideoDownloaderAdmin;
