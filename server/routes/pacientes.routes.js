const express = require("express");
const { getPacienteById, listPacientes, listPacientesByEst, listPacientesOnlyByEst, createPaciente, updatePaciente, deactivatePaciente } = require("../controllers/pacientes.controller");
const router = express.Router();

router.get("/:id", getPacienteById);          // /api/pacientes/:id  (antes /api/paciente/:id)
router.get("/", listPacientes);               // /api/pacientes
router.get("/by-est", listPacientesByEst);    // /api/pacientesEst
router.get("/only-by-est", listPacientesOnlyByEst); // /api/pacientesEstablecimiento
router.post("/", createPaciente);
router.put("/:id", updatePaciente);
router.put("/delete/:id/estado", deactivatePaciente); // /api/pacientesDelete/:id/estado

module.exports = router;
