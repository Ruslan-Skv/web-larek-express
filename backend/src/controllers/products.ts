import { Request, Response, NextFunction } from "express";
import Product from "../models/product";
import BadRequestError from "../errors/bad-request-error";
import ConflictError from "../errors/conflict-error";

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
  ) => {
  try {
    const products = await Product.find({});
    res.json({
      total: products.length,
      items: products
    });
  } catch (err) {
    next(err); // Передаем ошибку в централизованный обработчик
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { description, image, title, category, price } = req.body;

    // Валидация обязательных полей
    if (!title || !description || !category || !price || !image ) {
      throw new BadRequestError('Переданы некорректные данные в методы создания товара');
    }

    // Проверка на существующий товар
    const existingProduct = await Product.findOne({ title });
    if (existingProduct) {
      throw new ConflictError('Ошибка при создании товара с уже существующим полем title');
    }

    const product = await Product.create({
      description,
      image: {
        filename: image.fileName,
        originalName: image.originalName
      },
      title,
      category,
      price: price ?? null
    });

    res.status(201).send({ data: product });
  } catch (err) {
    next(err); // Передаем ошибку в централизованный обработчик
  }
};
