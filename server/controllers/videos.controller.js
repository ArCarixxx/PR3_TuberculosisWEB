const pool = require("../config/db");
const { movBase64ToMp4Base64 } = require("../utils/ffmpegHelper");

//
// ========================
//   GUARDAR VIDEO
// ========================
//
async function saveVideo(req, res, next) {
  try {
    const { nombre, descripcion, video_base64, persona_idPersona } = req.body;

    if (!nombre || !descripcion || !video_base64 || !persona_idPersona) {
      return res.status(400).json({
        error: "Todos los campos son obligatorios."
      });
    }

    const fecha_subida = new Date();

    const [result] = await pool.query(
      `INSERT INTO video 
        (nombre, descripcion, video_base64, persona_idPersona, fecha_subida)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, descripcion, video_base64, persona_idPersona, fecha_subida]
    );

    const videoId = result.insertId;

    // 🔥 Emitir evento de notificación por Socket.IO
    const io = req.app.get("io");
    io.emit("nuevo_video", {
      id: videoId,
      nombre,
      mensaje: "📹 Nuevo video subido por un paciente"
    });

    res.json({
      message: "Video guardado correctamente",
      videoId
    });

  } catch (e) {
    next(e);
  }
}

//
// ========================
//   LISTAR VIDEOS
// ========================
//
async function listVideos(req, res, next) {
  try {
    const { role, establecimiento } = req.query;

    if (!role || !establecimiento) {
      return res.status(400).json({ error: "Faltan parámetros" });
    }

    let sql = `
      SELECT 
        v.id, v.nombre, v.descripcion, v.video_base64, v.fecha_subida,
        CONCAT(p.nombres, ' ', p.primerApellido, ' ', p.segundoApellido) AS nombrecompleto,
        p.idPersona, 
        e.idEstablecimientoSalud, 
        e.nombreEstablecimiento
      FROM video v
      INNER JOIN persona p ON p.idPersona = v.persona_idPersona
      INNER JOIN establecimientosalud e ON e.idEstablecimientoSalud = p.EstablecimientoSalud_idEstablecimientoSalud
    `;

    const params = [];

    // Si NO es superadmin → filtrar por establecimiento
    if (role !== "SuperAdmin") {
      sql += " WHERE e.idEstablecimientoSalud = ?";
      params.push(establecimiento);
    }

    const [rows] = await pool.query(sql, params);

    // Convertir todos los videos
    const mapped = [];

    for (const v of rows) {
      try {
        const base64 = await movBase64ToMp4Base64(v.nombre, v.video_base64);

        mapped.push({
          id: v.id,
          name: v.nombre.replace(".mov", ".mp4"),
          description: v.descripcion,
          base64,
          uploadDate: new Date(v.fecha_subida).toISOString(),
          idPersona: v.idPersona,
          nombrecompleto: v.nombrecompleto,
          idEstablecimientoSalud: v.idEstablecimientoSalud,
          nombreEstablecimiento: v.nombreEstablecimiento
        });

      } catch (err) {
        console.error("Error convirtiendo video", err);
      }
    }

    res.json(mapped);

  } catch (e) {
    next(e);
  }
}

module.exports = {
  saveVideo,
  listVideos
};
