
const express = require("express");
const { createRed, getRedesBySede } = require("../controllers/redes.controller");
const router = express.Router();
router.post("/", createRed);
router.get("/:idSede", getRedesBySede);
module.exports = router;