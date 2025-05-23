const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware.protect, noteController.createNote);
router.get('/', authMiddleware.protect, noteController.getNotes);
router.get('/:id', authMiddleware.protect, noteController.getNote);
router.put('/:id', authMiddleware.protect, noteController.updateNote);
router.delete('/:id', authMiddleware.protect, noteController.deleteNote);
router.post('/bulk-delete', authMiddleware.protect, noteController.bulkDeleteNotes);

module.exports = router;