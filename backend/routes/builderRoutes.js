const express = require('express');
const router = express.Router();
const { authenticateUser, requireBuilder } = require('../middleware/authMiddleware');
const { getProjects, createProject } = require('../controllers/builderController');

router.use(authenticateUser, requireBuilder);

router.get('/projects', getProjects);
router.post('/projects', createProject);

module.exports = router;
