// chatController.js

const chatService = require("../services/chatService");

let rooms = {}; // Store active rooms

const handleConnection = (io, socket) => {
  console.log("New client connected", socket.id);

  socket.on("join", async ({ name, roomId }) => {
    const user = await chatService.addUser({
      name,
      roomId,
      socketId: socket.id,
    });
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = {
        users: [],
        roomId: roomId,
      };
    }

    rooms[roomId].users.push({ socketId: socket.id, name });

    io.to(roomId).emit("user-counts", {
      onlineCount: io.engine.clientsCount,
      connectedCount: rooms[roomId].users.length,
    });

    io.to(roomId).emit("user-joined", { name, roomId });

    if (rooms[roomId].users.length >= 5) {
      io.to(roomId).emit("chat-started", roomId);
    }
  });

  // chatController.js

  // chatController.js

  socket.on("send-message", ({ message, roomId }) => {
    const user = rooms[roomId].users.find(
      (user) => user.socketId === socket.id
    );
    socket.to(roomId).emit("receive-message", { message, name: user.name });
  });

  socket.on("disconnect", async () => {
    console.log("Client disconnected", socket.id);
    const user = await chatService.removeUser(socket.id);

    if (user) {
      const roomId = user.roomId;
      rooms[roomId].users = rooms[roomId].users.filter(
        (u) => u.socketId !== socket.id
      );

      io.to(roomId).emit("user-left", { name: user.name, roomId });

      io.to(roomId).emit("user-counts", {
        onlineCount: io.engine.clientsCount,
        connectedCount: rooms[roomId].users.length,
      });

      if (rooms[roomId].users.length === 0) {
        delete rooms[roomId];
      }
    }
  });
};

module.exports = {
  handleConnection,
};
