import { Request, Response, NextFunction } from 'express';
import Product from '../models/product';
import NotFoundError from '../errors/not-found-error';
import ConflictError from '../errors/conflict-error';

const { faker } = require('@faker-js/faker');

interface ProductType {
  _id: string;
  price: number | null;
}

// eslint-disable-next-line import/prefer-default-export
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items } = req.body;

    // Проверка существования товаров
    const products: ProductType[] = await Product.find({ _id: { $in: items } });
    if (products.length !== items.length) {
      throw new NotFoundError('Один или несколько товаров не найдены');
    }

    // Проверка доступности товаров
    const unavailableProducts = products.filter((p) => p.price === null);
    if (unavailableProducts.length > 0) {
      throw new ConflictError('Один или несколько товаров недоступны для заказа');
    }

    // После фильтрации мы знаем, что price не null
    const availableProducts = products as Array<ProductType & { price: number }>;

    // Расчет суммы заказа
    const calculatedTotal = availableProducts.reduce(
      (sum: number, product: { price: number }) => sum + product.price,
      0,
    );

    // Генерация ID заказа
    const orderId = faker.string.uuid();

    res.status(201).json({
      id: orderId,
      total: calculatedTotal,
    });
  } catch (error) {
    next(error);
  }
};
