const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors'); // Importar el middleware CORS

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'https://webrtc-app1.vercel.app', // Dominio del frontend 
   // origin: 'https://localhost:4200', // Dominio del frontend 
    origin: '*', // Allow all origins for WebSocket connections
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

  socket.on('endCall', (data) => {
    console.log('Llamada terminada:', data.message);
    socket.broadcast.emit('endCall', { message: 'El usuario terminó la llamada.' });
  });

  console.log('Cliente conectado:', socket.id);

  // Registrar usuario con su userId
  socket.on('register', (userId) => {
    users[userId] = socket.id;
    console.log(`Usuario registrado: ${userId} -> ${socket.id}`);
  });

  // Manejar mensajes privados
  socket.on('private-message', ({ to, message }) => {
    const targetSocketId = users[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('private-message', {
        from: socket.id,
        message,
      });
      console.log(`Mensaje enviado de ${socket.id} a ${targetSocketId}: ${message}`);
    } else {
      console.log(`Usuario no conectado: ${to}`);
    }
  });

  // Manejar desconexión
  socket.on('disconnect', () => {
    for (const [userId, socketId] of Object.entries(users)) {
      if (socketId === socket.id) {
        delete users[userId];
        console.log(`Usuario desconectado: ${userId}`);
        break;
      }
    }
  });

});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Signaling server running on http://localhost:${port}`);
});