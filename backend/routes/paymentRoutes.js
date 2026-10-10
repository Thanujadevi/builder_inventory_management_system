const express = require('express');
const router = express.Router();
const { authenticateUser, requireBuilder } = require('../middleware/authMiddleware');
const { recordPayment, getPaymentsByPO } = require('../controllers/paymentController');

router.use(authenticateUser);

router.get('/po/:poId', getPaymentsByPO);
router.post('/', requireBuilder, recordPayment);

module.exports = router;
