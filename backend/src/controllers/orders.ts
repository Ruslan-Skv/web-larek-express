import { Request, Response, NextFunction } from 'express';
import Product from '../models/product';
import { celebrate, Joi } from 'celebrate';
import NotFoundError from '../errors/not-found-error';
import ConflictError from '../errors/conflict-error';
const { faker } = require('@faker-js/faker');

interface ProductType {
  _id: string;
  price: number | null;
}

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items } = req.body;

     // Проверка существования товаров
    const products: ProductType[] = await Product.find({ _id: { $in: items } });
    if (products.length !== items.length) {
      throw new NotFoundError('Один или несколько товаров не найдены');
    }

    // Проверка доступности товаров
    const unavailableProducts = products.filter(p => p.price === null);
    if (unavailableProducts.length > 0) {
      throw new ConflictError('Один или несколько товаров недоступны для заказа');
    }

    // После фильтрации мы знаем, что price не null
    const availableProducts = products as Array<ProductType & { price: number }>;

    // Расчет суммы заказа
    const calculatedTotal = availableProducts.reduce(
      (sum: number, product: { price: number }) => sum + product.price,
      0
    );

    // Генерация ID заказа
    const orderId = faker.string.uuid();

    res.status(201).json({
      id: orderId,
      total: calculatedTotal
    });

  } catch (error) {
    next(error);
  }
};


// export const createOrder = async (req: Request, res: Response) => {
//   const {
//     payment,
//     email,
//     phone,
//     address,
//     total,
//     items
// }   = req.body;

// try {
//     const { payment, email, phone, address, total, items } = req.body;

//     // Валидация обязательных полей
//     if (!payment || !email || !phone || !address || total === undefined || !items) {
//       return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
//     }

//     // Валидация payment
//     if (!['card', 'online'].includes(payment)) {
//       return res.status(400).json({ error: 'Недопустимый метод оплаты' });
//     }

//     // Валидация email
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({ error: 'Некорректный email' });
//     }

//     // Валидация items
//     if (!Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({ error: 'Items должен быть непустым массивом' });
//     }

//     // Проверка существования товаров и их доступности
//     const products: ProductType[] = await Product.find({ _id: { $in: items } });

//     if (products.length !== items.length) {
//       return res.status(400).json({ error: 'Один или несколько товаров не найдены' });
//     }

//     // Проверка, что все товары продаются (price !== null)
//     const unavailableProducts = products.filter(p => p.price === null);
//     if (unavailableProducts.length > 0) {
//       return res.status(400).json({ error: 'Один или несколько товаров недоступны для заказа' });
//     }

//      // После фильтрации мы знаем, что price не null
//     const availableProducts = products as Array<ProductType & { price: number }>;

//     // Расчет суммы заказа
//     const calculatedTotal = availableProducts.reduce(
//       (sum: number, product: { price: number }) => sum + product.price,
//       0
//     );

//     // Генерация ID заказа
//     const orderId = faker.string.uuid();

//     res.status(201).json({
//       id: orderId,
//       total: calculatedTotal
//     });

//   } catch (error) {
//     console.error('Ошибка при создании заказа:', error);
//     res.status(500).json({ error: 'Внутренняя ошибка сервера' });
//   }
// };