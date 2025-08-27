import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

declare module 'express' {
  interface Request {
    user?: string | JwtPayload;
  }
}

export default (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;
  const { JWT_SECRET = 'some-secret-key' } = process.env;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res
      .status(401)
      .send({ message: 'Необходима авторизация' });
  }

  const token = authorization.replace('Bearer ', '');

  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res
      .status(401)
      .send({ message: 'Необходима авторизация' });
  }

  req.user = payload;

  return next();
};
