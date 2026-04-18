import express from 'express';
import * as authController from '../controllers/authController.js';
import * as authValidation from '../validations/authValidation.js';
import validate from '../middlewares/validateMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post(
  '/register',
  authValidation.registerSchema,
  validate,
  authController.register
);

router.post(
  '/login',
  authValidation.loginSchema,
  validate,
  authController.login
);

router.get('/me', protect, authController.getMe);

export default router;
