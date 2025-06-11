const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/', authMiddleware.protect, notificationController.getNotifications);
router.patch('/:id/read', authMiddleware.protect, notificationController.markNotificationRead);

module.exports = router;
