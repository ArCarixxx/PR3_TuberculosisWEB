const pool = require("../config/db");

// ✅ Obtener un paciente por ID
async function getPacienteById(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT 
        p.*, 
        e.nombreEstablecimiento,
        CONCAT(ci.tipo, ' - ', IFNULL(ci.subtipo, ''), ' (', ci.estadoIngreso, ')') AS criterioIngreso
      FROM persona p
      INNER JOIN establecimientosalud e 
        ON p.EstablecimientoSalud_idEstablecimientoSalud = e.idEstablecimientoSalud
      LEFT JOIN criterioingreso ci 
        ON p.idCriterioIngreso = ci.idCriterioIngreso
      WHERE p.idPersona = ?
    `, [id]);

    if (!rows.length)
      return res.status(404).json({ message: "Paciente no encontrado" });

    res.json(rows[0]);
  } catch (e) {
    console.error("Error en getPacienteById:", e);
    next(e);
  }
}

// ✅ Listar todos los pacientes (super admin)
async function listPacientes(req, res, next) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.idPersona,
        CONCAT(p.nombres, ' ', p.primerApellido, ' ', IFNULL(p.segundoApellido, '')) AS nombreCompleto,
        p.numeroCelular, 
        p.fechaNacimiento, 
        p.sexo, 
        p.direccion, 
        p.CI,
        p.tipoExtrapulmonar,  -- 👈 Nuevo campo
        e.nombreEstablecimiento,
        CONCAT(ci.tipo, '-', ci.estadoIngreso, '-', ci.subtipo) AS criterioIngreso
      FROM persona p
      INNER JOIN establecimientosalud e 
        ON p.EstablecimientoSalud_idEstablecimientoSalud = e.idEstablecimientoSalud
      LEFT JOIN criterioingreso ci 
        ON p.idCriterioIngreso = ci.idCriterioIngreso
      WHERE p.estado = 1 
        AND p.idPersona NOT IN (SELECT ps.persona_idPersona FROM personalsalud ps)
    `);
    res.json(rows);
  } catch (e) {
    console.error("Error en listPacientes:", e);
    next(e);
  }
}

// ✅ Listar pacientes filtrados por establecimiento (para admin o personal)
async function listPacientesByEst(req, res, next) {
  try {
    const { userIdEstablecimiento } = req.query;
    if (!userIdEstablecimiento)
      return res.status(400).json({ error: "Falta idEstablecimiento" });

    const [rows] = await pool.query(`
      SELECT 
        p.idPersona,
        CONCAT(p.nombres, ' ', p.primerApellido, ' ', IFNULL(p.segundoApellido, '')) AS nombreCompleto,
        p.numeroCelular, 
        p.fechaNacimiento, 
        p.sexo, 
        p.direccion, 
        p.CI,
        p.tipoExtrapulmonar,
        e.nombreEstablecimiento,
        CONCAT(ci.tipo, '-', ci.estadoIngreso, '-', ci.subtipo) AS criterioIngreso
      FROM persona p
      INNER JOIN establecimientosalud e 
        ON p.EstablecimientoSalud_idEstablecimientoSalud = e.idEstablecimientoSalud
      LEFT JOIN criterioingreso ci 
        ON p.idCriterioIngreso = ci.idCriterioIngreso
      WHERE p.estado = 1 
        AND p.EstablecimientoSalud_idEstablecimientoSalud = ?
        AND p.idPersona NOT IN (SELECT ps.persona_idPersona FROM personalsalud ps)
    `, [userIdEstablecimiento]);

    res.json(rows);
  } catch (e) {
    console.error("Error en listPacientesByEst:", e);
    next(e);
  }
}

// ✅ Listar solo pacientes (sin personal de salud)
async function listPacientesOnlyByEst(req, res, next) {
  try {
    const { idEstablecimiento } = req.query;
    const [rows] = await pool.query(`
      SELECT 
        p.idPersona, 
        CONCAT(p.nombres, ' ', p.primerApellido, ' ', IFNULL(p.segundoApellido, '')) AS nombreCompleto,
        p.numeroCelular, 
        p.fechaNacimiento, 
        p.sexo, 
        p.direccion, 
        p.CI, 
        p.tipoExtrapulmonar,
        p.EstablecimientoSalud_idEstablecimientoSalud
      FROM persona p
      LEFT JOIN personalsalud ps ON p.idPersona = ps.persona_idPersona
      WHERE p.EstablecimientoSalud_idEstablecimientoSalud = ? 
        AND p.estado = 1 
        AND ps.persona_idPersona IS NULL
    `, [idEstablecimiento]);
    res.json(rows);
  } catch (e) {
    console.error("Error en listPacientesOnlyByEst:", e);
    next(e);
  }
}

