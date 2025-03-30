import express from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  getGamesController,
  addGameController,
  updateGameController,
  deleteGameController,
  getGameByIdController, // Контроллер для получения игры по ID
} from '../controllers/game.js';

const router = express.Router();

router.get('/', ctrlWrapper(getGamesController));
router.get('/:id', ctrlWrapper(getGameByIdController)); // Новый маршрут для получения игры по ID
router.post('/', ctrlWrapper(addGameController));
router.put('/:id', ctrlWrapper(updateGameController)); // Для обновления игры
router.patch('/:id', ctrlWrapper(updateGameController));
router.delete('/:id', ctrlWrapper(deleteGameController));

export default router;
