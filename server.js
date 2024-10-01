const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public')); // Giả sử tệp HTML và JS ở thư mục 'public'

io.on('connection', (socket) => {
    console.log('Một người dùng mới kết nối');

    // Nhận nước đi từ client
    socket.on('playMove', (data) => {
        // Phát lại nước đi cho tất cả client
        socket.broadcast.emit('updateBoard', data);
    });

    socket.on('disconnect', () => {
        console.log('Người dùng đã ngắt kết nối');
    });
});

server.listen(3004, () => {
    console.log('Server đang chạy trên http://localhost:3004');
});
