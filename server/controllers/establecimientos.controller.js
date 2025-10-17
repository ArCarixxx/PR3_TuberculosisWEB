const pool = require("../config/db");

async function createEstablecimiento(req, res, next) {
  try {
    const { nombreEstablecimiento, telefono, clasificacion, idRedSalud } = req.body;

    const [dup] = await pool.query(
      "SELECT COUNT(*) AS count FROM establecimientosalud WHERE nombreEstablecimiento = ?",
      [nombreEstablecimiento]
    );
    if (dup[0].count > 0) return res.status(400).json({ error: "Ya existe" });

    const [result] = await pool.query(
      "INSERT INTO establecimientosalud (nombreEstablecimiento, telefono, clasificacion, idRedSalud) VALUES (?, ?, ?, ?)",
      [nombreEstablecimiento, telefono, clasificacion, idRedSalud]
    );
    res.status(201).json({ message: "Establecimiento creado", id: result.insertId });
  } catch (e) {
    next(e);
  }
}

async function getEstablecimientos(req, res, next) {
  try {
    const [rows] = await pool.query(
      "SELECT idEstablecimientoSalud AS id, nombreEstablecimiento AS nombre, clasificacion, telefono FROM establecimientosalud"
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

async function getEstablecimientoById(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM establecimientosalud WHERE idEstablecimientoSalud = ?",
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: "No encontrado" });
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
}

module.exports = { createEstablecimiento, getEstablecimientos, getEstablecimientoById };
