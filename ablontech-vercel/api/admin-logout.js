// ================================================================
//  GET /admin/logout  — Destroy session and redirect to login
// ================================================================
'use strict';

const { destroySession } = require('../lib/auth');

export default async function handler(req, res) {
  await destroySession(req, res);
  res.writeHead(302, { Location: '/admin/login' });
  res.end();
}
