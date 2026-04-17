const express = require('express');
const { protect, adminOnly } = require('../middlewares/auth');
const { getAnalytics } = require('../controllers/analyticsController');

const router = express.Router();

router.use(protect, adminOnly);
router.get('/', getAnalytics);

module.exports = router;
