// chatController.js

const chatService = require("../services/chatService");

let waitingUsers = [];
let connectedUsers = new Set(); // Track connected users

const handleConnection = (io, socket) => {
  console.log("New client connected", socket.id);

  socket.on("join", async ({ name, roomId }) => {
    const user = await chatService.addUser({
      name,
      roomId,
      socketId: socket.id,
    });
    socket.join(roomId);

    if (waitingUsers.length > 0) {
      const partnerSocket = waitingUsers.pop();
      const room = `${socket.id}#${partnerSocket.id}`;
      socket.join(room);
      partnerSocket.join(room);
      socket.partnerSocket = partnerSocket;
      partnerSocket.partnerSocket = socket;
      connectedUsers.add(socket.id);
      connectedUsers.add(partnerSocket.id);
      io.to(room).emit("chat-started", room);
    } else {
      waitingUsers.push(socket);
    }

    // Emit user counts to all clients
    io.sockets.emit("user-counts", {
      onlineCount: io.engine.clientsCount,
      connectedCount:
        connectedUsers.size % 2 === 0
          ? connectedUsers.size
          : connectedUsers.size - 1, // Divide by 2 as each pair counts once
    });
  });

  socket.on("send-message", (message) => {
    if (socket.partnerSocket) {
      io.to(socket.partnerSocket.id).emit("receive-message", message);
    }
  });

  socket.on("disconnect", async () => {
    console.log("Client disconnected", socket.id);
    connectedUsers.delete(socket.id);
    const user = await chatService.removeUser(socket.id);

    if (socket.partnerSocket) {
      socket.partnerSocket.partnerSocket = null;
      waitingUsers.push(socket.partnerSocket);
      // Attempt to pair with another waiting user
      if (waitingUsers.length > 0) {
        const partnerSocket = waitingUsers.pop();
        const room = `${socket.partnerSocket.id}#${partnerSocket.id}`;
        socket.partnerSocket.join(room);
        partnerSocket.join(room);
        socket.partnerSocket.partnerSocket = partnerSocket;
        partnerSocket.partnerSocket = socket.partnerSocket;
        connectedUsers.add(socket.partnerSocket.id);
        connectedUsers.add(partnerSocket.id);
        io.to(room).emit("chat-started", room);
      }
    }
    waitingUsers = waitingUsers.filter((user) => user.id !== socket.id);

    // Emit user counts to all clients
    io.sockets.emit("user-counts", {
      onlineCount: io.engine.clientsCount,
      connectedCount:
        connectedUsers.size % 2 === 0
          ? connectedUsers.size
          : connectedUsers.size - 1, // Divide by 2 as each pair counts once
    });
  });
};

module.exports = {
  handleConnection,
  connectedUsers, // Export connectedUsers set for use in server.js
};
