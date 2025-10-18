const express = require("express");
const router = express.Router();
const { getCriterios } = require("../controllers/criterios.controller");

router.get("/", getCriterios);

module.exports = router;
