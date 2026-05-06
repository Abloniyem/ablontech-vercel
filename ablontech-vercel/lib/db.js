// ================================================================
//  ABLON TECH — Database Layer
//  lib/db.js
//
//  Uses Vercel KV (Redis) for persistent storage.
//  All requests stored as JSON, indexed by ID.
//  KV env vars are auto-injected by Vercel when you add KV store.
// ================================================================

'use strict';

// ── KV CLIENT ─────────────────────────────────────────────────
// Vercel KV provides these env vars automatically:
//   KV_REST_API_URL, KV_REST_API_TOKEN
// We call the REST API directly so no npm package is needed.

const KV_URL   = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

async function kvCall(method, path, body = null) {
  if (!KV_URL || !KV_TOKEN) {
    throw new Error('KV not configured. Add KV_REST_API_URL and KV_REST_API_TOKEN env vars.');
  }
  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'application/json',
    },
  };
  if (body !== null) opts.body = JSON.stringify(body);
  const res = await fetch(`${KV_URL}${path}`, opts);
  return res.json();
}

// ── HELPERS ───────────────────────────────────────────────────
function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function now() {
  return new Date().toLocaleString('en-ET', {
    timeZone: 'Africa/Addis_Ababa',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });
}

// ── DB API ────────────────────────────────────────────────────

/**
 * Save a new support request.
 * Returns the saved record with id, status, created_at.
 */
async function saveRequest(data) {
  const id = newId();
  const record = {
    id,
    name:       (data.name       || '').trim().slice(0, 100),
    phone:      (data.phone      || '').trim().slice(0, 30),
    email:      (data.email      || '').trim().slice(0, 100),
    category:   (data.category   || '').trim().slice(0, 100),
    message:    (data.message    || '').trim().slice(0, 2000),
    ip:         (data.ip         || '').slice(0, 45),
    status:     'new',
    created_at: now(),
    updated_at: '',
  };

  // Store individual record
  await kvCall('POST', `/set/req:${id}`, JSON.stringify(record));

  // Add ID to the sorted index (score = timestamp for ordering)
  await kvCall('POST', `/zadd/req_index`, { score: Date.now(), member: id });

  return record;
}

/**
 * Get all requests, newest first.
 * Optionally filter by status or search term.
 */
async function getRequests({ status = 'all', search = '' } = {}) {
  // Get all IDs sorted by time descending
  const indexRes = await kvCall('GET', `/zrange/req_index/0/-1/rev`);
  const ids = indexRes.result || [];

  if (!ids.length) return [];

  // Fetch all records in parallel
  const records = await Promise.all(
    ids.map(async id => {
      const r = await kvCall('GET', `/get/req:${id}`);
      try { return typeof r.result === 'string' ? JSON.parse(r.result) : r.result; }
      catch { return null; }
    })
  );

  let result = records.filter(Boolean);

  // Filter by status
  if (status && status !== 'all') {
    result = result.filter(r => r.status === status);
  }

  // Filter by search term
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(r =>
      (r.name     || '').toLowerCase().includes(q) ||
      (r.phone    || '').toLowerCase().includes(q) ||
      (r.email    || '').toLowerCase().includes(q) ||
      (r.category || '').toLowerCase().includes(q) ||
      (r.message  || '').toLowerCase().includes(q)
    );
  }

  return result;
}

/**
 * Get counts grouped by status.
 */
async function getCounts() {
  const all = await getRequests({ status: 'all' });
  const counts = { new: 0, progress: 0, resolved: 0 };
  all.forEach(r => {
    if (r.status in counts) counts[r.status]++;
  });
  return { total: all.length, ...counts };
}

/**
 * Update the status of a request.
 */
async function updateStatus(id, newStatus) {
  const res = await kvCall('GET', `/get/req:${id}`);
  let record;
  try { record = typeof res.result === 'string' ? JSON.parse(res.result) : res.result; }
  catch { return null; }
  if (!record) return null;

  record.status     = newStatus;
  record.updated_at = now();

  await kvCall('POST', `/set/req:${id}`, JSON.stringify(record));
  return record;
}

/**
 * Delete a request.
 */
async function deleteRequest(id) {
  await kvCall('POST', `/del/req:${id}`);
  await kvCall('POST', `/zrem/req_index`, id);
  return true;
}

/**
 * Get all requests as CSV string.
 */
async function exportCSV() {
  const rows = await getRequests({ status: 'all' });
  const header = ['ID', 'Name', 'Phone', 'Email', 'Category', 'Message', 'Status', 'IP', 'Created At', 'Updated At'];
  const lines  = rows.map(r => [
    r.id,
    `"${(r.name     || '').replace(/"/g, '""')}"`,
    `"${(r.phone    || '').replace(/"/g, '""')}"`,
    `"${(r.email    || '').replace(/"/g, '""')}"`,
    `"${(r.category || '').replace(/"/g, '""')}"`,
    `"${(r.message  || '').replace(/"/g, '""')}"`,
    r.status || '',
    r.ip     || '',
    r.created_at || '',
    r.updated_at || '',
  ].join(','));
  return [header.join(','), ...lines].join('\r\n');
}

module.exports = { saveRequest, getRequests, getCounts, updateStatus, deleteRequest, exportCSV };
