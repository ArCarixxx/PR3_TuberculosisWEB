const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 3001;

// 🔥 Crear servidor HTTP (necesario para socket.io)
const server = http.createServer(app);

// 🔥 Crear servidor de WebSockets
const io = new Server(server, {
  cors: {
    origin: "*", // Cambiar por la URL de producción si deseas
  },
});

// Hacer que "io" esté disponible para toda la app
app.set("io", io);

server.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
});

// Tiempo de espera aumentado (10 min)
server.timeout = 600000;

// 👉 Opcional: mensajes cuando un cliente se conecta
io.on("connection", (socket) => {
  console.log("🟢 Nuevo cliente conectado al socket");
});
