const multer = require("multer");

const storage = multer.memoryStorage();
const uploadPDF = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Solo se permiten archivos PDF"), false);
    }
    cb(null, true);
  },
});

module.exports = { uploadPDF };