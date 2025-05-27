const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/me', authMiddleware.protect, authController.getMe);
router.put('/profile', authMiddleware.protect, authController.updateProfile);
router.post('/logout', authMiddleware.protect, authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;