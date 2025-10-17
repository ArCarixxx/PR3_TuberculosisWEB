const pool = require("../config/db");

async function listPersonas(req, res, next) {
  try {
    const [rows] = await pool.query("SELECT * FROM persona");
    if (!rows.length) return res.status(404).json({ message: "No se encontraron personas" });
    res.json(rows);
  } catch (e) { next(e); }
}

module.exports = { listPersonas };
