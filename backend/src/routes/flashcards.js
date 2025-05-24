const express = require('express');
const router = express.Router();
const flashcardController = require('../controllers/flashcardController');
const authMiddleware = require('../middleware/authMiddleware');


router.post('/', authMiddleware.protect, flashcardController.createFlashcard);
router.get('/', authMiddleware.protect, flashcardController.getFlashcards);
router.get('/:id', authMiddleware.protect, flashcardController.getFlashcard);
router.put('/:id', authMiddleware.protect, flashcardController.updateFlashcard);
router.delete('/:id', authMiddleware.protect, flashcardController.deleteFlashcard);


module.exports = router;