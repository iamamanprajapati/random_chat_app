const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { syncDB } = require('./models');
const chatController = require('./controllers/chatController');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Sync database
syncDB();

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Default route to serve index.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
  chatController.handleConnection(io, socket);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
