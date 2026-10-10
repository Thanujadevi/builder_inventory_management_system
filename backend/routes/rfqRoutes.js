const express = require('express');
const router = express.Router();
const { authenticateUser, requireBuilder } = require('../middleware/authMiddleware');
const { createRequirement, getRequirements, getRequirementById } = require('../controllers/rfqController');

router.use(authenticateUser);

router.get('/', getRequirements);
router.get('/:id', getRequirementById);
router.post('/', requireBuilder, createRequirement);

module.exports = router;
