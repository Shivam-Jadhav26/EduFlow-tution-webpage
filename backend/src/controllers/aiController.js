const { sendSuccess } = require('../utils/response');

const NOT_IMPLEMENTED_MSG = 'This AI feature is a placeholder and will be available in a future update.';

// POST /api/ai/generate-questions
const generateQuestions = (req, res) => {
  return res.status(501).json({
    success: false,
    message: NOT_IMPLEMENTED_MSG,
    placeholder: true,
    hint: 'Integrate with OpenAI API or similar LLM to auto-generate MCQs.',
  });
};

// POST /api/ai/ask-doubt
const askDoubt = (req, res) => {
  const { question } = req.body;
  // Returns a helpful placeholder — real implementation would call an LLM
  return sendSuccess(res, {
    answer: `This is an AI placeholder response for: "${question || 'your question'}". Real AI tutor coming soon!`,
    placeholder: true,
  }, 'AI Tutor placeholder response');
};

// POST /api/ai/recommendations
const getRecommendations = (req, res) => {
  return sendSuccess(res, {
    recommendations: [
      { type: 'High', title: 'Review Recent Test Topics', desc: 'AI analysis coming soon — connect to ML service for real insights.', placeholder: true },
    ],
    placeholder: true,
  });
};

module.exports = { generateQuestions, askDoubt, getRecommendations };
