// ================================================================
//  GET  /admin/login  — Show login page
//  POST /admin/login  — Process login
// ================================================================
'use strict';

const { createSession, getSession, checkCredentials, sendHTML } = require('../lib/auth');

const loginHTML = (error = '') => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin Login — Ablon Tech</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0c0c09;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:'Plus Jakarta Sans',sans-serif}
.card{background:#141410;border:1px solid rgba(240,184,90,.18);border-radius:22px;padding:3rem 2.5rem;width:100%;max-width:400px;box-shadow:0 0 80px rgba(240,184,90,.06),0 32px 64px rgba(0,0,0,.5)}
.logo-area{text-align:center;margin-bottom:2.25rem}
.logo-area img{height:76px;filter:drop-shadow(0 0 20px rgba(240,184,90,.35))}
.brand{font-size:.68rem;font-family:'JetBrains Mono',monospace;color:#5a5848;letter-spacing:.15em;text-transform:uppercase;margin-top:.6rem}
h1{font-size:1.3rem;font-weight:800;color:#f0ede6;letter-spacing:-.03em;text-align:center;margin-bottom:.3rem}
.sub{font-size:.82rem;color:#6e6b64;text-align:center;margin-bottom:2rem}
.err{background:rgba(255,80,60,.1);border:1px solid rgba(255,80,60,.25);color:#ff6050;padding:.75rem 1rem;border-radius:9px;font-size:.83rem;text-align:center;margin-bottom:1.25rem}
.field{margin-bottom:1.1rem}
label{display:block;font-size:.75rem;font-weight:700;color:#a0a098;letter-spacing:.04em;margin-bottom:.4rem;text-transform:uppercase}
input{width:100%;background:#0c0c09;border:1.5px solid rgba(255,255,255,.08);border-radius:9px;padding:.82rem 1rem;color:#f0ede6;font-family:'Plus Jakarta Sans',sans-serif;font-size:.9rem;outline:none;transition:all .2s}
input::placeholder{color:#3a3830}
input:focus{border-color:#f0b85a;box-shadow:0 0 0 3px rgba(240,184,90,.1)}
button{width:100%;background:#f0b85a;color:#111;border:none;border-radius:10px;padding:.9rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.95rem;font-weight:800;cursor:pointer;transition:all .2s;margin-top:.5rem}
button:hover{background:#f5cc8a;transform:translateY(-1px);box-shadow:0 6px 20px rgba(240,184,90,.3)}
.foot{text-align:center;margin-top:1.75rem;font-family:'JetBrains Mono',monospace;font-size:.65rem;color:#2e2c24}
</style>
</head>
<body>
<div class="card">
  <div class="logo-area">
    <img src="/assets/logo.png" alt="Ablon Tech">
    <div class="brand">// Admin Portal</div>
  </div>
  <h1>Sign In</h1>
  <p class="sub">Access the Ablon Tech admin dashboard</p>
  ${error ? `<div class="err">${error}</div>` : ''}
  <form method="POST" action="/admin/login">
    <div class="field">
      <label>Username</label>
      <input type="text" name="username" placeholder="Enter username" required autocomplete="username">
    </div>
    <div class="field">
      <label>Password</label>
      <input type="password" name="password" placeholder="••••••••••••" required autocomplete="current-password">
    </div>
    <button type="submit">Sign In →</button>
  </form>
  <p class="foot">Ablon Tech Internal System &nbsp;·&nbsp; Unauthorized access is prohibited</p>
</div>
</body>
</html>`;

export default async function handler(req, res) {
  // GET — show login page
  if (req.method === 'GET') {
    const { data } = await getSession(req);
    if (data?.admin) {
      res.writeHead(302, { Location: '/admin' });
      return res.end();
    }
    return sendHTML(res, 200, loginHTML());
  }

  // POST — process login
  if (req.method === 'POST') {
    const { username = '', password = '' } = req.body || {};

    if (checkCredentials(username.trim(), password)) {
      await createSession(res, { admin: true, loginAt: new Date().toISOString() });
      res.writeHead(302, { Location: '/admin' });
      return res.end();
    }

    return sendHTML(res, 401, loginHTML('❌ Invalid username or password.'));
  }

  res.status(405).end();
}
