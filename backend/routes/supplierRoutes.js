const express = require('express');
const router = express.Router();
const { authenticateUser, requireSupplier } = require('../middleware/authMiddleware');
const {
  getProfile,
  getSupplierProducts,
  addSupplierProduct,
  updateSupplierProduct
} = require('../controllers/supplierController');

router.use(authenticateUser, requireSupplier);

router.get('/profile', getProfile);
router.get('/products', getSupplierProducts);
router.post('/products', addSupplierProduct);
router.put('/products/:id', updateSupplierProduct);

module.exports = router;
