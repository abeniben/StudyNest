const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware.protect, collectionController.createCollection);
router.get('/', authMiddleware.protect, collectionController.getCollections);
router.get('/:id', authMiddleware.protect, collectionController.getCollection);
router.put('/:id', authMiddleware.protect, collectionController.updateCollection);
router.delete('/:id', authMiddleware.protect, collectionController.deleteCollection);

module.exports = router;