const express = require("express");
const { getTratamientos, createTratamiento, deleteTratamiento} = require("../controllers/tratamientos.controller");
const router = express.Router();

router.get("/:personaId", getTratamientos);
router.post("/", createTratamiento);
router.delete("/:id", deleteTratamiento);

module.exports = router;