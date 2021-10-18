const express = require('express');
const socketio = require('socket.io');
const debug = require('debug')('app');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index');
});

const server = app.listen(process.env.PORT | 3000, () => {
    debug('server is running');
});

//initialize socket for the server
const io = socketio(server);
let connectedUsers = [],
    sessionHistory;

io.on('connection', socket => {
    debug("New user connected");

    socket.on('receive_nickname', data => {
        socket.username = data.nickname;
        connectedUsers.push(socket.username);
        io.sockets.emit('users_connected', {users: connectedUsers});
    });

    socket.on('change_username', data => {
        for (let i = 0; i < connectedUsers.length; i++) {
            connectedUsers[i] == data.oldUsername ? connectedUsers[i] = data.username : connectedUsers[i];
        };
        socket.username = data.username;
        io.sockets.emit('users_connected', {users: connectedUsers});
    });

    // handle connection error showing message on server logs
    socket.on("connect_error", (err) => {
        debug(`connect_error due to ${err.message}`);
    });

    //handle the new message event
    socket.on('new_message', data => {
        io.sockets.emit('receive_message', {message: data.message, username: socket.username});
    });

    socket.on('typing', data => {
        socket.broadcast.emit('typing', {username: socket.username});
    });

    socket.on('disconnect', () => {
        let userToRemove = connectedUsers.indexOf(socket.username);
        if (~userToRemove) connectedUsers.splice(userToRemove, 1);
        sessionHistory = socket.username;
        io.sockets.emit('users_connected', {users: connectedUsers});
    });
});