const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware.protect, sessionController.createSession);
router.get('/', authMiddleware.protect, sessionController.getSessions);
router.get('/:id', authMiddleware.protect, sessionController.getSession);
router.put('/:id', authMiddleware.protect, sessionController.updateSession);
router.delete('/:id', authMiddleware.protect, sessionController.deleteSession);

module.exports = router;