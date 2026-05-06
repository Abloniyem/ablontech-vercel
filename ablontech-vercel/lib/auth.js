// ================================================================
//  ABLON TECH — Auth & Session Helpers
//  lib/auth.js
//  
//  Sessions stored in Vercel KV with TTL.
//  Cookie-based, HttpOnly, secure.
// ================================================================

'use strict';

const KV_URL   = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'AblonTech@2026';
const SESSION_TTL = 3600; // 1 hour in seconds

async function kvSet(key, value, exSeconds) {
  const url  = `${KV_URL}/set/${key}`;
  const body = exSeconds
    ? { value: JSON.stringify(value), ex: exSeconds }
    : JSON.stringify(value);

  // Use EX command via setex
  const res = await fetch(`${KV_URL}/setex/${encodeURIComponent(key)}/${exSeconds}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  });
  return res.json();
}

async function kvGet(key) {
  const res = await fetch(`${KV_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
  });
  const data = await res.json();
  try {
    return typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
  } catch {
    return data.result;
  }
}

async function kvDel(key) {
  await fetch(`${KV_URL}/del/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
  });
}

// ── COOKIE PARSING ────────────────────────────────────────────
function parseCookies(cookieHeader = '') {
  const out = {};
  String(cookieHeader).split(';').forEach(part => {
    const idx = part.indexOf('=');
    if (idx < 0) return;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    try { out[decodeURIComponent(k)] = decodeURIComponent(v); } catch {}
  });
  return out;
}

// ── SESSION ───────────────────────────────────────────────────
function newSid() {
  const arr = new Uint8Array(24);
  for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getSession(req) {
  const cookies = parseCookies(req.headers.cookie);
  const sid = cookies['ablon_sid'];
  if (!sid) return { sid: null, data: null };
  const data = await kvGet(`sess:${sid}`);
  return { sid, data: data || null };
}

function sessionCookie(sid) {
  return `ablon_sid=${sid}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL}`;
}

function clearCookie() {
  return `ablon_sid=; Path=/; Max-Age=0`;
}

async function createSession(res, payload) {
  const sid = newSid();
  await kvSet(`sess:${sid}`, payload, SESSION_TTL);
  res.setHeader('Set-Cookie', sessionCookie(sid));
  return sid;
}

async function destroySession(req, res) {
  const { sid } = await getSession(req);
  if (sid) await kvDel(`sess:${sid}`);
  res.setHeader('Set-Cookie', clearCookie());
}

// ── AUTH CHECK ────────────────────────────────────────────────
async function requireAdmin(req, res) {
  const { data } = await getSession(req);
  if (!data?.admin) {
    res.writeHead(302, { Location: '/admin/login' });
    res.end();
    return false;
  }
  return true;
}

function checkCredentials(username, password) {
  return username === ADMIN_USER && password === ADMIN_PASS;
}

// ── RESPONSE HELPERS ──────────────────────────────────────────
function sendJSON(res, status, data) {
  res.status(status).json(data);
}

function sendHTML(res, status, html) {
  res.status(status).setHeader('Content-Type', 'text/html; charset=utf-8').send(html);
}

module.exports = {
  getSession, createSession, destroySession,
  requireAdmin, checkCredentials,
  sendJSON, sendHTML,
};
