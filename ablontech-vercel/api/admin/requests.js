// ================================================================
//  GET /api/admin/requests  — Fetch requests (admin only)
//  Query params: status=all|new|progress|resolved  q=searchterm
// ================================================================
'use strict';

const { requireAdmin } = require('../../lib/auth');
const { getRequests, getCounts } = require('../../lib/db');

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const ok = await requireAdmin(req, res);
  if (!ok) return;

  try {
    const status = req.query.status || 'all';
    const search = (req.query.q || '').trim();

    const [requests, counts] = await Promise.all([
      getRequests({ status, search }),
      getCounts(),
    ]);

    return res.status(200).json({
      ok: true,
      requests,
      total:    counts.total,
      counts: [
        { status: 'new',      n: counts.new },
        { status: 'progress', n: counts.progress },
        { status: 'resolved', n: counts.resolved },
      ],
    });
  } catch (err) {
    console.error('GET /api/admin/requests error:', err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
