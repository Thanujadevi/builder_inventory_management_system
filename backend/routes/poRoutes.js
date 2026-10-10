const express = require('express');
const router = express.Router();
const { authenticateUser, requireBuilder } = require('../middleware/authMiddleware');
const { createPurchaseOrder, getPurchaseOrders, updatePOStatus } = require('../controllers/poController');

router.use(authenticateUser);

router.get('/', getPurchaseOrders);
router.post('/', requireBuilder, createPurchaseOrder);
router.put('/:id/status', updatePOStatus);

module.exports = router;
