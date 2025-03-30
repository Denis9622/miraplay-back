import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema(
  {
    systemGameName: {
      type: String,
      required: true,
    },
    commonGameName: {
      type: String,
      required: true,
    },
    gameDescription: {
      type: String,
    },
    gameLaunchers: {
      type: [String], // Массив строк (Steam, Epic Games и т. д.)
    },
    gameImage: {
      type: String, // Главное изображение игры
    },
    gameClass: {
      type: String, // Например, "STANDART"
    },
    genre: {
      type: String,
      enum: [
        'ALL',
        'FREE',
        'MOBA',
        'SHOOTERS',
        'LAUNCHERS',
        'MMORPG',
        'STRATEGY',
        'FIGHTING',
        'RACING',
        'SURVIVAL',
        'ONLINE',
      ],
      required: [true, 'Genre is required'],
    },
    inTop: {
      type: Boolean,
      default: false,
    },
    releaseDate: {
      type: String, // Оставил строкой, так как в БД у тебя дата в формате "21.08.2012"
      required: true,
    },
    publisher: {
      type: String,
    },
    gameVideoUrl: {
      type: String, // Ссылка на видео
    },
    gameImages: {
      type: [String], // Массив изображений игры
    },
    gameBoxArt: {
      type: String, // Обложка игры
    },
    gameLogo: {
      type: String, // Логотип игры
    },
    gameHero: {
      type: String, // Главное изображение (баннер)
    },
    isLocalGame: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  },
);

const Game = mongoose.model('Game', gameSchema);

export default Game;
