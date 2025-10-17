const express = require("express");
const { getTratamientos, createTratamiento } = require("../controllers/tratamientos.controller");
const router = express.Router();
router.get("/:personaId", getTratamientos);
router.post("/", createTratamiento);
module.exports = router;