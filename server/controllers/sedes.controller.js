const pool = require("../config/db");

async function getSedes(req, res, next) {
  try {
    const [rows] = await pool.query(
      "SELECT idSede, nombreSede FROM Sede WHERE estado = 1"
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

module.exports = { getSedes };
