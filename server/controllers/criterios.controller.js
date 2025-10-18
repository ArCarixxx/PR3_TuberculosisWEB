const pool = require("../config/db");

// Obtener todos los criterios de ingreso activos
async function getCriterios(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT 
         idCriterioIngreso, tipo, subtipo, estadoIngreso
       FROM criterioingreso
       WHERE estado = 1
       ORDER BY tipo ASC`
    );
    res.json(rows);
  } catch (e) {
    console.error("Error al obtener criterios:", e);
    next(e);
  }
}

module.exports = { getCriterios };
