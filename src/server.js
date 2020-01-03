const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const { resolve } = require('path');

const connectedUsers = [];
var onlineUsers = 0;

io.on('connection', (socket) => {
  socket.emit('socketid', socket.id);
  console.log(`Connected: ${socket.id}`)
  socket.on('user-joined', (username) => {
    const repeatedUsername = connectedUsers.find(user => user.username == username);
    if (repeatedUsername) {
      socket.emit('nickname-in-use');
      return false;
    };

    const user = {
      id: socket.id,
      username,
    };

    connectedUsers.push(user);
    onlineUsers ++;
    socket.broadcast.emit('connected-users', connectedUsers, onlineUsers);
  });

  socket.on('send-message', (data) => {
    console.log(`[LOG] User ${data.username} sent: ${data.message}`);
    socket.broadcast.emit('render-message', data);
  });

  socket.on('request-online-users', () => {
    socket.emit('connected-users', connectedUsers, onlineUsers);
  });
});

app.get('/', (req, res) => {
  return res.sendFile(resolve(__dirname, 'index.html'));
});

server.listen(3000);