import bcrypt from "bcryptjs";
import { crearAdminSiNoExiste } from "../modules/auth/auth.service.js";

export async function seedAdmin() {
  const username = process.env.ADMIN_USER || "Administrador";
  const password = process.env.ADMIN_PASS || "admin";

  const passwordHash = await bcrypt.hash(password, 10);

  const created = await crearAdminSiNoExiste({
    username,
    nombre: "Administrador",
    passwordHash,
  });

  if (created) {
    console.log("✅ Admin creado:", created.username);
  } else {
    console.log("ℹ️ Admin ya existía");
  }
}
