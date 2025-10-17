const pool = require("../config/db");

async function createRed(req, res, next) {
  try {
    const { nombreRedSalud, idSede } = req.body;
    const [result] = await pool.query(
      "INSERT INTO RedSalud (nombreRedSalud, idSede) VALUES (?, ?)",
      [nombreRedSalud, idSede]
    );
    res.status(201).json({ message: "Red de salud creada", id: result.insertId });
  } catch (e) {
    next(e);
  }
}

async function getRedesBySede(req, res, next) {
  try {
    const { idSede } = req.params;
    const [rows] = await pool.query(
      "SELECT idRedSalud, nombreRedSalud FROM RedSalud WHERE idSede = ? AND estado = 1",
      [idSede]
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

module.exports = { createRed, getRedesBySede };
