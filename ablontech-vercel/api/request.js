// ================================================================
//  POST /api/request  — Save a new support request
// ================================================================
'use strict';

const { saveRequest } = require('../lib/db');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { name, phone, email = '', category, message } = req.body || {};

    if (!name?.trim() || !phone?.trim() || !category?.trim() || !message?.trim()) {
      return res.status(400).json({ ok: false, error: 'Please fill in all required fields.' });
    }

    const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').toString().split(',')[0].trim();

    const record = await saveRequest({ name, phone, email, category, message, ip });

    return res.status(200).json({
      ok: true,
      message: "✅ Request received! We'll contact you shortly.",
      id: record.id,
    });
  } catch (err) {
    console.error('saveRequest error:', err.message);
    return res.status(500).json({ ok: false, error: 'Server error. Please call us directly.' });
  }
}
