import { Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';

// eslint-disable-next-line import/prefer-default-export
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
// eslint-disable-next-line consistent-return
) => {
  // Обработка ошибок celebrate/JOI (валидация)
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Ошибка валидации данных  при создании товара',
    });
  }

  // Ошибки Mongoose
  if (err instanceof MongooseError.ValidationError) {
    return res.status(400).json({
      message: 'Ошибка валидации данных  при создании товара',
    });
  }

  // Ошибка дубликата уникального поля
  if (err instanceof Error && err.message.includes('E11000')) {
    return res.status(409).json({
      message: 'Ошибка при создании товара с уже существующим полем title',
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
  res.status(500).json({ message: 'Ошибка по умолчанию' });
};
