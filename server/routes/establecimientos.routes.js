const express = require("express");
const { createEstablecimiento, getEstablecimientos, getEstablecimientoById } = require("../controllers/establecimientos.controller");
const router = express.Router();
router.post("/", createEstablecimiento);
router.get("/", getEstablecimientos);
router.get("/:id", getEstablecimientoById);
module.exports = router;
