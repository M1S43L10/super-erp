import { Router } from "express";
import { crearVenta, abrirCaja, cerrarCaja } from "./pos.controller.js";

const router = Router();

router.post("/ventas", crearVenta);

// Caja
router.post("/caja/abrir", abrirCaja);
router.post("/caja/cerrar", cerrarCaja);

export default router;
