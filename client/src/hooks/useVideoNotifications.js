import { useEffect } from "react";
import { io } from "socket.io-client";

export default function useVideoNotifications(onNewVideo) {
  useEffect(() => {
    const socket = io("http://localhost:3001", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("🔌 Conectado a Socket.IO desde la web");
    });

    // Evento que viene desde saveVideo()
    socket.on("nuevo_video", (data) => {
      console.log("📢 Nuevo video recibido:", data);
      onNewVideo(data); // Ejecuta el callback del componente
    });

    return () => socket.disconnect();
  }, [onNewVideo]);
}
