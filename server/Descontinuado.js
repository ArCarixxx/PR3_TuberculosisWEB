const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require('path');
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "15000mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // Asegúrate de incluir este middleware

const PORT = 3001;

app.use(express.urlencoded({ extended: true })); // Para datos URL-encoded

// app.listen(PORT, () => {
//   console.log("Servidor corriendo en el puerto 3001");
// });
const server = app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});

server.timeout = 600000; // 10 minutos

//conexion a la base de datos----------IMPORTANTE

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234", // 11352871
  database: "tuberculosisproyectlleno",
});

// Configura dónde se guardarán los archivos
const storage = multer.memoryStorage();  // Usamos memoria para almacenar el archivo en el buffer
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limitar a 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Solo se permiten archivos PDF'), false);
    }
    cb(null, true);
  }
});

// Uso del middleware
app.post("/upload", upload.single("documentoRef"), (req, res) => {
  if (req.file) {
    res.send("Archivo subido correctamente");
  } else {
    res.status(400).send("No se ha subido el archivo");
  }
});


// Comprobar conexión
db.connect((err) => {
  if (err) {
    console.error("Error conectando a la base de datos:", err);
    return;
  }
  console.log("Conectado a la base de datos");
});

// Puerto en el que corre el servidor


// Rutas

// Ruta para obtener id y nombre de Sedes ------------------------------------------------------------
app.get("/api/sedes", (req, res) => {
  const query = `
    SELECT idSede, nombreSede 
    FROM Sede 
    WHERE estado = 1;  
  `;
  db.query(query, (err, result) => {
    if (err) {
      console.error("Error obteniendo las sedes:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }
    res.json(result);
  });
});

// Ruta para insertar red de salud -----------------------------------------------------------------
app.post("/api/redesSalud", (req, res) => {
  const { nombreRedSalud, idSede } = req.body;

  const query = `
    INSERT INTO RedSalud (nombreRedSalud, idSede)
    VALUES (?, ?);
  `;

  
  db.query(query, [nombreRedSalud, idSede], (err, result) => {
    if (err) {
      console.error("Error insertando la red de salud:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }
    res.status(201).json({
      message: "Red de salud creada exitosamente",
      id: result.insertId,
    });
  });
});

// Ruta para obtener redes de salud según la sede ----------------------------------------------
app.get("/api/redesSalud/:idSede", (req, res) => {
  
  const { idSede } = req.params;
  const query = `
    SELECT idRedSalud, nombreRedSalud 
    FROM RedSalud 
    WHERE idSede = ? AND estado = 1; 
  `;
  db.query(query, [idSede], (err, result) => {
    if (err) {
      console.error("Error obteniendo las redes de salud:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }
    res.json(result);
  });
});

// Endpoint para guardar un video
app.post("/api/videos", async (req, res) => {
  const { nombre, descripcion, video_base64, persona_idPersona } = req.body;
  // Validación de campos
  console.log("request video");
  if (!nombre || !descripcion || !video_base64 || !persona_idPersona) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }
  
  const query = `
    INSERT INTO video (nombre, descripcion, video_base64, persona_idPersona, fecha_subida)
    VALUES (?, ?, ?, ?, ?)
  `;
  const fecha_subida = new Date().toISOString().slice(0, 19).replace('T', ' '); 
  try {
    db.query(
      query,
      [nombre, descripcion, video_base64, persona_idPersona, fecha_subida],
      (error, results) => {
        if (error) {
          console.error("Error al insertar en la base de datos:", error);
          res.status(500).json({ error: "Error al guardar el video en la base de datos." });
        } else {
          console.log("Video Subido");
          res.status(200).json({
            message: "Video guardado correctamente.",
            videoId: results.insertId,
          });
        }
      }
    );
  } catch (err) {
    console.error("Error en el servidor:", err);
    res.status(500).json({ error: err });
  }
});
// Ruta para obtener los videos y convertir formato
app.get("/api/videos", (req, res) => {
  const { role, establecimiento } = req.query;

  // Verificar si los parámetros existen
  if (!role || !establecimiento) {
    return res.status(400).json({ error: "Faltan parámetros: role o establecimiento" });
  }
  var query = `
  SELECT v.id, v.nombre, v.descripcion, v.video_base64, v.fecha_subida, concat(P.nombres, ' ' , P.primerapellido, ' ', P.segundoApellido) AS nombrecompleto, P.idPersona, e.idEstablecimientoSalud, e.nombreEstablecimiento
  FROM video v
  INNER JOIN persona P on P.idPersona = v.persona_idPersona
  INNER JOIN establecimientosalud e ON e.idEstablecimientoSalud = P.EstablecimientoSalud_idEstablecimientoSalud
  `;
  if(role !=="SuperAdmin"){
    query += `
    WHERE e.idEstablecimientoSalud = ${establecimiento}
  `;
  }
  

  db.query(query, async (err, result) => {
    if (err) {
      console.error("Error obteniendo los videos:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    const videos = await Promise.all(
      result.map(async (video) => {
        // Convertir base64 a archivo temporal MOV
        const movPath = path.join(__dirname, `${video.nombre}`);
        const mp4Path = path.join(__dirname, `${video.nombre}.mp4`);
        const buffer = Buffer.from(video.video_base64, "base64");

        fs.writeFileSync(movPath, buffer);

        try {
          // Convertir MOV a MP4
          await new Promise((resolve, reject) => {
            ffmpeg(movPath)
              .output(mp4Path)
              .on("end", resolve)
              .on("error", reject)
              .run();
          });

          // Leer MP4 convertido y codificar como base64
          const mp4Buffer = fs.readFileSync(mp4Path);
          const base64Mp4 = `data:video/mp4;base64,${mp4Buffer.toString(
            "base64"
          )}`;

          // Eliminar archivos temporales
          fs.unlinkSync(movPath);
          fs.unlinkSync(mp4Path);
          console.log(video)
          return {
            id: video.id, // Cambiado de idVideo a id
            name: video.nombre.replace(".mov", ".mp4"),
            description: video.descripcion,
            base64: base64Mp4,
            uploadDate: new Date(video.fecha_subida).toISOString(),
            idPersona: video.idPersona,
            nombrecompleto: video.nombrecompleto,
            idEstablecimientoSalud: video.idEstablecimientoSalud,
            nombreEstablecimiento: video.nombreEstablecimiento,
          };
        } catch (error) {
          console.error("Error al convertir video:", error);
          return null; // O manejar errores específicos
        }
      })
    );

    // Filtrar videos fallidos
    const validVideos = videos.filter((video) => video !== null);

    res.json(validVideos);
  });
});


// Ruta para insertar establecimiento de salud---------------------------------------------
app.post("/api/establecimientoSalud", (req, res) => {
  const { nombreEstablecimiento, telefono, clasificacion, idRedSalud } =
    req.body;

  // Primero, verificar si el establecimiento ya existe
  const checkQuery = `
    SELECT COUNT(*) AS count FROM establecimientosalud 
    WHERE nombreEstablecimiento = ?;
  `;

  db.query(checkQuery, [nombreEstablecimiento], (err, result) => {
    if (err) {
      console.error("Error verificando el establecimiento:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    // Si ya existe, retornar un error
    if (result[0].count > 0) {
      return res
        .status(400)
        .json({ error: "El establecimiento ya está registrado." });
    }

    // Si no existe, proceder a la inserción
    const insertQuery = `
      INSERT INTO establecimientosalud (nombreEstablecimiento, telefono, clasificacion, idRedSalud)
      VALUES (?, ?, ?, ?);
    `;

    db.query(
      insertQuery,
      [nombreEstablecimiento, telefono, clasificacion, idRedSalud],
      (err, result) => {
        if (err) {
          console.error("Error insertando el establecimiento de salud:", err);
          return res.status(500).json({ error: "Error en el servidor" });
        }
        res.status(201).json({
          message: "Establecimiento de salud creado exitosamente",
          id: result.insertId,
        });
      }
    );
  });
});

// Ruta para obtener el personal de salud con búsqueda por nombre
app.get("/api/personalSalud", (req, res) => {
  const { search } = req.query;
  let query = `
    SELECT 
      p.idPersona, 
      p.nombres, 
      p.primerApellido, 
      p.segundoApellido, 
      p.numeroCelular, 
      ps.rol,  
      p.CI,
      e.nombreEstablecimiento
    FROM persona p
    INNER JOIN personalsalud ps ON p.idPersona = ps.persona_idPersona
    INNER JOIN establecimientosalud e ON p.EstablecimientoSalud_idEstablecimientoSalud = e.idEstablecimientoSalud
    WHERE p.estado = 1
  `;

  

  // Si hay un término de búsqueda, agregar la condición al query
  if (search) {
    query += ` AND (p.nombres LIKE ? OR p.primerApellido LIKE ? OR p.segundoApellido LIKE ?)`;
  }

  db.query(
    query,
    [`%${search}%`, `%${search}%`, `%${search}%`],
    (err, result) => {
      if (err) {
        console.error("Error obteniendo el personal de salud:", err);
        return res.status(500).json({ error: "Error en el servidor" });
      }
      res.json(result);
    }
  );
});


app.get("/api/personalSaludEstablecimiento", (req, res) => {
  const { search, userIdEstablecimiento } = req.query; // Obtener userIdEstablecimiento de la query string
  let query = `
    SELECT 
      p.idPersona, 
      p.nombres, 
      p.primerApellido, 
      p.segundoApellido, 
      p.numeroCelular, 
      ps.rol,  
      p.CI,
      e.nombreEstablecimiento
    FROM persona p
    INNER JOIN personalsalud ps ON p.idPersona = ps.persona_idPersona
    INNER JOIN establecimientosalud e ON p.EstablecimientoSalud_idEstablecimientoSalud = e.idEstablecimientoSalud
    WHERE p.estado = 1 AND p.EstablecimientoSalud_idEstablecimientoSalud = ?
  `;

  // Si hay un término de búsqueda, agregar la condición al query
  const queryParams = [userIdEstablecimiento];
  if (search) {
    query += ` AND (p.nombres LIKE ? OR p.primerApellido LIKE ? OR p.segundoApellido LIKE ?)`;
    queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  db.query(query, queryParams, (err, result) => {
    if (err) {
      console.error("Error obteniendo el personal de salud:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }
    res.json(result);
  });
});

//Insertar Personal Salud-----------------------------------------------------------------------------------------------------------
app.post("/api/personalSalud", (req, res) => {
  const {
    nombres,
    primerApellido,
    segundoApellido,
    numeroCelular,
    CI,
    rol,
    EstablecimientoSalud_idEstablecimientoSalud,
  } = req.body;

  if (!EstablecimientoSalud_idEstablecimientoSalud) {
    return res
      .status(400)
      .json({ error: "El establecimiento de salud es obligatorio." });
  }

  const checkQuery = `
    SELECT * FROM persona WHERE CI = ? OR numeroCelular = ?;
  `;

  db.query(checkQuery, [CI, numeroCelular], (err, results) => {
    if (err) {
      console.error("Error al verificar CI o número de celular:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    if (results.length > 0) {
      return res
        .status(400)
        .json({ error: "El CI o el número de celular ya están registrados." });
    }

    const queryPersona = `
      INSERT INTO persona (nombres, primerApellido, segundoApellido, numeroCelular, CI, EstablecimientoSalud_idEstablecimientoSalud)
      VALUES (?, ?, ?, ?, ?, ?);
    `;

    db.query(
      queryPersona,
      [
        nombres,
        primerApellido,
        segundoApellido,
        numeroCelular,
        CI,
        EstablecimientoSalud_idEstablecimientoSalud,
      ],
      (err, result) => {
        if (err) {
          console.error("Error al insertar la persona:", err);
          return res.status(500).json({ error: "Error en el servidor" });
        }

        const personaId = result.insertId;

        const usuario = `${nombres.slice(0, 3).toLowerCase()}${primerApellido
          .slice(0, 3)
          .toLowerCase()}`;
        const contrasenia = CI;

        const queryPersonalSalud = `
        INSERT INTO personalsalud (persona_idPersona, usuario, contrasenia, rol)
        VALUES (?, ?, ?, ?);
      `;

        db.query(
          queryPersonalSalud,
          [personaId, usuario, contrasenia, rol],
          (err, result) => {
            if (err) {
              console.error("Error al insertar el personal de salud:", err);
              return res.status(500).json({ error: "Error en el servidor" });
            }

            res.status(201).json({
              message: "Personal de salud registrado exitosamente",
              credentials: { usuario, contrasenia }, // Enviar las credenciales generadas
            });
          }
        );
      }
    );
  });
});

// Ruta para obtener establecimientos de salud -----------------------------------------------------------------------
app.get("/api/establecimientos", (req, res) => {
  const query = `SELECT idEstablecimientoSalud AS id, nombreEstablecimiento AS nombre, clasificacion, telefono
                 FROM establecimientosalud;`;
  db.query(query, (error, result) => {
    if (error) {
      return res.status(500).send(error);
    }
    res.json(result);
  });
});

// Ruta para actualizar el personal de salud-------------------------------------------------------------------------------------
app.put("/api/personalSalud/:id", (req, res) => {
  const { id } = req.params; // id del personal de salud a actualizar
  const {
    nombres,
    primerApellido,
    segundoApellido,
    numeroCelular,
    rol,
    CI,
    EstablecimientoSalud_idEstablecimientoSalud,
  } = req.body;

  // Actualizar la tabla persona
  const queryPersona = `
    UPDATE persona 
    SET nombres = ?, primerApellido = ?, segundoApellido = ?, numeroCelular = ?, CI = ?, EstablecimientoSalud_idEstablecimientoSalud = ? 
    WHERE idPersona = ?;
  `;

  db.query(
    queryPersona,
    [
      nombres,
      primerApellido,
      segundoApellido,
      numeroCelular,
      CI,
      EstablecimientoSalud_idEstablecimientoSalud,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error al actualizar la persona:", err);
        return res.status(500).json({ error: "Error en el servidor" });
      }

      // Ahora actualizamos la tabla personalsalud
      const queryPersonalSalud = `
      UPDATE personalsalud 
      SET rol = ? 
      WHERE persona_idPersona = ?;
    `;

      db.query(queryPersonalSalud, [rol, id], (err, result) => {
        if (err) {
          console.error("Error al actualizar el personal de salud:", err);
          return res.status(500).json({ error: "Error en el servidor" });
        }

        res
          .status(200)
          .json({ message: "Personal de salud actualizado correctamente" });
      });
    }
  );
});

//obtener tratamientos ---------------------------------------------------------------------------------------------------------------------------------------------
app.get("/api/tratamientos/:personaId", (req, res) => {
  const { personaId } = req.params;

  const sql = `
    SELECT medicamento, fechaInicio, fechaFinalizacion, cantDosis, intervaloTiempo
    FROM tratamiento
    WHERE Persona_idPersona = ?;
  `;

  db.query(sql, [personaId], (err, result) => {
    if (err) {
      return res.status(500).send("Error al obtener los tratamientos");
    }
    res.json(result);
  });
});

// Ruta para agregar un nuevo tratamiento--------------------------------------------------------------------------------------------------------------------
app.post("/api/tratamientos", (req, res) => {
  const {
    medicamento,
    fechaInicio,
    fechaFinalizacion,
    cantDosis,
    intervaloTiempo,
    Persona_idPersona,
  } = req.body;

  const query = `
    INSERT INTO tratamiento (medicamento, fechaInicio, fechaFinalizacion, cantDosis, intervaloTiempo, Persona_idPersona)
    VALUES (?, ?, ?, ?, ?, ?);
  `;

  db.query(
    query,
    [
      medicamento,
      fechaInicio,
      fechaFinalizacion,
      cantDosis,
      intervaloTiempo,
      Persona_idPersona,
    ],
    (err, result) => {
      if (err) {
        console.error("Error insertando tratamiento:", err);
        return res.status(500).json({ error: "Error en el servidor" });
      }
      res.status(201).json({
        message: "Tratamiento añadido exitosamente",
        id: result.insertId,
      });
    }
  );
});

// Ruta para obtener los datos de un paciente por su id
app.get('/api/paciente/:id', (req, res) => {
  const pacienteId = req.params.id;

  const query = 'SELECT * FROM persona WHERE idPersona = ?';
  db.query(query, [pacienteId], (err, result) => {
    if (err) {
      console.error('Error en la consulta:', err);  // Imprime el error en la consola
      return res.status(500).send({ message: 'Error en el servidor' });
    }
    
    if (result.length > 0) {
      res.send(result[0]);  // Enviar solo el primer resultado
    } else {
      res.status(404).send({ message: 'Paciente no encontrado' });
    }
  });
});

// Ruta para obtener la lista de pacientes
app.get("/api/pacientes", (req, res) => {
  const query = `
    SELECT 
      p.idPersona, 
      CONCAT(p.nombres, ' ', p.primerApellido, ' ', IFNULL(p.segundoApellido, '')) AS nombreCompleto,
      p.numeroCelular, 
      p.fechaNacimiento, 
      p.sexo, 
      p.direccion, 
      p.CI,
      e.nombreEstablecimiento,
      CONCAT(ci.tipo, '-', ci.subtipo, '-', ci.estadoIngreso) AS criterioIngreso
    FROM persona p
    INNER JOIN establecimientosalud e ON p.EstablecimientoSalud_idEstablecimientoSalud = e.idEstablecimientoSalud
    LEFT JOIN criterioingreso ci ON p.idCriterioIngreso = ci.idCriterioIngreso
    WHERE p.estado = 1
  AND p.idPersona NOT IN (
      SELECT ps.persona_idPersona 
      FROM personalsalud ps
    );
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error("Error obteniendo la lista de pacientes:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }
    res.json(result);
  });
});
app.get("/api/pacientesEst", (req, res) => {
  const userIdEstablecimiento = req.query.userIdEstablecimiento;

  if (!userIdEstablecimiento) {
    return res.status(400).json({ error: "Falta el ID del establecimiento" });
  }

  const query = `
    SELECT 
      p.idPersona, 
      CONCAT(p.nombres, ' ', p.primerApellido, ' ', IFNULL(p.segundoApellido, '')) AS nombreCompleto,
      p.numeroCelular, 
      p.fechaNacimiento, 
      p.sexo, 
      p.direccion, 
      p.CI,
      e.nombreEstablecimiento,
      CONCAT(ci.tipo, '-', ci.subtipo, '-', ci.estadoIngreso) AS criterioIngreso
    FROM persona p
    INNER JOIN establecimientosalud e ON p.EstablecimientoSalud_idEstablecimientoSalud = e.idEstablecimientoSalud
    LEFT JOIN criterioingreso ci ON p.idCriterioIngreso = ci.idCriterioIngreso
    WHERE p.estado = 1
      AND p.EstablecimientoSalud_idEstablecimientoSalud = ?
      AND p.idPersona NOT IN (
        SELECT ps.persona_idPersona 
        FROM personalsalud ps
      );
  `;

  db.query(query, [userIdEstablecimiento], (err, result) => {
    if (err) {
      console.error("Error obteniendo la lista de pacientes:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }
    res.json(result);
  });
});


// Ruta para obtener criterios de ingreso -----------------------------------------------------------------------------------------------------------------------------
app.get("/api/criterios", (req, res) => {
  const query =
    "SELECT idCriterioIngreso, tipo, subtipo, estadoIngreso FROM criterioingreso WHERE estado = 1;";

  db.query(query, (err, result) => {
    if (err) {
      console.error("Error obteniendo los criterios:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }
    res.json(result);
  });
});

// Ruta para insertar un nuevo paciente en la tabla persona -------------------------------------------------------------------------------------------------------------------
app.post("/api/pacientes", (req, res) => {
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
  } = req.body;

  const query =
    `INSERT INTO persona (nombres, primerApellido, segundoApellido, numeroCelular, CI, direccion, sexo,
     fechaNacimiento, estado, EstablecimientoSalud_idEstablecimientoSalud, idCriterioIngreso) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`;

  db.query(
    query,
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
    ],
    (err, result) => {
      if (err) {
        console.error("Error insertando paciente:", err);
        return res.status(500).json({ error: "Error insertando paciente" });
      }
      res.json({
        message: "Paciente insertado con éxito",
        id: result.insertId,
      });
    }
  );
});

//ruta para obtener pacientes en el formulario actualizar--------------------------------------------------
app.get("/api/pacientesForm/:id", (req, res) => {
  const id = req.params.id;
  const query = `
    SELECT 
      p.idPersona, 
      p.nombres, 
      p.primerApellido, 
      p.segundoApellido, 
      p.numeroCelular, 
      p.fechaNacimiento, 
      p.sexo, 
      p.direccion, 
      p.CI,
      p.EstablecimientoSalud_idEstablecimientoSalud, 
      p.idCriterioIngreso
    FROM persona p
    WHERE p.idPersona = ? AND p.estado = 1;
  `;

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error al obtener el paciente:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }
    res.json(result[0]);
  });
});

// Ruta para actualizar el paciente-------------------------------------------------------------------------------------
app.put("/api/pacientes/:id", (req, res) => {
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
  } = req.body;

  const query = `
    UPDATE persona 
    SET 
      nombres = ?, 
      primerApellido = ?, 
      segundoApellido = ?, 
      numeroCelular = ?, 
      CI = ?, 
      direccion = ?, 
      sexo = ?, 
      fechaNacimiento = ?, 
      EstablecimientoSalud_idEstablecimientoSalud = ?, 
      idCriterioIngreso = ? 
    WHERE idPersona = ?`;

  db.query(
    query,
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
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error actualizando paciente:", err);
        return res.status(500).json({ error: "Error actualizando paciente" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Paciente no encontrado" });
      }

      res.json({ message: "Paciente actualizado correctamente" });
    }
  );
});


// Ruta para obtener los datos de un establecimiento de salud por su id
app.get('/api/establecimiento/:id', (req, res) => {
  const establecimientosaludId = req.params.id;

  const query = 'SELECT * FROM establecimientosalud WHERE idEstablecimeintoSalud = ?';
  db.query(query, [establecimientosaludId], (err, result) => {
    if (err) {
      console.error('Error en la consulta:', err);  // Imprime el error en la consola
      return res.status(500).send({ message: 'Error en el servidor' });
    }
    
    if (result.length > 0) {
      res.send(result[0]);  // Enviar solo el primer resultado
    } else {
      res.status(404).send({ message: 'Paciente no encontrado' });
    }
  });
});

//ruta para colocar el estado de 1 persona en 0 -----------------------------------------------------------------------------------------------------------------------------
app.put("/api/pacientesDelete/:id/estado", (req, res) => {
  const { id } = req.params;

  // Consulta SQL para actualizar el estado del paciente a 0
  const query = "UPDATE persona SET estado = 0 WHERE idPersona = ?";

  db.query(query, [id], (error, results) => {
    if (error) {
      console.error("Error al actualizar el estado del paciente:", error);
      return res
        .status(500)
        .json({ message: "Error al actualizar el estado del paciente." });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Paciente no encontrado." });
    }

    return res
      .status(200)
      .json({ message: "Estado del paciente actualizado a 0 correctamente." });
  });
});

/* ****************************************************** */
/* ************************ LOGIN *********************** */
/* ****************************************************** */
// LOGIN O AUTENTICACION DE USUARIOS CON VERIFICACION DE NOMBRE_USUARIO Y CONTRASEÑA
// NOTA:      EJECUTAR -> ALTER TABLE personalsalud ADD COLUMN estado TINYINT DEFAULT 1;
//            1
app.get("/api/login", (req, res) => {
  const { nombreUsuario, contrasenia } = req.query;

  if (!nombreUsuario || !contrasenia) {
    return res
      .status(400)
      .json({ error: "Nombre de usuario y contraseña son obligatorios" });
  }

  const query = `
    SELECT 
      p.idPersona AS Nro, 
      ps.usuario AS Credencial, 
      ps.contrasenia AS ClaveSegura, 
      ps.rol AS NivelAcceso,
      p.EstablecimientoSalud_idEstablecimientoSalud AS idEstablecimiento,
      e.nombreEstablecimiento AS Establecimiento
    FROM personalsalud ps
    INNER JOIN persona p ON ps.persona_idPersona = p.idPersona
    INNER JOIN establecimientosalud e ON p.EstablecimientoSalud_idEstablecimientoSalud = e.idEstablecimientoSalud
    WHERE ps.usuario = ? AND ps.contrasenia = ?
  `;

  db.query(query, [nombreUsuario, contrasenia], (error, result) => {
    if (error) {
      console.error("Error en el servidor:", error);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    if (result.length === 0) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    res.json({
      idPersona: result[0].Nro,
      usuario: result[0].Credencial,
      rol: result[0].NivelAcceso,
      idEstablecimiento: result[0].idEstablecimiento,
      establecimiento: result[0].Establecimiento,
    });
  });
});

// RUTA PROTEGIDA SOLO PARA ADMINISTRADORES
const verifyRole = (role) => {
  return (req, res, next) => {
    const { correo, contrasenia } = req.query;

    const query =
      "SELECT rol FROM persona WHERE correo = ? AND contrasenia = ?";
    db.query(query, [correo, contrasenia], (error, result) => {
      if (error || result.length === 0 || result[0].rol !== role) {
        return res.status(403).json({ error: "No autorizado" });
      }
      next();
    });
  };
};

// Ruta para obtener todas las personas
app.get('/api/personas', (req, res) => {
  const query = 'SELECT * FROM persona';
  
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error al ejecutar la consulta', err);
      return res.status(500).send({ message: 'Error en el servidor' });
    }
    if (result.length === 0) {
      return res.status(404).send({ message: 'No se encontraron personas' });
    }
    res.json(result);
  });
});

app.post('/api/loginmobile', (req, res) => {
  const { ci } = req.body;
  const query = `SELECT * FROM persona WHERE CI = ?`;
  console.log(`login ${ci}`)
  db.query(query, [ci], (err, result) => {
      if (err) {
          return res.status(500).send({ error: 'Database error' });
      }
      if (result.length > 0) {
          res.send({ message: 'Login successful', user: result[0] });
      } else {
          res.send({ message: 'Invalid carnet de identidad' });
      }
  });
});

app.post('/api/transferencias', async (req, res) => {

  const { 
    idEstablecimientoSaludOrigen, 
    idPersona, 
    idEstablecimientoSaludDestino, 
    Motivo, 
    Observacion, 
    documentoRef 
  } = req.body;

  // Validación de campos
  if (!idEstablecimientoSaludOrigen || !idPersona || !idEstablecimientoSaludDestino || !Motivo || !Observacion || !documentoRef) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios, incluyendo el documento.' });
  }

  try {
    // Inserta los datos en la tabla `transferencia`
    const query = `
      INSERT INTO transferencia 
      (idEstablecimientoSaludOrigen, idPersona, idEstablecimientoSaludDestino, motivo, observacion, documentoRef, fechaCreacion)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const fechaCreacion = new Date().toISOString().slice(0, 19).replace('T', ' ');

    db.query(
      query,
      [
        idEstablecimientoSaludOrigen,
        idPersona,
        idEstablecimientoSaludDestino,
        Motivo,
        Observacion,
        documentoRef,
        fechaCreacion,
      ],
      (error, results) => {
        if (error) {
          console.error('Error al insertar transferencia en la base de datos:', error);
          return res.status(500).json({ error: 'Error al guardar la transferencia en la base de datos.' });
        }

        // Después de insertar la transferencia, actualizamos el establecimiento de salud del paciente
        const updateQuery = `
          UPDATE persona 
          SET EstablecimientoSalud_idEstablecimientoSalud = ?
          WHERE idPersona = ?
        `;

        db.query(
          updateQuery,
          [idEstablecimientoSaludDestino, idPersona],
          (updateError, updateResults) => {
            if (updateError) {
              console.error('Error al actualizar el establecimiento del paciente:', updateError);
              return res.status(500).json({ error: 'Error al actualizar el establecimiento del paciente.' });
            }

        // Si todo es exitoso, responde con éxito
        res.status(200).json({
          message: 'Transferencia registrada correctamente.',
          transferenciaId: results.insertId,
        });
      }
    );
  }
);
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({ error: 'Error al procesar la transferencia.' });
  }
});

// Obtener una transferencia por ID
app.get('/api/transferencias/:id', async (req, res) => {
  try {
    const query = 'SELECT * FROM transferencia WHERE idTransferencia = ?';
    const [rows] = await db.query(query, [req.params.id]);

    if (rows.length > 0) {
      const transferencia = rows[0];
      res.json({
        ...transferencia,
        documentoRef: transferencia.documentoRef.toString('base64')  // Convierte el buffer a base64
      });
    } else {
      res.status(404).json({ error: 'Transferencia no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la transferencia' });
  }
});

app.get('/api/gettransferencias', async (req, res) => {
  try {
    const query = `SELECT 
  t.idTransferencia, 
  e.idEstablecimientoSalud AS idEstablecimientoSaludOrigen, -- Asegúrate de incluir este campo
  e.nombreEstablecimiento AS establecimientoOrigen, 
  es.nombreEstablecimiento AS establecimientoDestino, 
  CONCAT(p.nombres, ' ', p.primerApellido, ' ', IFNULL(p.segundoApellido, '')) AS nombreCompleto, 
  t.motivo, t.observacion, t.documentoRef
FROM transferencia t
INNER JOIN establecimientosalud e ON t.idEstablecimientoSaludOrigen = e.idEstablecimientoSalud
INNER JOIN establecimientosalud es ON t.idEstablecimientoSaludDestino = es.idEstablecimientoSalud
INNER JOIN persona p ON t.idPersona = p.idPersona;
`;
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error al obtener transferencias:', err);
        return res.status(500).json({ error: 'Error al obtener transferencias' });
      }
      res.json(results);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.get('/api/pacientesEstablecimiento', async (req, res) => {
  const { idEstablecimiento } = req.query; // Obtener ID del establecimiento de la solicitud

  try {
    const query = `SELECT 
    p.idPersona, CONCAT(p.nombres, ' ', p.primerApellido, ' ', IFNULL(p.segundoApellido, '')) AS nombreCompleto,
    p.numeroCelular, p.fechaNacimiento, p.sexo, p.direccion, p.CI, p.EstablecimientoSalud_idEstablecimientoSalud
    FROM persona p
    LEFT JOIN personalsalud ps ON p.idPersona = ps.persona_idPersona
    WHERE p.EstablecimientoSalud_idEstablecimientoSalud = ? AND p.estado = 1 AND (ps.persona_idPersona IS NULL );
    `;

    db.query(query, [idEstablecimiento], (err, results) => {
      if (err) {
        console.error('Error al obtener pacientes:', err);
        return res.status(500).json({ error: 'Error al obtener pacientes' });
      }
      res.json(results);
    });
  } catch (error) {
    console.error('Error del servidor:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});


app.get("/api/admin-data", verifyRole("administrador"), (req, res) => {
  res.json({ message: "Datos confidenciales del administrador" });
});
