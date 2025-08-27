import { errorHandler } from '../middlewares/error-handler';
import { createProduct, getProducts } from '../controllers/products';
import { Router } from 'express';
import { validateProductBody } from '../middlewares/validatons';
import { celebrate } from 'celebrate';
import auth from '../middlewares/auth';

const router = Router();

router.get('/',  getProducts);
router.post(
  '/',
  auth,
  validateProductBody,
  createProduct
);

router.use(errorHandler);

export default router;