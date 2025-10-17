const express = require("express");
const { login, loginMobile } = require("../controllers/login.controller");
const { verifyRole } = require("../middlewares/auth.middleware");
const router = express.Router();

router.get("/", login);                  // /api/login
router.post("/mobile", loginMobile);     // /api/login/mobile
router.get("/admin-data", verifyRole("administrador"), (req, res) => {
  res.json({ message: "Datos confidenciales del administrador" });
});

module.exports = router;