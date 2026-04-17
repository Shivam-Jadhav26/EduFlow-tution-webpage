const express = require('express');
const { protect } = require('../middlewares/auth');
const { generateQuestions, askDoubt, getRecommendations } = require('../controllers/aiController');

const router = express.Router();

router.use(protect);
router.post('/generate-questions', generateQuestions);
router.post('/ask-doubt', askDoubt);
router.post('/recommendations', getRecommendations);

module.exports = router;
