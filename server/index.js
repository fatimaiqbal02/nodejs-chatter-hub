const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
    }
});


const users = {};

io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    socket.on('new-user-joined', (name) => {
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
        io.emit('active-users', Object.values(users));
    });

    socket.on('send', (message) => {
        socket.broadcast.emit('receive', { message, name: users[socket.id] });
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];
        io.emit('active-users', Object.values(users));
    });

    socket.on('request-active-users', () => {
        socket.emit('active-users', Object.values(users));
    });
});

// This exports the server as a module
module.exports = server;
