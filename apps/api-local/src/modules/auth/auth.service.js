import { pool } from "../../db/pool.js";

export async function listarUsuariosActivos() {
  const { rows } = await pool.query(
    `SELECT id, username, nombre, rol
     FROM usuarios
     WHERE activo = true
     ORDER BY rol DESC, username ASC`
  );
  return rows;
}

export async function buscarUsuarioPorUsername(username) {
  const { rows } = await pool.query(
    `SELECT id, username, nombre, rol, password_hash, activo
     FROM usuarios
     WHERE username = $1
     LIMIT 1`,
    [username]
  );
  return rows[0] || null;
}

export async function crearAdminSiNoExiste({ username, nombre, passwordHash }) {
  const { rows } = await pool.query(
    `INSERT INTO usuarios (username, nombre, password_hash, rol, activo)
     VALUES ($1, $2, $3, 'ADMIN', true)
     ON CONFLICT (username) DO NOTHING
     RETURNING id, username, nombre, rol`,
    [username, nombre, passwordHash]
  );
  return rows[0] || null; // null si ya existía
}
