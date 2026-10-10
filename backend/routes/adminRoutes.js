const express = require('express');
const router = express.Router();
const { authenticateUser, requireAdmin } = require('../middleware/authMiddleware');
const {
  getSuppliers,
  updateSupplierApproval,
  getCategories,
  createCategory,
  getMasterProducts,
  createMasterProduct
} = require('../controllers/adminController');

router.use(authenticateUser, requireAdmin);

router.get('/suppliers', getSuppliers);
router.put('/suppliers/:id/approve', updateSupplierApproval);
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.get('/products', getMasterProducts);
router.post('/products', createMasterProduct);

module.exports = router;
