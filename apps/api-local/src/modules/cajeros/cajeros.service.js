import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../../db/pool.js";

export const crearCajero = async ({ numero_cajero, pin, nombre }) => {
  if (!/^\d+$/.test(pin)) throw new Error("El PIN debe ser numérico");

  const pinHash = await bcrypt.hash(pin, 10);

  const { rows } = await pool.query(
    `INSERT INTO cajeros (numero_cajero, pin_hash, nombre)
     VALUES ($1,$2,$3)
     RETURNING id, numero_cajero, nombre, activo`,
    [numero_cajero, pinHash, nombre]
  );

  return rows[0];
};

export const loginCajero = async ({ numero_cajero, pin }) => {
  const { rows } = await pool.query(
    `SELECT * FROM cajeros
     WHERE numero_cajero = $1 AND activo = true`,
    [numero_cajero]
  );

  if (!rows.length) throw new Error("Cajero inválido");

  const cajero = rows[0];
  const ok = await bcrypt.compare(pin, cajero.pin_hash);
  if (!ok) throw new Error("PIN incorrecto");

  const token = jwt.sign(
    { cajero_id: cajero.id, numero_cajero },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  return {
    token,
    cajero: {
      id: cajero.id,
      numero_cajero: cajero.numero_cajero,
      nombre: cajero.nombre
    }
  };
};

export const listarCajeros = async () => {
  const { rows } = await pool.query(
    "SELECT id, numero_cajero, nombre, activo FROM cajeros ORDER BY numero_cajero"
  );
  return rows;
};

export const desactivarCajero = async (id) => {
  await pool.query("UPDATE cajeros SET activo = false WHERE id = $1", [id]);
};
