const express = require('express');
const { login, register, getMe, updateMe } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);

module.exports = router;
