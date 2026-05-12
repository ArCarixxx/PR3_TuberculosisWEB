const express = require("express");
const {
  createEstablecimiento,
  getEstablecimientos,
  getEstablecimientoById,
  getEstablecimientoslista,
  updateEstablecimiento,
} = require("../controllers/establecimientos.controller");

const router = express.Router();

router.get("/", getEstablecimientos);
router.get("/lista", getEstablecimientoslista);
router.get("/:id", getEstablecimientoById);
router.put("/:id", updateEstablecimiento);
router.post("/", createEstablecimiento);

module.exports = router;