import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import { createServer } from 'http';
import authRouter from './routers/auth.js';
import gameRouter from './routers/game.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import cookieParser from 'cookie-parser';
import { initSocket } from './socket.js';

export function setupServer() {
  const app = express();
  const httpServer = createServer(app);

  // Инициализация Socket.io
  initSocket(httpServer);

  app.use(cookieParser());
  app.use(
    cors({
      origin: [
        'http://localhost:5173',
        'https://miraplay-front.vercel.app',
        'https://miraplay-back.onrender.com',
      ],
      credentials: true,
    }),
  );
  app.use(pino());
  app.use(express.json());

  app.use('/auth', authRouter);
  app.use('/games', gameRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
  });
}
