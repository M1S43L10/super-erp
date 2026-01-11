import { ajusteStockTx, saldoStock } from "./stock.service.js";

export async function ajustarStock(req, res) {
  try {
    const r = await ajusteStockTx(req.body);
    res.status(201).json(r);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function verSaldo(req, res) {
  try {
    const r = await saldoStock(req.query);
    res.json(r);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}
