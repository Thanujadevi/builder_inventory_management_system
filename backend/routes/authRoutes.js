const express = require('express');
const router = express.Router();
const { login, registerBuilder, registerSupplier, getMe } = require('../controllers/authController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/register-builder', registerBuilder);
router.post('/register-supplier', registerSupplier);
router.get('/me', authenticateUser, getMe);

module.exports = router;
