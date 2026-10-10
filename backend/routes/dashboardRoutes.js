const express = require('express');
const router = express.Router();
const { authenticateUser, requireAdmin, requireBuilder, requireSupplier } = require('../middleware/authMiddleware');
const { getAdminDashboard, getBuilderDashboard, getSupplierDashboard } = require('../controllers/dashboardController');

router.get('/admin', authenticateUser, requireAdmin, getAdminDashboard);
router.get('/builder', authenticateUser, requireBuilder, getBuilderDashboard);
router.get('/supplier', authenticateUser, requireSupplier, getSupplierDashboard);

module.exports = router;
