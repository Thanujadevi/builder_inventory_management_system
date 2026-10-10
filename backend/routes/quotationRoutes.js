const express = require('express');
const router = express.Router();
const { authenticateUser, requireSupplier } = require('../middleware/authMiddleware');
const { submitQuotation, getQuotationsByRequirement } = require('../controllers/quotationController');

router.use(authenticateUser);

router.get('/requirement/:reqId', getQuotationsByRequirement);
router.post('/', requireSupplier, submitQuotation);

module.exports = router;
