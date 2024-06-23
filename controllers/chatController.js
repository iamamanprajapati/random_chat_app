const chatService = require('../services/chatService');

let waitingUsers = [];

const handleConnection = (io, socket) => {
  console.log('New client connected', socket.id);

  socket.on('join', async ({ name, roomId }) => {
    const user = await chatService.addUser({ name, roomId, socketId: socket.id });
    socket.join(roomId);

    if (waitingUsers.length > 0) {
      const partnerSocket = waitingUsers.pop();
      const room = `${socket.id}#${partnerSocket.id}`;
      socket.join(room);
      partnerSocket.join(room);
      socket.partnerSocket = partnerSocket;
      partnerSocket.partnerSocket = socket;
      io.to(room).emit('chat-started', room);
    } else {
      waitingUsers.push(socket);
    }
  });

  socket.on('send-message', (message) => {
    if (socket.partnerSocket) {
      io.to(socket.partnerSocket.id).emit('receive-message', message);
    }
  });

  socket.on('disconnect', async () => {
    console.log('Client disconnected', socket.id);
    const user = await chatService.removeUser(socket.id);
    if (socket.partnerSocket) {
      socket.partnerSocket.partnerSocket = null;
      waitingUsers.push(socket.partnerSocket);
    }
    waitingUsers = waitingUsers.filter(user => user.id !== socket.id);
  });
};

module.exports = {
  handleConnection,
};
