const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const { check } = require('express-validator');


router.post('/', authMiddleware.protect, [
  check('title', 'Title is required').not().isEmpty()
], taskController.createTask);

router.get('/', authMiddleware.protect, taskController.getTasks);
router.put('/:id', authMiddleware.protect, taskController.updateTask);
router.delete('/:id', authMiddleware.protect, taskController.deleteTask);

module.exports = router;