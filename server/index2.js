
// OKO server — full drop-in (feedback relay + stable rooms)
const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { customAlphabet } = require('nanoid');

const app = express();
app.use(cors());
app.use('/public', express.static(path.join(__dirname, '..', 'public')));
app.use('/demo', express.static(path.join(__dirname, '..', 'demo')));
app.use('/operator', express.static(path.join(__dirname, '..', 'operator')));
app.get('/', (req, res) => res.redirect('/demo/demo-anchors-widget.html'));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET','POST'] } });

const nanoNum = customAlphabet('0123456789', 6);
const sessions = new Map();
const socketToCode = new Map();

function createSession(hostSocketId, url) {
  let code = nanoNum();
  while (sessions.has(code)) code = nanoNum();
  const room = `code:${code}`;
  sessions.set(code, { room, hostSocketId, url: url || '', createdAt: Date.now() });
  socketToCode.set(hostSocketId, code);
  return code;
}
function stopSession(code, reason='stopped_by_host') {
  const sess = sessions.get(code);
  if (!sess) return;
  io.to(sess.room).emit('session:stopped', { reason });
  sessions.delete(code);
}

io.on('connection', (socket) => {
  console.log('[OKO] client connected', socket.id);

  socket.on('host:create', ({ url }) => {
    const code = createSession(socket.id, url);
    const sess = sessions.get(code);
    socket.join(sess.room);
    console.log('[OKO] host:create -> code', code, 'url', url);
    socket.emit('host:created', { code });
    if (url) io.to(sess.room).emit('navigate:url', { url });
  });

  socket.on('host:navigate', ({ code, url }) => {
    const sess = sessions.get(code);
    if (!sess) return;
    sess.url = url || '';
    io.to(sess.room).emit('navigate:url', { url: sess.url });
  });

  socket.on('host:stop', ({ code }) => {
    if (!sessions.has(code)) return;
    console.log('[OKO] host:stop', code);
    stopSession(code, 'stopped_by_host');
  });

  socket.on('guest:join', ({ code }) => {
    const sess = sessions.get(code);
    if (!sess) {
      socket.emit('guest:error', { message: 'invalid_code' });
      return;
    }
    socket.join(sess.room);
    console.log('[OKO] guest joined', code, '-> room', sess.room);
    socket.emit('guest:joined', { code });
    if (sess.url) socket.emit('navigate:url', { url: sess.url });
  });

  socket.on('control:event', ({ code, type, payload }) => {
    const sess = sessions.get(code);
    if (!sess) return;
    io.to(sess.room).emit('control:event', { type, payload });
  });

  // Feedback relay (client -> operator)
  socket.on('host:feedback', ({ code, type, kind, payload }) => {
    const sess = sessions.get(code);
    if (!sess) return;
    console.log('[OKO] host:feedback', code, kind, payload);
    io.to(sess.room).emit('feedback:client', { type, kind, payload });
  });

  socket.on('disconnect', () => {
    const code = socketToCode.get(socket.id);
    if (code) {
      console.log('[OKO] host disconnected, closing session', code);
      socketToCode.delete(socket.id);
      stopSession(code, 'host_disconnected');
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`OKO server running on http://localhost:${PORT}`);
});
