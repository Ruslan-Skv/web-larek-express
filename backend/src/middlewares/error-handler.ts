import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';
import { NextFunction, Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';


export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Обработка ошибок celebrate/JOI (валидация)
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Ошибка валидации данных  при создании товара'
    });
  }

  // Ошибки Mongoose
  if (err instanceof MongooseError.ValidationError) {
    return res.status(400).json({
      message: 'Ошибка валидации данных  при создании товара'
    });
  }

  // Ошибка дубликата уникального поля
  if (err instanceof Error && err.message.includes('E11000')) {
    return res.status(409).json({
      message: 'Ошибка при создании товара с уже существующим полем title'
    });
  }

  // Кастомные ошибки
  if (err instanceof BadRequestError) {
    return res.status(400).json({ message: err.message });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({ message: err.message });
  }

  if (err instanceof ConflictError) {
    return res.status(409).json({ message: err.message });
  }

  // Все остальные ошибки
  console.error(err);
  res.status(500).json({ message: 'Ошибка по умолчанию' });
};

// Middleware для обработки 404
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  next(new NotFoundError('Маршрут не найден'));
};