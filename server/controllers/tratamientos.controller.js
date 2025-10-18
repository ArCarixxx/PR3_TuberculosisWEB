const pool = require("../config/db");

async function getTratamientos(req, res, next) {
  try {
    const { personaId } = req.params;
    const [rows] = await pool.query(
      "SELECT medicamento, fechaInicio, fechaFinalizacion, cantDosis, intervaloTiempo FROM tratamiento WHERE Persona_idPersona = ?",
      [personaId]
    );
    res.json(rows);
  } catch (e) { next(e); }
}

async function createTratamiento(req, res, next) {
  try {
    const { medicamento, fechaInicio, fechaFinalizacion, cantDosis, intervaloTiempo, Persona_idPersona } = req.body;
    const [r] = await pool.query(
      `INSERT INTO tratamiento (medicamento, fechaInicio, fechaFinalizacion, cantDosis, intervaloTiempo, Persona_idPersona) VALUES (?, ?, ?, ?, ?, ?)`,
      [medicamento, fechaInicio, fechaFinalizacion, cantDosis, intervaloTiempo, Persona_idPersona]
    );
    res.status(201).json({ message: "Tratamiento añadido", id: r.insertId });
  } catch (e) { next(e); }
}


// ✅ Eliminar tratamiento por ID
async function deleteTratamiento(req, res, next) {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      "DELETE FROM tratamiento WHERE idTratamiento = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Tratamiento no encontrado" });
    }

    res.json({ message: "✅ Tratamiento eliminado correctamente" });
  } catch (e) {
    console.error("Error al eliminar tratamiento:", e);
    next(e);
  }
}


module.exports = { getTratamientos, createTratamiento, deleteTratamiento };
