import { createOrder } from '../controllers/orders';
import { Router } from 'express';

const router = Router();

router.post('/', createOrder);

export default router;