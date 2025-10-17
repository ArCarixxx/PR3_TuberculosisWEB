const pool = require("../config/db");

function verifyRole(role) {
  return async (req, res, next) => {
    try {
      const { correo, contrasenia } = req.query || {};
      if (!correo || !contrasenia) {
        return res.status(401).json({ error: "No autorizado" });
      }
      const [rows] = await pool.query(
        "SELECT rol FROM persona WHERE correo = ? AND contrasenia = ?",
        [correo, contrasenia]
      );
      if (!rows.length || rows[0].rol !== role) {
        return res.status(403).json({ error: "No autorizado" });
      }
      next();
    } catch (e) {
      next(e);
    }
  };
}

module.exports = { verifyRole };
