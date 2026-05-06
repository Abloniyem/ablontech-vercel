// ================================================================
//  PATCH /api/admin/requests/:id  — Update status
//  DELETE /api/admin/requests/:id — Delete request
// ================================================================
'use strict';

const { requireAdmin } = require('../../../lib/auth');
const { updateStatus, deleteRequest } = require('../../../lib/db');

export default async function handler(req, res) {
  const ok = await requireAdmin(req, res);
  if (!ok) return;

  const { id } = req.query;
  if (!id) return res.status(400).json({ ok: false, error: 'Missing id' });

  // PATCH — update status
  if (req.method === 'PATCH') {
    const { status } = req.body || {};
    if (!['new', 'progress', 'resolved'].includes(status)) {
      return res.status(400).json({ ok: false, error: 'Invalid status' });
    }
    try {
      const record = await updateStatus(id, status);
      if (!record) return res.status(404).json({ ok: false, error: 'Not found' });
      return res.status(200).json({ ok: true, record });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  // DELETE — remove request
  if (req.method === 'DELETE') {
    try {
      await deleteRequest(id);
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  res.status(405).end();
}
