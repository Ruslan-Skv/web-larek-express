import { NextFunction, Request, Response } from 'express';
import NotFoundError from '../errors/not-found-error';

// eslint-disable-next-line import/prefer-default-export
export const notFoundHandler = (
  _req: Request,
  _res: Response,
  next: NextFunction,
) => {
  next(new NotFoundError('Маршрут не найден'));
};
