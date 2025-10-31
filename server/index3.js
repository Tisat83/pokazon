/**
 * OKO server (fix for 'invalid_code'): upsert session on 'host:start'
 * Usage: replace C:\projects\oko\server\index.js and restart `npm run dev`
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
  // Host asks new code (ACK)
  socket.on('host:new_session', (_payload, ack) => {
    const code = nanoid();
    ensureSession(code, sid);
    socket.join(code);
    if (typeof ack === 'function') ack({ code });
  });

  // Host explicitly starts a session with provided code (UPSERT!)
  socket.on('host:start', ({ code }) => {
    if (!code) return;
    ensureSession(code, sid);
    socket.join(code);
    // optional notify
    io.to(code).emit('host:ready');
  });

  // Host stops
  socket.on('host:stop', ({ code }) => {
    if (!code) return;
    sessions.delete(code);
    io.to(code).emit('session:stopped');
    io.socketsLeave(code);
  });

  // Guest (operator) joins by code
  socket.on('guest:join', ({ code }) => {
    if (!code || !sessions.has(code)) {
      socket.emit('guest:error', { message: 'invalid_code' });
      return;
    }
    socket.join(code);
    socket.emit('guest:joined');
    io.to(code).emit('guest:joined'); // notify host too
  });

  // Operator sends control events
  socket.on('control:event', ({ code, type, payload }) => {
    if (!code) return;
    // forward to host/client in that room
    io.to(code).emit('control:event', { type, payload });
  });

  // Client feedback to operator UI
  socket.on('feedback:client', ({ code, kind, payload }) => {
    if (!code) return;
    io.to(code).emit('feedback:client', { kind, payload });
  });

  socket.on('disconnect', () => {
    // cleanup orphan sessions if host disconnected
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
