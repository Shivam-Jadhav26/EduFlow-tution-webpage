const express = require('express');
const { login, register, getMe, updateMe } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { registerValidation, loginValidation, validate } = require('../validations/authValidation');

const router = express.Router();

router.post('/login', loginValidation, validate, login);
router.post('/register', registerValidation, validate, register);
router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);

module.exports = router;
