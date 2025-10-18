// routes/personalSalud.routes.js
const express = require("express");
const { listPersonal, listPersonalByEst, createPersonal, updatePersonal, deletePersonal } = require("../controllers/personalSalud.controller");
const router = express.Router();

router.get("/", listPersonal); // SuperAdmin
router.get("/establecimiento", listPersonalByEst); // Admin de Establecimiento
router.post("/", createPersonal);
router.put("/:id", updatePersonal);
router.delete("/:id", deletePersonal);

module.exports = router;
