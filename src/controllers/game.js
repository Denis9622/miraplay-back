import Game from '../models/game.js';
import createHttpError from 'http-errors';

import axios from 'axios';



export async function getGamesController(req, res) {
  try {
    const { genre, page = 1, limit = 9, search } = req.query;

    // Создаем базовый фильтр
    let filter = {};

    // Добавляем фильтр по жанру, если он указан и не равен 'ALL'
    if (genre && genre !== 'ALL') {
      filter.genre = genre;
    }

    // Добавляем поиск по названию, если указан search
    if (search) {
      filter.commonGameName = { $regex: search, $options: 'i' };
    }

    // Получаем общее количество игр для пагинации
    const totalGamesCount = await Game.countDocuments(filter);

    // Получаем игры из БД с применением фильтров и пагинации
    const gamesFromDB = await Game.find(filter)
      .sort({ createdAt: -1 }) // Сортировка по дате создания (новые первыми)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    try {
      // Получаем игры из API
      const response = await axios.get('https://api-test.miraplay.cloud/games');
      const gamesFromAPI = response.data;

      // Фильтруем игры из API по тем же критериям
      let filteredAPIGames = gamesFromAPI;

      if (genre && genre !== 'ALL') {
        filteredAPIGames = filteredAPIGames.filter(
          (game) => game.genre === genre,
        );
      }

      if (search) {
        filteredAPIGames = filteredAPIGames.filter((game) =>
          game.commonGameName.toLowerCase().includes(search.toLowerCase()),
        );
      }

      // Применяем пагинацию к объединенным данным
      const combinedGames = [...gamesFromDB, ...filteredAPIGames];
      const totalGames = combinedGames.length;
      const totalPages = Math.ceil(totalGames / limit);

      // Получаем только нужную страницу из объединенных данных
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + Number(limit);
      const paginatedGames = combinedGames.slice(startIndex, endIndex);

      res.json({
        status: 200,
        message: 'Games retrieved successfully',
        data: {
          games: paginatedGames,
          totalPages,
          currentPage: Number(page),
          totalGames,
        },
      });
    } catch (apiError) {
      // Если API недоступен, возвращаем только игры из БД
      console.error('API Error:', apiError);

      res.json({
        status: 200,
        message: 'Games retrieved from database only',
        data: {
          games: gamesFromDB,
          totalPages: Math.ceil(totalGamesCount / limit),
          currentPage: Number(page),
          totalGames: totalGamesCount,
        },
      });
    }
  } catch (error) {
    console.error('Error getting games:', error);
    throw createHttpError(500, 'Server error while getting games');
  }
}

export async function addGameController(req, res) {
  try {
    const { systemGameName, commonGameName, genre, releaseDate, inTop } =
      req.body;
    const newGame = await Game.create({
      systemGameName,
      commonGameName,
      genre,
      releaseDate,
      inTop,
    });
    res.status(201).json({
      status: 201,
      message: 'Game added successfully',
      data: newGame,
    });
  } catch (error) {
    console.error('Error adding game:', error);
    res.status(500).json({
      status: 500,
      message: error.message,
      data: null,
    });
  }
}

export async function updateGameController(req, res) {
  const { id } = req.params;
  const updatedGame = await Game.findByIdAndUpdate(id, req.body, { new: true });
  if (!updatedGame) {
    throw createHttpError(404, 'Game not found');
  }
  res.json({
    status: 200,
    message: 'Game updated successfully',
    data: updatedGame,
  });
}

export async function deleteGameController(req, res) {
  const { id } = req.params;
  const deletedGame = await Game.findByIdAndDelete(id);
  if (!deletedGame) {
    throw createHttpError(404, 'Game not found');
  }
  res.status(204).send();
}


export const getGameByIdController = async (req, res) => {
  const { id } = req.params;

  try {
    const game = await Game.findById(id);

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.json(game);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};