const pool = require("../config/db");

async function listPersonal(req, res, next) {
  try {
    const { search } = req.query;
    let sql = `
      SELECT 
        p.idPersona, 
        p.nombres, 
        p.primerApellido, 
        p.segundoApellido, 
        p.numeroCelular, 
        ps.rol, 
        p.CI, 
        e.nombreEstablecimiento,
        e.idEstablecimientoSalud AS EstablecimientoSalud_idEstablecimientoSalud
      FROM persona p
      INNER JOIN personalsalud ps ON p.idPersona = ps.persona_idPersona
      INNER JOIN establecimientosalud e ON p.EstablecimientoSalud_idEstablecimientoSalud = e.idEstablecimientoSalud
      WHERE p.estado = 1
    `;
    const params = [];
    if (search) {
      sql += " AND (p.nombres LIKE ? OR p.primerApellido LIKE ? OR p.segundoApellido LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

async function listPersonalByEst(req, res, next) {
  try {
    const { search, userIdEstablecimiento } = req.query;

    let sql = `
      SELECT 
        p.idPersona, 
        p.nombres, 
        p.primerApellido, 
        p.segundoApellido, 
        p.numeroCelular, 
        ps.rol, 
        p.CI, 
        e.nombreEstablecimiento,
        e.idEstablecimientoSalud AS EstablecimientoSalud_idEstablecimientoSalud
      FROM persona p
      INNER JOIN personalsalud ps ON p.idPersona = ps.persona_idPersona
      INNER JOIN establecimientosalud e ON p.EstablecimientoSalud_idEstablecimientoSalud = e.idEstablecimientoSalud
      WHERE p.estado = 1 
      AND p.EstablecimientoSalud_idEstablecimientoSalud = ?
    `;

    const params = [userIdEstablecimiento];

    if (search) {
      sql +=
        " AND (p.nombres LIKE ? OR p.primerApellido LIKE ? OR p.segundoApellido LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

async function createPersonal(req, res, next) {
  try {
    const { nombres, primerApellido, segundoApellido, numeroCelular, CI, rol, EstablecimientoSalud_idEstablecimientoSalud } = req.body;
    if (!EstablecimientoSalud_idEstablecimientoSalud) return res.status(400).json({ error: "Establecimiento requerido" });

    const [dup] = await pool.query("SELECT * FROM persona WHERE CI = ? OR numeroCelular = ?", [CI, numeroCelular]);
    if (dup.length) return res.status(400).json({ error: "CI o celular ya registrados" });

    const [p] = await pool.query(
      `INSERT INTO persona (nombres, primerApellido, segundoApellido, numeroCelular, CI, EstablecimientoSalud_idEstablecimientoSalud) VALUES (?, ?, ?, ?, ?, ?)`,
      [nombres, primerApellido, segundoApellido, numeroCelular, CI, EstablecimientoSalud_idEstablecimientoSalud]
    );

    const personaId = p.insertId;
    const usuario = `${nombres.slice(0,3).toLowerCase()}${primerApellido.slice(0,3).toLowerCase()}`;
    const contrasenia = CI;

    await pool.query(
      `INSERT INTO personalsalud (persona_idPersona, usuario, contrasenia, rol) VALUES (?, ?, ?, ?)`,
      [personaId, usuario, contrasenia, rol]
    );

    res.status(201).json({ message: "Personal de salud registrado", credentials: { usuario, contrasenia } });
  } catch (e) { next(e); }
}

async function updatePersonal(req, res, next) {
  try {
    const { id } = req.params;
    const { nombres, primerApellido, segundoApellido, numeroCelular, rol, CI, EstablecimientoSalud_idEstablecimientoSalud } = req.body;

    await pool.query(
      `UPDATE persona SET nombres=?, primerApellido=?, segundoApellido=?, numeroCelular=?, CI=?, EstablecimientoSalud_idEstablecimientoSalud=? WHERE idPersona=?`,
      [nombres, primerApellido, segundoApellido, numeroCelular, CI, EstablecimientoSalud_idEstablecimientoSalud, id]
    );
    await pool.query(`UPDATE personalsalud SET rol=? WHERE persona_idPersona=?`, [rol, id]);
    res.json({ message: "Personal de salud actualizado" });
  } catch (e) { next(e); }
}



// ✅ Eliminar tratamiento por ID
async function deletePersonal(req, res, next) {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      "DELETE FROM personalsalud WHERE persona_idPersona = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "personal salud no encontrado" });
    }

    res.json({ message: "✅ personal salud eliminado correctamente" });
  } catch (e) {
    console.error("Error al eliminar personal salud:", e);
    next(e);
  }
}


module.exports = { listPersonal, listPersonalByEst, createPersonal, updatePersonal, deletePersonal };