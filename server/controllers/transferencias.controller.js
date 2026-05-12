const pool = require("../config/db");

async function createTransferencia(req, res, next) {
  try {
    const { idEstablecimientoSaludOrigen, idPersona, idEstablecimientoSaludDestino, Motivo, Observacion, documentoRef } = req.body;
    if (!idEstablecimientoSaludOrigen || !idPersona || !idEstablecimientoSaludDestino || !Motivo || !Observacion || !documentoRef) {
      return res.status(400).json({ error: "Todos los campos son obligatorios, incluyendo el documento." });
    }

    const fechaCreacion = new Date();
    const [r] = await pool.query(
      `INSERT INTO transferencia (idEstablecimientoSaludOrigen, idPersona, idEstablecimientoSaludDestino, motivo, observacion, documentoRef, fechaCreacion)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [idEstablecimientoSaludOrigen, idPersona, idEstablecimientoSaludDestino, Motivo, Observacion, documentoRef, fechaCreacion]
    );

    await pool.query(
      `UPDATE persona SET EstablecimientoSalud_idEstablecimientoSalud = ? WHERE idPersona = ?`,
      [idEstablecimientoSaludDestino, idPersona]
    );

    res.json({ message: "Transferencia registrada", transferenciaId: r.insertId });
  } catch (e) { next(e); }
}

async function getTransferenciaById(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM transferencia WHERE idTransferencia = ?", [id]);
    if (!rows.length) return res.status(404).json({ error: "No encontrada" });
    const t = rows[0];
    res.json({ ...t, documentoRef: Buffer.from(t.documentoRef).toString("base64") });
  } catch (e) { next(e); }
}

async function listTransferencias(req, res, next) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        t.idTransferencia,
        t.fechaCreacion,

        t.idEstablecimientoSaludOrigen,
        t.idEstablecimientoSaludDestino,

        e.nombreEstablecimiento AS establecimientoOrigen,
        es.nombreEstablecimiento AS establecimientoDestino,

        CONCAT(
          p.nombres, ' ', 
          p.primerApellido, ' ', 
          IFNULL(p.segundoApellido, '')
        ) AS nombreCompleto,

        t.motivo,
        t.observacion,
        t.documentoRef

      FROM transferencia t
      INNER JOIN establecimientosalud e  
        ON t.idEstablecimientoSaludOrigen = e.idEstablecimientoSalud

      INNER JOIN establecimientosalud es 
        ON t.idEstablecimientoSaludDestino = es.idEstablecimientoSalud

      INNER JOIN persona p               
        ON t.idPersona = p.idPersona

      ORDER BY t.fechaCreacion DESC
    `);

    res.json(rows);
  } catch (e) {
    next(e);
  }
}

module.exports = { createTransferencia, getTransferenciaById, listTransferencias };
