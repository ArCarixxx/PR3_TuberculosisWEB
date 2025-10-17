import db from "../config/db.js";

export const getAll = async () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT idPersona, CONCAT(nombres, ' ', primerApellido, ' ', IFNULL(segundoApellido, '')) AS nombreCompleto,
      numeroCelular, fechaNacimiento, sexo, direccion, CI
      FROM persona WHERE estado = 1
      AND idPersona NOT IN (SELECT persona_idPersona FROM personalsalud);
    `;
    db.query(query, (err, result) => (err ? reject(err) : resolve(result)));
  });
};

export const insert = async (data) => {
  const query = `
    INSERT INTO persona (nombres, primerApellido, segundoApellido, numeroCelular, CI, direccion, sexo, fechaNacimiento, estado, EstablecimientoSalud_idEstablecimientoSalud, idCriterioIngreso)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`;
  const values = [
    data.nombres,
    data.primerApellido,
    data.segundoApellido,
    data.numeroCelular,
    data.CI,
    data.direccion,
    data.sexo,
    data.fechaNacimiento,
    data.EstablecimientoSalud_idEstablecimientoSalud,
    data.idCriterioIngreso,
  ];
  return new Promise((resolve, reject) => {
    db.query(query, values, (err, result) => (err ? reject(err) : resolve(result)));
  });
};

export const update = async (id, data) => {
  const query = `
    UPDATE persona SET nombres=?, primerApellido=?, segundoApellido=?, numeroCelular=?, CI=?, direccion=?, sexo=?, fechaNacimiento=?, EstablecimientoSalud_idEstablecimientoSalud=?, idCriterioIngreso=? WHERE idPersona=?`;
  const values = [
    data.nombres, data.primerApellido, data.segundoApellido, data.numeroCelular,
    data.CI, data.direccion, data.sexo, data.fechaNacimiento,
    data.EstablecimientoSalud_idEstablecimientoSalud, data.idCriterioIngreso, id,
  ];
  return new Promise((resolve, reject) => {
    db.query(query, values, (err, result) => (err ? reject(err) : resolve(result)));
  });
};

export const deactivate = async (id) => {
  return new Promise((resolve, reject) => {
    db.query("UPDATE persona SET estado = 0 WHERE idPersona = ?", [id], (err, result) =>
      err ? reject(err) : resolve(result)
    );
  });
};
