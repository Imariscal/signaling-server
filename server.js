const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors'); // Importar el middleware CORS

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'https://webrtc-app1.vercel.app', // Dominio del frontend 
    methods: ['GET', 'POST'],  
    credentials: true, // Permitir envío de cookies y cabeceras de autorización
  },
  transports: ['websocket']
});

app.use((req, res, next) => {
  console.log('CORS Headers:', res.getHeaders());
  next();
});

app.use(cors({
  origin: 'https://webrtc-app1.vercel.app', // Mismo dominio
  methods: ['GET', 'POST'],
  credentials: true,
}));
 

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('offer', (data) => {
    socket.broadcast.emit('offer', data);
  });

  socket.on('answer', (data) => {
    socket.broadcast.emit('answer', data);
  });

  socket.on('candidate', (data) => {
    socket.broadcast.emit('candidate', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Signaling server running on http://localhost:${port}`);
});