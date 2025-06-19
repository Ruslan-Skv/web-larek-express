import { NextFunction, Request, Response } from 'express';
import NotFoundError from '../errors/not-found-error';

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  next(new NotFoundError('Маршрут не найден'));
};