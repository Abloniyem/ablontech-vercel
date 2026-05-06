/* ================================================================
   ABLON TECH — Admin Dashboard JS
   public/js/admin.js
   ================================================================ */

'use strict';

// ── STATE ────────────────────────────────────────────────────
let currentFilter = 'all';
let searchTerm    = '';
let allData       = [];
let refreshTimer  = null;
let currentModal  = null;

// ── CLOCK ───────────────────────────────────────────────────
const clockEl = document.getElementById('clock');
function tick() {
  clockEl.textContent = new Date().toLocaleTimeString('en-ET', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}
setInterval(tick, 1000);
tick();

// ── FILTER PILLS ────────────────────────────────────────────
document.querySelectorAll('.filter-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.f;
    load();
  });
});

// ── SEARCH ──────────────────────────────────────────────────
let searchTimer;
document.getElementById('searchInput').addEventListener('input', e => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    searchTerm = e.target.value.trim();
    load();
  }, 350);
});

// ── LOAD DATA ───────────────────────────────────────────────
async function load() {
  const params = new URLSearchParams({ status: currentFilter, q: searchTerm });
  try {
    const res  = await fetch('/api/admin/requests?' + params);
    if (res.status === 401) { window.location.href = '/admin/login'; return; }
    const data = await res.json();
    if (!data.ok) return;
    allData = data.requests;
    renderStats(data);
    renderTable(data.requests);
  } catch (e) {
    console.error('Load error:', e);
    showToast('Failed to load data', 'error');
  }
}

// ── STATS ───────────────────────────────────────────────────
function renderStats(data) {
  document.getElementById('s-total').textContent = data.total ?? 0;
  const map = {};
  (data.counts || []).forEach(c => { map[c.status] = c.n; });
  document.getElementById('s-new').textContent      = map.new      ?? 0;
  document.getElementById('s-progress').textContent = map.progress ?? 0;
  document.getElementById('s-resolved').textContent = map.resolved ?? 0;
}

