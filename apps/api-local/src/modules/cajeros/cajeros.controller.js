import * as service from "./cajeros.service.js";

export const crearCajero = async (req, res) => {
  try {
    const cajero = await service.crearCajero(req.body);
    res.json({ estado: "OK", cajero });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

export const loginCajero = async (req, res) => {
  try {
    const data = await service.loginCajero(req.body);
    res.json({ estado: "OK", ...data });
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
};

export const listarCajeros = async (_req, res) => {
  const cajeros = await service.listarCajeros();
  res.json(cajeros);
};

export const desactivarCajero = async (req, res) => {
  await service.desactivarCajero(req.params.id);
  res.json({ estado: "OK" });
};
