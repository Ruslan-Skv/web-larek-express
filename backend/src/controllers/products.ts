import { Request, Response } from 'express';
import Product from '../models/product';


export const getProducts = (req: Request, res: Response) => {

  return Product.find({})
    .then((products) => res.json({
        total: products.length,
        items: products
        }))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));

};


export const createProduct = (req: Request, res: Response) => {
  const {
     description,
     image,
     title,
     category,
     price
  }  = req.body;

  return Product.create({
     description,
     image: {
        filename: image.fileName,    // Приводим к названиям из модели
        originalName: image.originalName
     },
     title,
     category,
     price: price ?? null
  })
    .then(product => res.send({ data: product }))
    .catch(err => res.status(500).send({ message: 'Внутренняя ошибка сервера' }));
};