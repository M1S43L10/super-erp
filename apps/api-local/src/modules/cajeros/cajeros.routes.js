
import { Router } from "express";
import {
  crearCajero,
  loginCajero,
  listarCajeros,
  desactivarCajero
} from "./cajeros.controller.js";

const router = Router();

router.post("/", crearCajero);          // alta
router.post("/login", loginCajero);     // login POS
router.get("/", listarCajeros);          // admin
router.put("/:id/desactivar", desactivarCajero);

export default router;
