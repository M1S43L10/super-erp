import { Router } from "express";
import { getUsuarios, login, me } from "./auth.controller.js";
import { requireAuth } from "./auth.middleware.js";

const router = Router();

router.get("/usuarios", getUsuarios);   // para dropdown
router.post("/login", login);
router.get("/me", requireAuth, me);

export default router;
