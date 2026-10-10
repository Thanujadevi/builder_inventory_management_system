const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authMiddleware');
const { calculateRFQRecommendation } = require('../services/recommendationService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

router.use(authenticateUser);

// GET /api/recommendations/requirement/:reqId
router.get('/requirement/:reqId', async (req, res) => {
  try {
    const reqId = req.params.reqId;
    const recommendationResult = await calculateRFQRecommendation(reqId);
    return sendSuccess(res, 'Smart supplier recommendation calculated successfully', recommendationResult);
  } catch (error) {
    return sendError(res, 'Failed to calculate supplier recommendation', error.message, 500);
  }
});

module.exports = router;
