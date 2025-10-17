const pool = require("../config/db");

async function getPacienteById(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM persona WHERE idPersona = ?", [id]);
    if (!rows.length) return res.status(404).json({ message: "Paciente no encontrado" });
    res.json(rows[0]);
  } catch (e) { next(e); }
}

async function listPacientes(req, res, next) {
  try {
    const [rows] = await pool.query(`
      SELECT p.idPersona,
             CONCAT(p.nombres, ' ', p.primerApellido, ' ', IFNULL(p.segundoApellido, '')) AS nombreCompleto,
             p.numeroCelular, p.fechaNacimiento, p.sexo, p.direccion, p.CI,
             e.nombreEstablecimiento,
             CONCAT(ci.tipo, '-', ci.subtipo, '-', ci.estadoIngreso) AS criterioIngreso
      FROM persona p
      INNER JOIN establecimientosalud e ON p.EstablecimientoSalud_idEstablecimientoSalud = e.idEstablecimientoSalud
      LEFT JOIN criterioingreso ci ON p.idCriterioIngreso = ci.idCriterioIngreso
      WHERE p.estado = 1 AND p.idPersona NOT IN (SELECT ps.persona_idPersona FROM personalsalud ps);
    `);
    res.json(rows);
  } catch (e) { next(e); }
}

async function listPacientesByEst(req, res, next) {
  try {
    const { userIdEstablecimiento } = req.query;
    if (!userIdEstablecimiento) return res.status(400).json({ error: "Falta idEstablecimiento" });
    const [rows] = await pool.query(`
      SELECT p.idPersona,
             CONCAT(p.nombres, ' ', p.primerApellido, ' ', IFNULL(p.segundoApellido, '')) AS nombreCompleto,
             p.numeroCelular, p.fechaNacimiento, p.sexo, p.direccion, p.CI,
             e.nombreEstablecimiento,
             CONCAT(ci.tipo, '-', ci.subtipo, '-', ci.estadoIngreso) AS criterioIngreso
      FROM persona p
      INNER JOIN establecimientosalud e ON p.EstablecimientoSalud_idEstablecimientoSalud = e.idEstablecimientoSalud
      LEFT JOIN criterioingreso ci ON p.idCriterioIngreso = ci.idCriterioIngreso
      WHERE p.estado = 1 AND p.EstablecimientoSalud_idEstablecimientoSalud = ?
        AND p.idPersona NOT IN (SELECT ps.persona_idPersona FROM personalsalud ps);
    `, [userIdEstablecimiento]);
    res.json(rows);
  } catch (e) { next(e); }
}

async function listPacientesOnlyByEst(req, res, next) {
  try {
    const { idEstablecimiento } = req.query;
    const [rows] = await pool.query(`
      SELECT p.idPersona, CONCAT(p.nombres, ' ', p.primerApellido, ' ', IFNULL(p.segundoApellido, '')) AS nombreCompleto,
             p.numeroCelular, p.fechaNacimiento, p.sexo, p.direccion, p.CI, p.EstablecimientoSalud_idEstablecimientoSalud
      FROM persona p
      LEFT JOIN personalsalud ps ON p.idPersona = ps.persona_idPersona
      WHERE p.EstablecimientoSalud_idEstablecimientoSalud = ? AND p.estado = 1 AND (ps.persona_idPersona IS NULL);
    `, [idEstablecimiento]);
    res.json(rows);
  } catch (e) { next(e); }
}

async function createPaciente(req, res, next) {
  try {
    const { nombres, primerApellido, segundoApellido, numeroCelular, CI, direccion, sexo, fechaNacimiento, EstablecimientoSalud_idEstablecimientoSalud, idCriterioIngreso } = req.body;
    const [result] = await pool.query(`
      INSERT INTO persona (nombres, primerApellido, segundoApellido, numeroCelular, CI, direccion, sexo, fechaNacimiento, estado, EstablecimientoSalud_idEstablecimientoSalud, idCriterioIngreso)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `, [nombres, primerApellido, segundoApellido, numeroCelular, CI, direccion, sexo, fechaNacimiento, EstablecimientoSalud_idEstablecimientoSalud, idCriterioIngreso]);
    res.json({ message: "Paciente insertado con éxito", id: result.insertId });
  } catch (e) { next(e); }
}

async function updatePaciente(req, res, next) {
  try {
    const { id } = req.params;
    const { nombres, primerApellido, segundoApellido, numeroCelular, CI, direccion, sexo, fechaNacimiento, EstablecimientoSalud_idEstablecimientoSalud, idCriterioIngreso } = req.body;
    const [r] = await pool.query(`
      UPDATE persona SET nombres=?, primerApellido=?, segundoApellido=?, numeroCelular=?, CI=?, direccion=?, sexo=?, fechaNacimiento=?, EstablecimientoSalud_idEstablecimientoSalud=?, idCriterioIngreso=? WHERE idPersona=?
    `, [nombres, primerApellido, segundoApellido, numeroCelular, CI, direccion, sexo, fechaNacimiento, EstablecimientoSalud_idEstablecimientoSalud, idCriterioIngreso, id]);
    if (!r.affectedRows) return res.status(404).json({ message: "Paciente no encontrado" });
    res.json({ message: "Paciente actualizado correctamente" });
  } catch (e) { next(e); }
}

async function deactivatePaciente(req, res, next) {
  try {
    const { id } = req.params;
    const [r] = await pool.query("UPDATE persona SET estado = 0 WHERE idPersona = ?", [id]);
    if (!r.affectedRows) return res.status(404).json({ message: "Paciente no encontrado" });
    res.json({ message: "Estado actualizado a 0" });
  } catch (e) { next(e); }
}

module.exports = { getPacienteById, listPacientes, listPacientesByEst, listPacientesOnlyByEst, createPaciente, updatePaciente, deactivatePaciente };
