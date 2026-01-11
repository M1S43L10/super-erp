import { crearVentaTx, abrirCajaTx, cerrarCajaTx } from "./pos.service.js";

export async function crearVenta(req, res) {
  try {
    const result = await crearVentaTx(req.body);
    res.status(201).json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function abrirCaja(req, res) {
  try {
    const result = await abrirCajaTx(req.body);
    res.status(201).json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function cerrarCaja(req, res) {
  try {
    const result = await cerrarCajaTx(req.body);
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}
