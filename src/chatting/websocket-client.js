const socket = new WebSocket('ws://localhost:3000'); // Replace with your server URL

socket.onopen = () => {
    console.log('Connected to WebSocket server');
};

socket.onmessage = (event) => {
    const {sender, message} = JSON.parse(event.data);
    console.log('Received message from', sender, ':', message);
};

socket.onclose = () => {
    console.log('Disconnected from WebSocket server');
};

// Example: Send a message to the server
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value;
    socket.send(JSON.stringify({message}));
    messageInput.value = '';
}
