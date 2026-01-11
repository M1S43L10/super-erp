import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  listarUsuariosActivos,
  buscarUsuarioPorUsername,
} from "./auth.service.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

export async function getUsuarios(req, res) {
  const usuarios = await listarUsuariosActivos();
  res.json(usuarios);
}

export async function login(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).send("Faltan credenciales.");

  const u = await buscarUsuarioPorUsername(username);
  if (!u || !u.activo) return res.status(401).send("Credenciales inválidas.");

  const ok = await bcrypt.compare(password, u.password_hash);
  if (!ok) return res.status(401).send("Credenciales inválidas.");

  const token = jwt.sign(
    { sub: u.id, username: u.username, rol: u.rol },
    JWT_SECRET,
    { expiresIn: "12h" }
  );

  res.json({
    token,
    user: { id: u.id, username: u.username, nombre: u.nombre, rol: u.rol },
  });
}

export async function me(req, res) {
  // requireAuth ya setea req.auth
  res.json(req.auth);
}
