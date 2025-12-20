const express = require('express');
const { register, login, getProfile } = require('../controllers/auth-controller');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authMiddleware, getProfile);

module.exports = router;
