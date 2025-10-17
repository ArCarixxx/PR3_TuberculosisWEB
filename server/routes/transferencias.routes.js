const express = require("express");
const { createTransferencia, getTransferenciaById, listTransferencias } = require("../controllers/transferencias.controller");
const router = express.Router();
router.post("/", createTransferencia);               // /api/transferencias
router.get("/:id", getTransferenciaById);            // /api/transferencias/:id
router.get("/", listTransferencias);                 // /api/transferencias  (lista)
module.exports = router;