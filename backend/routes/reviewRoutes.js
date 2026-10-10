const express = require('express');
const router = express.Router();
const { authenticateUser, requireBuilder } = require('../middleware/authMiddleware');
const { submitReview, getSupplierReviews } = require('../controllers/reviewController');

router.use(authenticateUser);

router.get('/supplier/:supplierId', getSupplierReviews);
router.post('/', requireBuilder, submitReview);

module.exports = router;
