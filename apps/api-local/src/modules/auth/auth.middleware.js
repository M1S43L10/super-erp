import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

export function requireAuth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;

  if (!token) return res.status(401).send("No autorizado.");

  try {
    req.auth = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (e) {
    return res.status(401).send("Token inválido.");
  }
}
