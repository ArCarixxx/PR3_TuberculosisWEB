const express = require("express");
const { getSedes } = require("../controllers/sedes.controller");
const router = express.Router();
router.get("/", getSedes);
module.exports = router;