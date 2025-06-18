import bcrypt from 'bcryptjs';
import User, {IUser} from '../models/user';
import { Request, Response, NextFunction } from 'express';
import ConflictError from '../errors/conflict-error';
import BadRequestError from '../errors/bad-request-error';
import NotFoundError from '../errors/not-found-error';
import UnauthorizedError from '../errors/unauthorized-error';
import jwt from 'jsonwebtoken';
import ms from 'ms';

interface CookieOptions {
  httpOnly: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  secure: boolean;
  maxAge: number;
  path: string;
}

interface TokenPayload {
  _id: string;
}

// Регистрация пользователя
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    // Валидация email и пароля
    if (!email || !password) {
      throw new BadRequestError('Email и пароль обязательны');
    }

    // Проверка на существующего пользователя
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('Пользователь с таким email уже существует');
    }

    // Хеширование пароля
    const hash = await bcrypt.hash(password, 10);

    // Создание пользователя
    const user = await User.create({
      name,
      email,
      password: hash,
      tokens: []
    });

    // Генерация токенов
    const accessToken = jwt.sign(
      { _id: user._id },
      process.env.JWT_ACCESS_SECRET || 'some-secret-access-key',
      { expiresIn: '10m' }
    );

    const refreshToken = jwt.sign(
      { _id: user._id },
      process.env.JWT_REFRESH_SECRET || 'some-secret-refresh-key',
      { expiresIn: '7d' }
    );

    // Сохранение refresh токена в базе
    await User.findByIdAndUpdate(user._id, {
      $push: { tokens: { token: refreshToken } }
    });

    // Настройки куки
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: ms('7d'),
      path: '/',
    };

    // Установка куки
    res.cookie('refreshToken', refreshToken, cookieOptions);

    // Формирование ответа
    res.status(201).json({
      user: {
        email: user.email,
        name: user.name
      },
      success: true,
      accessToken
    });

  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError') {
      next(new BadRequestError('Некорректные данные пользователя'));
    } else {
      next(error);
    }
  }
};

// Аутентификация пользователя
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    
    const user: IUser = await User.findUserByCredentials(email, password);

    // Генерация токенов
    const accessToken = jwt.sign(
      { _id: user._id },
      process.env.JWT_ACCESS_SECRET || 'some-secret-access-key',
      { expiresIn: '10m' }
    );

    const refreshToken = jwt.sign(
      { _id: user._id },
      process.env.JWT_REFRESH_SECRET || 'some-secret-refresh-key',
      { expiresIn: '7d' }
    );

    // Сохранение refresh токена в базе
    await User.findByIdAndUpdate(user._id, {
      $push: { tokens: { token: refreshToken } }
    });


    const cookieOptions: CookieOptions = {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: ms('7d'),
      path: '/',
    };

    res.cookie('refreshToken', refreshToken, cookieOptions);


    res.status(200).json({
      user: {
        email: user.email,
        name: user.name
      },
      success: true,
      accessToken
    });

  } catch (error) {
    next(error);
  }
};

// Получение текущего пользователя
export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Требуется авторизация');
    }

    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'some-secret-access-key') as TokenPayload;
    const user = await User.findById(payload._id).select('-password -tokens');

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    res.status(200).json({
      user: {
        email: user.email,
        name: user.name
      },
      success: true
    });

  } catch (error) {
    next(error);
  }
};

// Выход из системы
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      throw new BadRequestError('Требуется refresh токен');
    }

    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'some-secret-refresh-key') as TokenPayload;

    // Удаление токена из базы
    const user = await User.findByIdAndUpdate(
      payload._id,
      { $pull: { tokens: { token: refreshToken } } },
      { new: true }
    );

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    // Очистка куки
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Выход выполнен успешно'
    });

  } catch (error) {
    next(error);
  }
};

// Обновление access токена
export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      throw new UnauthorizedError('Требуется refresh токен');
    }

    // Верификация токена
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'some-secret-refresh-key') as TokenPayload;

    // Проверка наличия токена в базе
    const user = await User.findOne({
      _id: payload._id,
      'tokens.token': refreshToken
    });

    if (!user) {
      throw new UnauthorizedError('Недействительный refresh токен');
    }

    // Генерация новых токенов
    const newAccessToken = jwt.sign(
      { _id: user._id },
      process.env.JWT_ACCESS_SECRET || 'some-secret-access-key',
      { expiresIn: '10m' }
    );

    const newRefreshToken = jwt.sign(
      { _id: user._id },
      process.env.JWT_REFRESH_SECRET || 'some-secret-refresh-key',
      { expiresIn: '7d' }
    );

    // Обновление токенов в базе
    await User.findByIdAndUpdate(user._id, {
      $pull: { tokens: { token: refreshToken } },
      $push: { tokens: { token: newRefreshToken } }
    });

    // Настройки куки
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: ms('7d'),
      path: '/',
    };

    // Установка новой куки
    res.cookie('refreshToken', newRefreshToken, cookieOptions);

    // Формирование ответа
    res.status(200).json({
      user: {
        email: user.email,
        name: user.name
      },
      success: true,
      accessToken: newAccessToken
    });

  } catch (error) {
    next(error);
  }
};

//Получаем текущего пользователя
// export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     // req.user должен быть установлен в middleware аутентификации
//     const user = await User.findById(req.user._id).select('-password -tokens');
//     if (!user) {
//       throw new NotFoundError('Пользователь не найден');
//     }
//     res.send(user);
//   } catch (error) {
//     next(error);
//   }
// };

// export const updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { name, email } = req.body;

//     const user = await User.findByIdAndUpdate(
//       req.user._id,
//       { name, email },
//       { new: true, runValidators: true }
//     ).select('-password -tokens');

//     if (!user) {
//       throw new NotFoundError('Пользователь не найден');
//     }

//     res.send(user);
//   } catch (error) {
//     if (error instanceof Error && error.name === 'ValidationError') {
//       next(new BadRequestError('Некорректные данные для обновления'));
//     } else if (error.code === 11000) {
//       next(new ConflictError('Пользователь с таким email уже существует'));
//     } else {
//       next(error);
//     }
//   }
// };