import {
  crearProductoTx,
  buscarProductos,
  agregarCodigoBarraTx,
  agregarPrecioTx,
} from "./productos.service.js";

export async function crearProducto(req, res) {
  try {
    const r = await crearProductoTx(req.body);
    res.status(201).json(r);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function listarProductos(req, res) {
  try {
    const r = await buscarProductos(req.query);
    res.json(r);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function agregarCodigoBarra(req, res) {
  try {
    const r = await agregarCodigoBarraTx(req.params.id, req.body);
    res.status(201).json(r);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function agregarPrecio(req, res) {
  try {
    const r = await agregarPrecioTx(req.params.id, req.body);
    res.status(201).json(r);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}
