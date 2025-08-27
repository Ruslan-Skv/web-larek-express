import { Router } from 'express';
import { validateUserData } from '../middlewares/validatons';
import { register, login, getCurrentUser, logout, refreshAccessToken } from '../controllers/auth';

const router = Router();

router.post('/register', validateUserData, register);  // регистрация пользователя
router.post('/login', validateUserData, login);  // аутентификация пользователя
router.get('/token', refreshAccessToken);  //выпуск новой пары access- и refresh-токенов, получает httpOnly-куку c именем refreshToken
router.get('/logout', logout);  //выход пользователя
router.get('/user', getCurrentUser); //получение информации о текущем пользователе

export default router;