import { celebrate, Joi } from 'celebrate';

export const validateProductBody = celebrate({
  body: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    category: Joi.string().required(),
    price: Joi.number().allow(null),
    image: Joi.object({
      fileName: Joi.string(),
      originalName: Joi.string()
    }).optional()
  })
})

export const validateOrderCreation = celebrate({
  body: Joi.object({
    payment: Joi.string().valid('card', 'online').required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    total: Joi.number().required(),
    items: Joi.array().items(Joi.string()).min(1).required(),
  }),
});

export const validateUserData = celebrate({
  body: Joi.object({
    name: Joi.string().min(2).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6)
  })
});