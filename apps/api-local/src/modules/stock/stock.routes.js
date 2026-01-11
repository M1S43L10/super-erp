import { Router } from "express";
import { ajustarStock, verSaldo } from "./stock.controller.js";

const router = Router();

router.post("/ajuste", ajustarStock);
router.get("/saldo", verSaldo);

export default router;
