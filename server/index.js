/**
 * OKO server (bind support) — add 'host:bind' so extra sockets from the same page can join the room.
 */
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('0123456789', 6);

const app = express();
app.use(cors());
app.use('/public', express.static(path.join(__dirname, '..', 'public')));
app.use('/demo', express.static(path.join(__dirname, '..', 'demo')));
app.use('/operator', express.static(path.join(__dirname, '..', 'operator')));

app.get('/', (_, res) => res.send('OKO server up'));

const srv = http.createServer(app);
const io = new Server(srv, { cors: { origin: '*' } });

/** sessions: code -> { host: socketId, createdAt } */
const sessions = new Map();

function ensureSession(code, hostSocketId) {
  if (!sessions.has(code)) {
    sessions.set(code, { host: hostSocketId || null, createdAt: Date.now() });
  } else if (hostSocketId) {
    sessions.get(code).host = hostSocketId;
  }
}

io.on('connection', (socket) => {
  const sid = socket.id;

  socket.on('host:new_session', (_payload, ack) => {
    const code = nanoid();
    ensureSession(code, sid);
    socket.join(code);
    if (typeof ack === 'function') ack({ code });
  });

  socket.on('host:start', ({ code }) => {
    if (!code) return;
    ensureSession(code, sid);
    socket.join(code);
    io.to(code).emit('host:ready');
  });

  // NEW: allow additional sockets (e.g., sdk.js) to join the room
  socket.on('host:bind', ({ code }) => {
    if (!code) return;
    if (sessions.has(code)) {
      socket.join(code);
      socket.emit('host:ready');
    }
  });

  socket.on('host:stop', ({ code }) => {
    if (!code) return;
    sessions.delete(code);
    io.to(code).emit('session:stopped');
    io.socketsLeave(code);
  });

  socket.on('guest:join', ({ code }) => {
    if (!code || !sessions.has(code)) {
      socket.emit('guest:error', { message: 'invalid_code' });
      return;
    }
    socket.join(code);
    socket.emit('guest:joined');
    io.to(code).emit('guest:joined');
  });

  socket.on('control:event', ({ code, type, payload }) => {
    if (!code) return;
    io.to(code).emit('control:event', { type, payload });
  });

  socket.on('feedback:client', ({ code, kind, payload }) => {
    if (!code) return;
    io.to(code).emit('feedback:client', { kind, payload });
  });

  socket.on('disconnect', () => {
    for (const [code, meta] of Array.from(sessions.entries())) {
      if (meta.host === sid) {
        sessions.delete(code);
        io.to(code).emit('session:stopped');
        io.socketsLeave(code);
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
srv.listen(PORT, () => {
  console.log(`OKO server running on http://localhost:${PORT}`);
});
