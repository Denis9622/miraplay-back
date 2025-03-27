
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import User from '../models/user.js'; // Импорт модели пользователя
import Session from '../models/session.js'; // Импорт модели сессии
import { env } from './../env.js';


// Сервис для регистрации пользователя
export async function registerUser({ name, email, password }) {
  // Проверка, существует ли пользователь с таким email
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw createHttpError(409, 'Email is already in use'); // Ошибка 409, если email уже зарегистрирован
  }

  // Проверяем, что передан пароль и он не пустой
  if (!password || password.trim() === '') {
    throw createHttpError(400, 'Password is required'); // Ошибка 400, если пароль отсутствует
  }

  // Логируем перед хешированием, чтобы убедиться, что пароль передается корректно
  console.log('Password before hashing:', password);

  // Указываем количество раундов соли для bcrypt
  const saltRounds = 10;

  try {
    // Хеширование пароля перед сохранением
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Создание нового пользователя
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword, // Сохраняем хешированный пароль
    });

    // Логируем успешное создание пользователя
    console.log('New user created:', newUser);

    // Генерация access и refresh токенов для нового пользователя
    const accessToken = jwt.sign(
      { userId: newUser._id },
      env('ACCESS_TOKEN_SECRET'),
      { expiresIn: '15m' } // Токен действует 15 минут
    );

    const refreshToken = jwt.sign(
      { userId: newUser._id },
      env('REFRESH_TOKEN_SECRET'),
      { expiresIn: '30d' } // Refresh токен действует 30 дней
    );

    // Создание сессии для нового пользователя
    await Session.create({
      userId: newUser._id,
      accessToken,
      refreshToken,
      accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000), // 15 минут
      refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 дней
    });

    // Возвращаем токены и информацию о созданном пользователе
    return {
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role, // Если у пользователя есть роль
      },
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.error('Error hashing password:', error); // Логируем ошибку
    throw createHttpError(500, 'Error creating user'); // Генерируем 500 ошибку
  }
}



// Сервис для логина пользователя
export async function loginUser({ email, password }) {
  // Ищем пользователя по email
  const user = await User.findOne({ email });
  if (!user) {
    throw createHttpError(401, 'Invalid email or password'); // Ошибка 401, если email не найден
  }

  // Проверяем пароль
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw createHttpError(401, 'Invalid email or password'); // Ошибка 401, если пароль неверный
  }

  // Генерируем access и refresh токены
  const accessToken = jwt.sign(
    { userId: user._id },
    env('ACCESS_TOKEN_SECRET'), // Используем env для секретного ключа
    { expiresIn: '15m' }, // Время жизни access токена — 15 минут
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    env('REFRESH_TOKEN_SECRET'), // Используем env для секретного ключа
    { expiresIn: '30d' }, // Время жизни refresh токена — 30 дней
  );

  // Удаляем старую сессию (если есть)
  await Session.findOneAndDelete({ userId: user._id });

  // Создаем новую сессию
  await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000), // 15 минут
    refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 дней
  });

  return { accessToken, refreshToken }; // Возвращаем токены
}

// Сервис для обновления сессии по refresh токену
export async function refreshSession(refreshToken) {
  try {
    // Проверяем валидность refresh токена
    const decoded = jwt.verify(refreshToken, env('REFRESH_TOKEN_SECRET'));

    // Ищем пользователя по ID
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw createHttpError(401, 'User not found');
    }

    // Удаляем старую сессию
    await Session.findOneAndDelete({ userId: user._id, refreshToken });

    // Генерируем новые access и refresh токены
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Создаем новую сессию
    await Session.create({
      userId: user._id,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000), // 15 минут
      refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 дней
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken }; // Возвращаем новые токены
  } catch (error) {
    console.error('Error during session refresh:', error.message); // Логируем сообщение об ошибке
    throw createHttpError(401, 'Invalid refresh token'); // Ошибка 401 при невалидном токене
  }
}

// Вспомогательная функция для генерации access токена
function generateAccessToken(userId) {
  return jwt.sign({ userId }, env('ACCESS_TOKEN_SECRET'), {
    expiresIn: '15m', // Время жизни access токена — 15 минут
  });
}

// Вспомогательная функция для генерации refresh токена
function generateRefreshToken(userId) {
  return jwt.sign({ userId }, env('REFRESH_TOKEN_SECRET'), {
    expiresIn: '30d', // Время жизни refresh токена — 30 дней
  });
}

// Сервис для логаута пользователя
export async function logoutUser(refreshToken) {
  try {
    // Проверяем валидность refresh токена
    const decoded = jwt.verify(refreshToken, env('REFRESH_TOKEN_SECRET'));

    // Удаляем сессию на основе userId и refreshToken
    const session = await Session.findOneAndDelete({
      userId: decoded.userId,
      refreshToken,
    });

    if (!session) {
      throw createHttpError(404, 'Session not found'); // Ошибка 404, если сессия не найдена
    }
  } catch (error) {
    console.error('Error during logout:', error.message); // Логирование ошибки
    throw createHttpError(401, 'Invalid token or session'); // Ошибка 401 при неверном токене или отсутствии сессии
  }
}

