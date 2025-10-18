const express = require("express");
const { createEstablecimiento, getEstablecimientos, getEstablecimientoById, getEstablecimientoslista } = require("../controllers/establecimientos.controller");
const router = express.Router();

router.get("/", getEstablecimientos);
router.get("/lista", getEstablecimientoslista);
router.post("/", createEstablecimiento);
router.get("/:id", getEstablecimientoById);

module.exports = router;
