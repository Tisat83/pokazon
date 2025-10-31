
// OKO server patch (feedback relay):
// Добавьте в ваш server/index.js обработчики:
/*
io.on('connection', (socket) => {
  // ... существующий код ...
  socket.on('host:feedback', ({ code, type, kind, payload }) => {
    // пересылаем всем гостям в комнате кода
    const room = `code:${code}`;
    io.to(room).emit('feedback:client', { type, kind, payload });
  });
});
*/
