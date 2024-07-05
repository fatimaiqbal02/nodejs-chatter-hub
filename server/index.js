const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
path = require('path');


const app = express();
app.use(cors());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://nodejs-chatter-hub-server.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

const server = http.createServer(app);
const io = require("socket.io")(server, {
    handlePreflightRequest: (req, res) => {
        const headers = {
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
            "Access-Control-Allow-Credentials": true
        };
        res.writeHead(200, headers);
        res.end();
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

const port = process.env.PORT || 3000;
http.listen(port, () => console.log(`Listening on port ${port}`));
