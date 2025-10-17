const express = require("express");
const { uploadPDF } = require("../middlewares/upload.middleware");

const router = express.Router();

router.post("/", uploadPDF.single("documentoRef"), (req, res) => {
  if (req.file) return res.send("Archivo subido correctamente");
  return res.status(400).send("No se ha subido el archivo");
});

module.exports = router;
