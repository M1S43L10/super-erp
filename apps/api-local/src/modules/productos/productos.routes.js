import { Router } from "express";
import {
  crearProducto,
  listarProductos,
  agregarCodigoBarra,
  agregarPrecio,
} from "./productos.controller.js";

const router = Router();

router.get("/", listarProductos);
router.post("/", crearProducto);
router.post("/:id/codigos-barra", agregarCodigoBarra);
router.post("/:id/precios", agregarPrecio);

export default router;
