// OKO server with HMAC /boot and Origin allowlist
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const { Server } = require('socket.io');
const { nanoid } = require('nanoid');
const { valid } = require('./hmac/verify');

const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
const OPERATOR_SECRET = process.env.OPERATOR_SECRET || '';
const HMAC_SECRET = process.env.HMAC_SECRET || '';

const app = express();
app.use(cors({ origin: (origin, cb) => cb(null, true) }));
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// In-memory sessions
const sessions = new Map(); // code -> { hostSocketId, origin }

app.get('/', (_req, res) => res.end('OKO server up'));

// HMAC boot endpoint
app.get('/boot', (req, res) => {
  const origin = req.query.origin;
  const ts = req.query.ts;
  const sig = req.query.sig;

  if (!HMAC_SECRET) {
    return res.json({ ok: true, hmac: false });
  }
  const ok = valid({ origin, ts, sig }, { secret: HMAC_SECRET, allowlist: CORS_ORIGIN });
  if (!ok) return res.status(403).json({ ok: false, error: 'bad_signature_or_origin' });
  return res.json({ ok: true, hmac: true });
});

io.use((socket, next) => {
  // Optional extra Origin guard on WS upgrade
  const origin = socket.handshake.headers.origin || '';
  if (CORS_ORIGIN.length && !CORS_ORIGIN.includes(origin)) {
    return next(new Error('origin_not_allowed'));
  }
  next();
});

io.on('connection', (socket) => {
  // host starts session
  socket.on('host:start', ({ origin }) => {
    const code = ('' + Math.floor(100000 + Math.random() * 900000));
    sessions.set(code, { hostSocketId: socket.id, origin });
    socket.emit('host:code', { code });
  });

  // host binds (for reconnects)
  socket.on('host:bind', ({ code }) => {
    const s = sessions.get(code);
    if (!s) return socket.emit('error', { error: 'invalid_code' });
    s.hostSocketId = socket.id;
    socket.emit('host:bound', { ok: true });
  });

  // guest joins
  socket.on('guest:join', ({ code, operatorSecret }) => {
    const s = sessions.get(code);
    if (!s) return socket.emit('guest:error', { error: 'invalid_code' });
    if (OPERATOR_SECRET && operatorSecret !== OPERATOR_SECRET) {
      return socket.emit('guest:error', { error: 'bad_password' });
    }
    socket.join(code);
    socket.emit('guest:joined', { ok: true });
    io.to(s.hostSocketId).emit('host:guest-joined', { guestId: socket.id });
  });

  // relay pointer/scroll/keydown etc.
  socket.on('op:pointer', (p) => socket.to(p.code).emit('op:pointer', p));
  socket.on('op:scroll', (p) => socket.to(p.code).emit('op:scroll', p));
  socket.on('op:keydown', (p) => socket.to(p.code).emit('op:keydown', p));
  socket.on('op:keyup', (p) => socket.to(p.code).emit('op:keyup', p));
  socket.on('op:focus', (p) => socket.to(p.code).emit('op:focus', p));
  socket.on('op:window', (p) => socket.to(p.code).emit('op:window', p));

  // stop
  socket.on('host:stop', ({ code }) => {
    io.to(code).emit('session:stopped', {});
    sessions.delete(code);
  });

  socket.on('disconnect', () => {});
});

server.listen(PORT, () => console.log('OKO server with HMAC on http://localhost:'+PORT));
