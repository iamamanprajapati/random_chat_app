const socket = io();
const loginForm = document.getElementById('login-form');
const loginContainer = document.getElementById('login-container');
const chatContainer = document.getElementById('chat-container');
const messageContainer = document.getElementById('message-container');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

let name, roomId;

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    name = document.getElementById('name-input').value;
    roomId = document.getElementById('room-input').value;
    socket.emit('join', { name, roomId });
    loginContainer.style.display = 'none';
    chatContainer.style.display = 'flex';
});

sendButton.addEventListener('click', () => {
    const message = messageInput.value;
    if (message) {
        appendMessage(message, 'sender');
        socket.emit('send-message', message);
        messageInput.value = '';
    }
});

socket.on('receive-message', (message) => {
    appendMessage(message, 'receiver');
});

function appendMessage(message, type) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type);
    messageElement.innerText = message;
    messageContainer.append(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}
