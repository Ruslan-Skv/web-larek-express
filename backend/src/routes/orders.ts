import { validateOrderCreation } from '../middlewares/validatons';
import { createOrder } from '../controllers/orders';
import { Router } from 'express';

const router = Router();

router.post('/', validateOrderCreation, createOrder);

export default router;