// ================================================================
//  GET /api/admin/export  — Download all requests as CSV
// ================================================================
'use strict';

const { requireAdmin } = require('../../lib/auth');
const { exportCSV }    = require('../../lib/db');

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const ok = await requireAdmin(req, res);
  if (!ok) return;

  try {
    const csv  = await exportCSV();
    const date = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="ablontech_requests_${date}.csv"`);
    return res.status(200).send('\uFEFF' + csv); // BOM for Excel
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
