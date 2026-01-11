import { Router } from "express";
import { resumen } from "./dashboard.controller.js";
import { requireAuth } from "../auth/auth.middleware.js";

const router = Router();

// protegido (ERP)
router.get("/resumen", requireAuth, resumen);

export default router;
