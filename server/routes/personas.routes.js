const express = require("express");
const { listPersonas } = require("../controllers/personas.controller");
const router = express.Router();
router.get("/", listPersonas); // /api/personas
module.exports = router;