const io = require('socket.io')(8000, {
    cors: {
        origin: "*"
    }
});

const users = {};

io.on('connection', socket => {
    
    socket.on('new-user-joined', name => {
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
        io.emit('active-users', Object.values(users)); // Send active users list
    });

    socket.on('send', message => {
        socket.broadcast.emit('receive', { message: message, name: users[socket.id] });
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];
        io.emit('active-users', Object.values(users)); // Send updated active users list
    });

    socket.on('request-active-users', () => {
        socket.emit('active-users', Object.values(users));
    });
});
