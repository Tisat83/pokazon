
// Insert this inside your io.on('connection', (socket) => { ... })
socket.on('host:feedback', ({ code, type, kind, payload }) => {
  try {
    console.log('[OKO server] host:feedback', code, kind, payload);
    const room = `code:${code}`;
    io.to(room).emit('feedback:client', { type, kind, payload });
  } catch (e) {
    console.error('[OKO server] host:feedback relay error:', e && e.message ? e.message : e);
  }
});
