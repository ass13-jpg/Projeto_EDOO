// ─── API LAYER ──────────────────────────────────────────────────────────────
// Único ponto de contato com o backend C++.
// Ajuste somente aqui quando implementar um endpoint novo.
//
// Contrato esperado de GET /api/status:
// {
//   "dispositivos": [
//     { "id": 1, "nome": "Luminária Sala", "tipo": "luz",
//       "comodo": "Sala de Estar", "ligado": true,
//       "consumo_w": 12, "brilho": 80, "temperatura": 22 }
//   ],
//   "sensores": { "temperatura": 24, "umidade": 58, "luminosidade": 340, "co2": 412 }
// }

const BASE = 'http://localhost:8080';

export async function getStatus() {
  const res = await fetch(`${BASE}/api/status`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// POST /api/dispositivo/{id}/toggle
// Resposta: { "id": 1, "ligado": true }
export async function toggleDevice(id) {
  const res = await fetch(`${BASE}/api/dispositivo/${id}/toggle`, { method: 'POST' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}