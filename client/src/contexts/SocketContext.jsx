import React, { createContext, useEffect } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socket = io("http://localhost:3001"); // tu servidor backend

  useEffect(() => {
    socket.on("connect", () => {
      console.log("🟢 Socket conectado:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket desconectado");
    });

    return () => socket.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