// ✅ Crear un nuevo paciente (con soporte para tipoExtrapulmonar)
async function createPaciente(req, res, next) {
  try {
    const {
      nombres,
      primerApellido,
      segundoApellido,
      numeroCelular,
      CI,
      direccion,
      sexo,
      fechaNacimiento,
      EstablecimientoSalud_idEstablecimientoSalud,
      idCriterioIngreso,
      tipoExtrapulmonar, // 👈 Nuevo
    } = req.body;

    // Validaciones mínimas
    if (!nombres || !primerApellido || !CI || !idCriterioIngreso)
      return res.status(400).json({ error: "Faltan campos obligatorios." });

    const [result] = await pool.query(
      `
      INSERT INTO persona (
        nombres, primerApellido, segundoApellido, numeroCelular, CI, direccion,
        sexo, fechaNacimiento, estado, EstablecimientoSalud_idEstablecimientoSalud, 
        idCriterioIngreso, tipoExtrapulmonar
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
      `,
      [
        nombres,
        primerApellido,
        segundoApellido,
        numeroCelular,
        CI,
        direccion,
        sexo,
        fechaNacimiento,
        EstablecimientoSalud_idEstablecimientoSalud,
        idCriterioIngreso,
        tipoExtrapulmonar || null, // 👈 Se guarda NULL si no aplica
      ]
    );

    res.json({ message: "Paciente insertado con éxito", id: result.insertId });
  } catch (e) {
    console.error("Error en createPaciente:", e);
    next(e);
  }
}

// ✅ Actualizar paciente (manteniendo tipoExtrapulmonar)
async function updatePaciente(req, res, next) {
  try {
    const { id } = req.params;
    const {
      nombres,
      primerApellido,
      segundoApellido,
      numeroCelular,
      CI,
      direccion,
      sexo,
      fechaNacimiento,
      EstablecimientoSalud_idEstablecimientoSalud,
      idCriterioIngreso,
      tipoExtrapulmonar, // 👈 Nuevo
    } = req.body;

    const [r] = await pool.query(
      `
      UPDATE persona 
      SET nombres=?, primerApellido=?, segundoApellido=?, numeroCelular=?, 
          CI=?, direccion=?, sexo=?, fechaNacimiento=?, 
          EstablecimientoSalud_idEstablecimientoSalud=?, 
          idCriterioIngreso=?, tipoExtrapulmonar=?
      WHERE idPersona=?
      `,
      [
        nombres,
        primerApellido,
        segundoApellido,
        numeroCelular,
        CI,
        direccion,
        sexo,
        fechaNacimiento,
        EstablecimientoSalud_idEstablecimientoSalud,
        idCriterioIngreso,
        tipoExtrapulmonar || null,
        id,
      ]
    );

    if (!r.affectedRows)
      return res.status(404).json({ message: "Paciente no encontrado" });

    res.json({ message: "Paciente actualizado correctamente" });
  } catch (e) {
    console.error("Error en updatePaciente:", e);
    next(e);
  }
}

// ✅ Desactivar paciente
async function deactivatePaciente(req, res, next) {
  try {
    const { id } = req.params;
    const [r] = await pool.query(
      "UPDATE persona SET estado = 0 WHERE idPersona = ?",
      [id]
    );
    if (!r.affectedRows)
      return res.status(404).json({ message: "Paciente no encontrado" });
    res.json({ message: "Paciente desactivado correctamente" });
  } catch (e) {
    console.error("Error en deactivatePaciente:", e);
    next(e);
  }
}

module.exports = {
  getPacienteById,
  listPacientes,
  listPacientesByEst,
  listPacientesOnlyByEst,
  createPaciente,
  updatePaciente,
  deactivatePaciente,
};
