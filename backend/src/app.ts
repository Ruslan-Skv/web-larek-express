import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import productRouter from './routes/products';
import orderRouter from './routes/orders';
import { errorHandler } from './middlewares/error-handler';
import { errorLogger, requestLogger } from './middlewares/logger';
import userRouter from './routes/user';
import 'dotenv/config';
import { notFoundHandler } from './middlewares/not-found-handler';
import cookieParser from 'cookie-parser';

const { PORT = 3000 } = process.env;
const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(requestLogger);

const publicPath = path.join(__dirname, './public');
app.use('/images', express.static(path.join(publicPath, 'images')));

mongoose.connect('mongodb://127.0.0.1:27017/weblarek');

app.use('/product', productRouter);
app.use('/order', orderRouter);
app.use('/auth', userRouter);

app.use(errorLogger);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
