// ================================================================
//  GET /admin  — Serve the admin dashboard (auth required)
// ================================================================
'use strict';

const { requireAdmin, sendHTML } = require('../lib/auth');

const dashboardHTML = () => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Dashboard — Ablon Tech Admin</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../public/css/admin.css">
</head>
<body>
<div class="layout">

  <aside class="sidebar" id="sidebar">
    <div class="sb-logo">
      <img src="/assets/logo.png" alt="Ablon Tech">
      <div class="sb-brand">ABLON TECH</div>
      <div class="sb-sub">Admin Dashboard</div>
    </div>
    <nav class="sb-nav">
      <a class="sb-link active" href="/admin"><span class="sb-icon">📋</span><span>Requests</span></a>
      <a class="sb-link" href="/api/admin/export"><span class="sb-icon">⬇</span><span>Export CSV</span></a>
      <a class="sb-link" href="/" target="_blank"><span class="sb-icon">🌐</span><span>View Website</span></a>
    </nav>
    <div class="sb-footer">
      <div class="sb-user">
        <div class="sb-avatar">A</div>
        <div><div class="sb-uname">admin</div><div class="sb-urole">Administrator</div></div>
      </div>
      <a href="/admin/logout" class="logout-link">🔓 Sign Out</a>
    </div>
  </aside>

  <div class="main">
    <header class="topbar">
      <div class="topbar-left">
        <button class="menu-toggle" onclick="document.getElementById('sidebar').classList.toggle('open')">☰</button>
        <div>
          <div class="topbar-title">Support Requests</div>
          <div class="topbar-path">ablon tech / admin / requests</div>
        </div>
      </div>
      <div class="topbar-right">
        <div class="live-pill"><div class="live-dot"></div>Live</div>
        <div class="clock" id="clock">--:--:--</div>
      </div>
    </header>

    <div class="content">
      <div class="stat-grid">
        <div class="stat-card c-total"><div class="stat-top"><span class="stat-label">Total Requests</span><span class="stat-ico">📊</span></div><div class="stat-val" id="s-total">—</div><div class="stat-foot">All time</div></div>
        <div class="stat-card c-new"><div class="stat-top"><span class="stat-label">New</span><span class="stat-ico">🆕</span></div><div class="stat-val" id="s-new">—</div><div class="stat-foot">Awaiting response</div></div>
        <div class="stat-card c-progress"><div class="stat-top"><span class="stat-label">In Progress</span><span class="stat-ico">⏳</span></div><div class="stat-val" id="s-progress">—</div><div class="stat-foot">Being handled</div></div>
        <div class="stat-card c-resolved"><div class="stat-top"><span class="stat-label">Resolved</span><span class="stat-ico">✅</span></div><div class="stat-val" id="s-resolved">—</div><div class="stat-foot">Completed</div></div>
      </div>

      <div class="toolbar">
        <div class="search-box">
          <span class="search-ico">🔍</span>
          <input type="text" id="searchInput" class="search-input" placeholder="Search name, phone, category, message...">
        </div>
        <div class="filter-group">
          <button class="filter-pill active" data-f="all">All</button>
          <button class="filter-pill fp-new" data-f="new">🆕 New</button>
          <button class="filter-pill fp-progress" data-f="progress">⏳ In Progress</button>
          <button class="filter-pill fp-resolved" data-f="resolved">✅ Resolved</button>
        </div>
        <a href="/api/admin/export" class="export-btn">⬇ Export CSV</a>
      </div>

      <div class="table-card">
        <div class="table-wrap">
          <table id="reqTable">
            <thead>
              <tr>
                <th style="width:50px">#</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Category</th>
                <th>Message</th>
                <th>Status</th>
                <th>Received</th>
                <th style="width:110px">Actions</th>
              </tr>
            </thead>
            <tbody id="tbody">
              <tr><td colspan="8"><div class="empty-state"><div class="empty-ico">⏳</div><div class="empty-msg">Loading requests...</div></div></td></tr>
            </tbody>
          </table>
        </div>
        <div class="table-footer">
          <span id="rowCount" class="row-count">—</span>
          <span style="color:var(--muted);font-size:.72rem;font-family:var(--mono)">Auto-refreshes every 30s</span>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="modal-backdrop" id="modal" onclick="modalClick(event)">
  <div class="modal-box">
    <div class="modal-head">
      <h3 id="modal-title">Request Detail</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body" id="modal-body"></div>
    <div class="modal-foot" id="modal-foot"></div>
  </div>
</div>

<div class="toast" id="toast"></div>
<script src="../public/js/admin.js"></script>
</body>
</html>`;

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const ok = await requireAdmin(req, res);
  if (!ok) return;
  return sendHTML(res, 200, dashboardHTML());
}
