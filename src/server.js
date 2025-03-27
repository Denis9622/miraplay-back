import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import authRouter from './routers/auth.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import cookieParser from 'cookie-parser';

export function setupServer() {
  const app = express();

  app.use(cookieParser());
  app.use(cors());
  app.use(pino());
  app.use(express.json());





  // Маршрут для аутентификации (например, /auth/login и /auth/register)
  app.use('/auth', authRouter); // Добавлен роутер для аутентификации

  // Middleware для обработки несуществующих маршрутов
  app.use(notFoundHandler);

  // Middleware для обработки ошибок
  app.use(errorHandler);


  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
