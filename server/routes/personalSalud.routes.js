const express = require("express");
const { listPersonal, listPersonalByEst, createPersonal, updatePersonal } = require("../controllers/personalSalud.controller");
const router = express.Router();
router.get("/", listPersonal); // /api/personalSalud
router.get("/establecimiento", listPersonalByEst); // /api/personalSalud/establecimiento
router.post("/", createPersonal);
router.put("/:id", updatePersonal);
module.exports = router;