// ── TABLE ───────────────────────────────────────────────────
function renderTable(rows) {
  const tbody    = document.getElementById('tbody');
  const rowCount = document.getElementById('rowCount');

  rowCount.textContent = `Showing ${rows.length} request${rows.length !== 1 ? 's' : ''}`;

  if (!rows.length) {
    tbody.innerHTML = `
      <tr><td colspan="8">
        <div class="empty-state">
          <div class="empty-ico">📭</div>
          <div class="empty-msg">No requests found.</div>
        </div>
      </td></tr>`;
    return;
  }

  const badgeMap = {
    new:      ['b-new',      '🆕 New'],
    progress: ['b-progress', '⏳ In Progress'],
    resolved: ['b-resolved', '✅ Resolved'],
  };

  tbody.innerHTML = rows.map(r => {
    const [bc, bl] = badgeMap[r.status] || ['b-new', 'New'];
    const dt = r.created_at || '';
    const [date, time] = [dt.split(' ')[0] || '', dt.split(' ')[1]?.slice(0,5) || ''];

    return `<tr onclick="openModal(${r.id})" title="Click to view full details">
      <td class="td-id">#${r.id}</td>
      <td class="td-name">${esc(r.name)}</td>
      <td class="td-phone" onclick="event.stopPropagation()">
        <a href="tel:${esc(r.phone)}">${esc(r.phone)}</a>
      </td>
      <td class="td-cat">${esc(r.category)}</td>
      <td class="td-msg" title="${esc(r.message)}">${esc(r.message)}</td>
      <td><span class="badge ${bc}">${bl}</span></td>
      <td class="td-date">${esc(date)}<br>${esc(time)}</td>
      <td onclick="event.stopPropagation()">
        <div class="actions">
          ${r.status !== 'progress' ? `<button class="act act-progress" title="Mark In Progress" onclick="changeStatus(${r.id},'progress')">⏳</button>` : ''}
          ${r.status !== 'resolved' ? `<button class="act act-resolve"  title="Mark Resolved"    onclick="changeStatus(${r.id},'resolved')">✅</button>` : ''}
          <button class="act act-delete" title="Delete" onclick="del(${r.id})">🗑</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

// ── MODAL ───────────────────────────────────────────────────
function openModal(id) {
  const r = allData.find(x => x.id === id);
  if (!r) return;
  currentModal = r;

  const badgeMap = {
    new:      ['b-new',      '🆕 New'],
    progress: ['b-progress', '⏳ In Progress'],
    resolved: ['b-resolved', '✅ Resolved'],
  };
  const [bc, bl] = badgeMap[r.status] || ['b-new', 'New'];

  document.getElementById('modal-title').textContent = `Request #${r.id} — ${r.name}`;

  document.getElementById('modal-body').innerHTML = `
    <div class="detail-row">
      <span class="detail-key">Name</span>
      <span class="detail-val">${esc(r.name)}</span>
    </div>
    <div class="detail-row">
      <span class="detail-key">Phone</span>
      <span class="detail-val">
        <a href="tel:${esc(r.phone)}" style="color:var(--gold);text-decoration:none">${esc(r.phone)}</a>
      </span>
    </div>
    <div class="detail-row">
      <span class="detail-key">Email</span>
      <span class="detail-val">
        ${r.email ? `<a href="mailto:${esc(r.email)}" style="color:var(--gold);text-decoration:none">${esc(r.email)}</a>` : '<span style="color:var(--muted)">—</span>'}
      </span>
    </div>
    <div class="detail-row">
      <span class="detail-key">Category</span>
      <span class="detail-val">${esc(r.category)}</span>
    </div>
    <div class="detail-row">
      <span class="detail-key">Status</span>
      <span class="detail-val"><span class="badge ${bc}">${bl}</span></span>
    </div>
    <div class="detail-row">
      <span class="detail-key">Received</span>
      <span class="detail-val" style="font-family:var(--mono);font-size:.8rem;color:var(--text2)">${esc(r.created_at)}</span>
    </div>
    ${r.updated_at ? `
    <div class="detail-row">
      <span class="detail-key">Updated</span>
      <span class="detail-val" style="font-family:var(--mono);font-size:.8rem;color:var(--text2)">${esc(r.updated_at)}</span>
    </div>` : ''}
    <div class="detail-row" style="flex-direction:column;gap:.5rem">
      <span class="detail-key">Message</span>
      <div class="detail-msg">${esc(r.message)}</div>
    </div>
  `;

  // Modal footer action buttons
  const footBtns = [];
  if (r.status !== 'progress') {
    footBtns.push(`<button class="modal-act modal-progress" onclick="changeStatus(${r.id},'progress');closeModal()">⏳ Mark In Progress</button>`);
  }
  if (r.status !== 'resolved') {
    footBtns.push(`<button class="modal-act modal-resolve" onclick="changeStatus(${r.id},'resolved');closeModal()">✅ Mark Resolved</button>`);
  }
  footBtns.push(`<button class="modal-act modal-delete" onclick="del(${r.id});closeModal()">🗑 Delete</button>`);
  document.getElementById('modal-foot').innerHTML = footBtns.join('');

  document.getElementById('modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  document.body.style.overflow = '';
  currentModal = null;
}

function modalClick(e) {
  if (e.target === document.getElementById('modal')) closeModal();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ── CHANGE STATUS ────────────────────────────────────────────
async function changeStatus(id, status) {
  try {
    const res  = await fetch(`/api/admin/requests/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data.ok) {
      const labels = { new: 'New', progress: 'In Progress', resolved: 'Resolved' };
      showToast(`✓ Marked as ${labels[status]}`, 'success');
      load();
    } else {
      showToast('Failed to update status', 'error');
    }
  } catch { showToast('Network error', 'error'); }
}

// ── DELETE ───────────────────────────────────────────────────
async function del(id) {
  if (!confirm(`Delete request #${id}? This cannot be undone.`)) return;
  try {
    const res  = await fetch(`/api/admin/requests/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.ok) { showToast('Request deleted', 'info'); load(); }
    else showToast('Failed to delete', 'error');
  } catch { showToast('Network error', 'error'); }
}

// ── TOAST ────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className   = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

// ── HTML ESCAPE ──────────────────────────────────────────────
function esc(s) {
  return String(s ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ── AUTO REFRESH ─────────────────────────────────────────────
function startRefresh() {
  clearInterval(refreshTimer);
  refreshTimer = setInterval(load, 30_000);
}

// ── INIT ─────────────────────────────────────────────────────
load();
startRefresh();

// Expose to window for inline onclick handlers
window.changeStatus = changeStatus;
window.del          = del;
window.openModal    = openModal;
window.closeModal   = closeModal;
window.modalClick   = modalClick;
