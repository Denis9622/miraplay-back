import { Server } from 'socket.io';

let io;
const onlineUsers = new Map();

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:5173', 'https://miraplay-front.vercel.app'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('🔌 [SERVER] Новый клиент подключен:', socket.id);

    socket.on('userLogin', (userData) => {
      onlineUsers.set(socket.id, userData);
      console.log('👤 [SERVER] Новый онлайн-пользователь:', userData);
      io.emit('onlineUsers', Array.from(onlineUsers.values()));
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(socket.id);
      console.log('❌ [SERVER] Клиент отключился:', socket.id);
      io.emit('onlineUsers', Array.from(onlineUsers.values()));
    });

    socket.on('getUserList', () => {
      console.log('📤 [SERVER] Отправляем список пользователей');
      socket.emit('onlineUsers', Array.from(onlineUsers.values()));
    });
  });

  return io;
};

export const emitNewGame = (game) => {
  if (io) {
    io.emit('newGame', {
      game,
      timestamp: new Date(),
      message: `Добавлена новая игра: "${game.commonGameName}"`,
    });
  }
};

export const emitTopGameChange = (game) => {
  if (io) {
    io.emit('topGameChange', game);
  }
};

export const emitPopularGame = (game) => {
  if (io) {
    io.emit('popularGame', {
      game,
      timestamp: new Date(),
      message: `Игра "${game.commonGameName}" стала популярной!`,
    });
  }
};
