const express = require('express');
const router = express.Router();
const { authenticateUser, requireSupplier, requireBuilder } = require('../middleware/authMiddleware');
const { 
  getInventoryDashboard,
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  recordStockIn,
  recordStockOut,
  getAllocations,
  createAllocation,
  recordAllocationIssue,
  recordSiteReturn,
  getInventoryReports,
  getProjectInventory,
  getSupplierInventory,
  getInventoryTransactions
} = require('../controllers/inventoryController');

router.use(authenticateUser);

// Dashboard & Analytics
router.get('/dashboard', getInventoryDashboard);
router.get('/reports', getInventoryReports);

// Construction Materials Catalog & Stock
router.get('/materials', getMaterials);
router.post('/materials', createMaterial);
router.put('/materials/:id', updateMaterial);
router.delete('/materials/:id', deleteMaterial);

// Stock In & Stock Out
router.post('/stock-in', recordStockIn);
router.post('/stock-out', recordStockOut);

// Project Allocation & Site Return
router.get('/allocations', getAllocations);
router.post('/allocate', createAllocation);
router.post('/allocations/issue', recordAllocationIssue);
router.post('/allocations/return', recordSiteReturn);

// Legacy/Compatibility endpoints
router.get('/project/:projectId', getProjectInventory);
router.get('/supplier', requireSupplier, getSupplierInventory);
router.get('/transactions', getInventoryTransactions);

module.exports = router;
