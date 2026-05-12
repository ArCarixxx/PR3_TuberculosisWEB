import React, { useContext, useEffect } from "react";
import { SocketContext } from "../contexts/SocketContext";
import toast from "react-hot-toast";

export default function GlobalNotifications() {
  const socket = useContext(SocketContext);

  useEffect(() => {
    if (!socket) return;

    // 🔔 Pedir permiso para mostrar notificaciones del navegador
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    // 👉 Cargar sonido de notificación
    const sound = new Audio("/sounds/notification.mp3");

    socket.on("nuevo_video", (data) => {
      console.log("📢 Nuevo video recibido:", data);

      const message = `📹 Nuevo video subido`;

      // 🔊 Reproducir sonido
      sound.volume = 0.8; // volumen 0–1
      sound.play().catch(() => {}); // evitar errores si el navegador bloquea autoplay

      // 🖥️ Notificación nativa del navegador
      if (Notification.permission === "granted") {
        new Notification("Nuevo video subido", {
          body: message,
          icon: "/icono-video.png",
        });
      } else {
        // 🍞 Notificación toast si no hay permiso
        toast(message, {
          duration: 5000,
          style: {
            background: "#222",
            color: "white",
            border: "1px solid #444",
          },
        });
      }
    });

    return () => {
      socket.off("nuevo_video");
    };
  }, [socket]);

  return null;
}
