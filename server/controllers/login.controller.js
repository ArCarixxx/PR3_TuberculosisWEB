const pool = require("../config/db");

async function login(req, res, next) {
  try {
    const { nombreUsuario, contrasenia } = req.query;

    if (!nombreUsuario || !contrasenia) {
      return res
        .status(400)
        .json({ error: "Usuario y contraseña obligatorios" });
    }

    const [rows] = await pool.query(
      `
      SELECT 
        p.idPersona AS Nro,
        p.nombres AS Nombres,
        p.primerApellido AS PrimerApellido,
        p.segundoApellido AS SegundoApellido,
        ps.usuario AS Credencial,
        ps.contrasenia AS ClaveSegura,
        ps.rol AS NivelAcceso,
        p.EstablecimientoSalud_idEstablecimientoSalud AS idEstablecimiento,
        e.nombreEstablecimiento AS Establecimiento
      FROM personalsalud ps
      INNER JOIN persona p 
        ON ps.persona_idPersona = p.idPersona
      INNER JOIN establecimientosalud e 
        ON p.EstablecimientoSalud_idEstablecimientoSalud = e.idEstablecimientoSalud
      WHERE ps.usuario = ? AND ps.contrasenia = ?
      `,
      [nombreUsuario, contrasenia]
    );

    if (!rows.length) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const r = rows[0];

    const nombreCompleto = `${r.Nombres} ${r.PrimerApellido}${
      r.SegundoApellido ? ` ${r.SegundoApellido}` : ""
    }`.trim();
    const nombreCorto = `${r.Nombres.split(" ")[0]} ${r.PrimerApellido}`.trim();

    res.json({
      idPersona: r.Nro,
      usuario: r.Credencial,
      nombreCompleto, nombreCorto,
      rol: r.NivelAcceso,
      idEstablecimiento: r.idEstablecimiento,
      establecimiento: r.Establecimiento,
    });
  } catch (e) {
    next(e);
  }
}

async function loginMobile(req, res, next) {
  try {
    const { ci } = req.body;
    const [rows] = await pool.query("SELECT * FROM persona WHERE CI = ?", [ci]);
    if (!rows.length) return res.json({ message: "Invalid carnet de identidad" });
    res.json({ message: "Login successful", user: rows[0] });
  } catch (e) { next(e); }
}

module.exports = { login, loginMobile };
