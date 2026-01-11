import { getResumenDashboard } from "./dashboard.service.js";

export async function resumen(req, res) {
  const data = await getResumenDashboard();
  res.json(data);
}
