const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { errorHandler } = require("./middlewares/error.middleware");

// Rutas
const uploadRoutes = require("./routes/upload.routes");
const sedesRoutes = require("./routes/sedes.routes");
const redesRoutes = require("./routes/redes.routes");
const establecimientosRoutes = require("./routes/establecimientos.routes");
const personalSaludRoutes = require("./routes/personalSalud.routes");
const pacientesRoutes = require("./routes/pacientes.routes");
const videosRoutes = require("./routes/videos.routes");
const tratamientosRoutes = require("./routes/tratamientos.routes");
const transferenciasRoutes = require("./routes/transferencias.routes");
const loginRoutes = require("./routes/login.routes");
const personasRoutes = require("./routes/personas.routes");

const app = express();
app.use(cors());
app.use(express.json({ limit: "15000mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// Mount
app.use("/upload", uploadRoutes);
app.use("/api/sedes", sedesRoutes);
app.use("/api/redesSalud", redesRoutes);
app.use("/api/establecimientos", establecimientosRoutes);
app.use("/api/personalSalud", personalSaludRoutes);
app.use("/api/pacientes", pacientesRoutes);
app.use("/api/videos", videosRoutes);
app.use("/api/tratamientos", tratamientosRoutes);
app.use("/api/transferencias", transferenciasRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/personas", personasRoutes);

// ===== Alias para compatibilidad con tu frontend actual =====
// /api/paciente/:id
app.get("/api/paciente/:id", (req, res, next) => require("./controllers/pacientes.controller").getPacienteById(req,res,next));
// /api/pacientesEst
app.get("/api/pacientesEst", (req, res, next) => require("./controllers/pacientes.controller").listPacientesByEst(req,res,next));
// /api/pacientesEstablecimiento
app.get("/api/pacientesEstablecimiento", (req, res, next) => require("./controllers/pacientes.controller").listPacientesOnlyByEst(req,res,next));
// /api/pacientesDelete/:id/estado
app.put("/api/pacientesDelete/:id/estado", (req, res, next) => require("./controllers/pacientes.controller").deactivatePaciente(req,res,next));

// /api/gettransferencias (lista)
app.get("/api/gettransferencias", (req, res, next) => require("./controllers/transferencias.controller").listTransferencias(req,res,next));

// Error handler (debe ir al final)
app.use(errorHandler);

module.exports = app;