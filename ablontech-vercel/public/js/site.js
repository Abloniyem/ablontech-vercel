/* ================================================================
   ABLON TECH — Public Website JS
   public/js/site.js
   ================================================================ */

'use strict';

// ── NAV SCROLL EFFECT ─────────────────────────────────────────
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ── SCROLL REVEAL ─────────────────────────────────────────────
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((el, i) => {
    if (el.isIntersecting) {
      const delay = Number(el.target.dataset.delay || 0);
      setTimeout(() => el.target.classList.add('visible'), delay);
      revealObs.unobserve(el.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.dataset.delay = (i % 5) * 75;
  revealObs.observe(el);
});

// ── STAT COUNTER ANIMATION ────────────────────────────────────
const counterObs = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    document.querySelectorAll('.stat-num[data-val]').forEach(el => {
      const target = parseInt(el.dataset.val, 10);
      const suffix = el.dataset.suffix || '';
      let current  = 0;
      const step   = target / 60;
      const tick   = () => {
        current = Math.min(current + step, target);
        el.textContent = Math.floor(current) + suffix;
        if (current < target) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    counterObs.disconnect();
  }
}, { threshold: 0.5 });

const statsBand = document.querySelector('.stats-band');
if (statsBand) counterObs.observe(statsBand);

// ── CONTACT FORM ──────────────────────────────────────────────
const form      = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const statusEl  = document.getElementById('fStatus');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      name:     document.getElementById('f-name').value.trim(),
      phone:    document.getElementById('f-phone').value.trim(),
      email:    document.getElementById('f-email').value.trim(),
      category: document.getElementById('f-category').value,
      message:  document.getElementById('f-message').value.trim(),
    };

    if (!data.name || !data.phone || !data.category || !data.message) {
      showStatus('err', '⚠ Please fill in all required fields.');
      return;
    }

    submitBtn.disabled     = true;
    submitBtn.textContent  = 'Sending…';

    try {
      const res  = await fetch('/api/request', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      });
      const json = await res.json();

      if (json.ok) {
        showStatus('ok', json.message || '✅ Request received! We\'ll contact you shortly.');
        form.reset();
      } else {
        showStatus('err', json.error || '❌ Something went wrong. Please call us directly.');
      }
    } catch {
      showStatus('err', '❌ Network error. Please call us directly.');
    } finally {
      setTimeout(() => {
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Send Message — We\'ll respond within 1 hour';
      }, 3000);
    }
  });
}

function showStatus(type, msg) {
  statusEl.textContent  = msg;
  statusEl.className    = `f-status ${type}`;
  statusEl.style.display = 'block';
  setTimeout(() => { statusEl.style.display = 'none'; }, 7000);
}
