// script.js

const socket = io();
const loginForm = document.getElementById('login-form');
const loginContainer = document.getElementById('login-container');
const chatContainer = document.getElementById('chat-container');
const messageContainer = document.getElementById('message-container');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const connectingSign = document.getElementById('connecting');
const connectedUser = document.getElementById('connected-user');
const onlineCount = document.getElementById('online-count');
const connectedCount = document.getElementById('connected-count');

let name, roomId;

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    name = document.getElementById('name-input').value;
    roomId = document.getElementById('room-input').value;
    socket.emit('join', { name, roomId });
    loginContainer.style.display = 'none';  
    chatContainer.style.display = 'block';  
});

sendButton.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const message = messageInput.value.trim();
    
    if (message) {
        appendMessage(message, 'sender');
        socket.emit('send-message', { message, name });
        messageInput.value = '';
    }
}

socket.on('receive-message', (data) => {
    const { message, name } = data;
    appendMessage(`${name}: ${message}`, 'receiver');
});

socket.on('chat-started', (room) => {
    connectingSign.style.display = 'none';
    connectedUser.textContent = `Connected to: ${room}`;
});

socket.on('user-counts', (counts) => {
    onlineCount.textContent = `Online: ${counts.onlineCount}`;
    connectedCount.textContent = `Connected: ${counts.connectedCount}`;
});

function appendMessage(message, type) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type);
    const messageText = document.createElement('span');
    messageText.classList.add('message-text');
    messageText.textContent = message;
    messageElement.appendChild(messageText);
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}
