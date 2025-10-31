// HMAC verify helper
const crypto = require('crypto');

function sign(origin, ts, secret) {
  return crypto.createHmac('sha256', secret).update(`${origin}${ts}`).digest('hex');
}

function timingSafeEqual(a, b) {
  const A = Buffer.from(a || '', 'utf8');
  const B = Buffer.from(b || '', 'utf8');
  if (A.length !== B.length) return false;
  return crypto.timingSafeEqual(A, B);
}

function valid({ origin, ts, sig }, { secret, skewSec = 60, allowlist = [] }) {
  if (!origin || !ts || !sig) return false;
  const now = Math.floor(Date.now() / 1000);
  const t = Number(ts);
  if (Number.isNaN(t) || Math.abs(now - t) > skewSec) return false;
  if (allowlist.length && !allowlist.includes(origin)) return false;
  const expected = sign(origin, ts, secret);
  return timingSafeEqual(sig, expected);
}

module.exports = { sign, valid };
