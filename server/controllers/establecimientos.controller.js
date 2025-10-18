const pool = require("../config/db");

// Crear establecimiento
async function createEstablecimiento(req, res, next) {
  try {
    const { nombreEstablecimiento, telefono, clasificacion, idRedSalud } = req.body;

    // Validar duplicado
    const [dup] = await pool.query(
      "SELECT COUNT(*) AS count FROM establecimientosalud WHERE nombreEstablecimiento = ?",
      [nombreEstablecimiento]
    );
    if (dup[0].count > 0)
      return res.status(400).json({ error: "El establecimiento ya existe." });

    const [result] = await pool.query(
      "INSERT INTO establecimientosalud (nombreEstablecimiento, telefono, clasificacion, idRedSalud) VALUES (?, ?, ?, ?)",
      [nombreEstablecimiento, telefono, clasificacion, idRedSalud]
    );

    res
      .status(201)
      .json({ message: "✅ Establecimiento creado correctamente.", id: result.insertId });
  } catch (e) {
    console.error("Error en createEstablecimiento:", e);
    next(e);
  }
}

// Obtener todos los establecimientos con sede y red de salud
async function getEstablecimientoslista(req, res, next) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        es.idEstablecimientoSalud AS id,
        es.nombreEstablecimiento,
        es.telefono,
        es.clasificacion,
        rs.nombreRedSalud,
        s.nombreSede
      FROM establecimientosalud es
      INNER JOIN redsalud rs ON es.idRedSalud = rs.idRedSalud
      INNER JOIN sede s ON rs.idSede = s.idSede
      WHERE es.estado = 1
      ORDER BY s.nombreSede, rs.nombreRedSalud, es.nombreEstablecimiento;
    `);

    res.json(rows);
  } catch (e) {
    console.error("Error en getEstablecimientos:", e);
    next(e);
  }
}

// Obtener establecimiento por ID
async function getEstablecimientoById(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `
      SELECT 
        es.idEstablecimientoSalud AS id,
        es.nombreEstablecimiento,
        es.telefono,
        es.clasificacion,
        rs.nombreRedSalud,
        s.nombreSede
      FROM establecimientosalud es
      INNER JOIN redsalud rs ON es.idRedSalud = rs.idRedSalud
      INNER JOIN sede s ON rs.idSede = s.idSede
      WHERE es.idEstablecimientoSalud = ?
      `,
      [id]
    );

    if (!rows.length)
      return res.status(404).json({ message: "Establecimiento no encontrado." });

    res.json(rows[0]);
  } catch (e) {
    console.error("Error en getEstablecimientoById:", e);
    next(e);
  }
}
// Obtener todos los establecimientos activos
async function getEstablecimientos(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT 
         e.idEstablecimientoSalud AS id,
         e.nombreEstablecimiento AS nombre,
         e.telefono,
         e.clasificacion,
         r.nombreRedSalud,
         s.nombreSede
       FROM establecimientosalud e
       INNER JOIN redsalud r ON e.idRedSalud = r.idRedSalud
       INNER JOIN sede s ON r.idSede = s.idSede
       WHERE e.estado = 1
       ORDER BY e.nombreEstablecimiento ASC`
    );
    res.json(rows);
  } catch (e) {
    console.error("Error al obtener establecimientos:", e);
    next(e);
  }
}

module.exports = {
  createEstablecimiento,
  getEstablecimientos,
  getEstablecimientoById,
  getEstablecimientoslista,
};
