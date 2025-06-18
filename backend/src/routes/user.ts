import { Router } from 'express';
import { validateUserData } from '../middlewares/validatons';
import { register, login } from '../controllers/auth';

const router = Router();

router.post('/register', validateUserData, register);  // регистрация пользователя
router.post('/login', validateUserData, login);  // аутентификация пользователя
router.get('/token', validateUserData, );  //выпуск новой пары access- и refresh-токенов, получает httpOnly-куку c именем refreshToken
router.get('/logout', validateUserData, );  //выход пользователя
router.get('/user', validateUserData, ); //получение информации о текущем пользователе

export default router;