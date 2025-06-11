const Task = require('../models/Task');
const { validationResult } = require('express-validator');

exports.createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, dueDate, priority, category, linkedNote, linkedFlashcardSet, notes, reminder } = req.body;
    const task = new Task({
      userId: req.user.id,
      title,
      dueDate,
      priority,
      category,
      linkedNote,
      linkedFlashcardSet,
      notes,
      reminder
    });

    await task.save();
    res.status(201).json({ task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { status, category, dueBefore } = req.query;
    const query = { userId: req.user.id };
    if (status) query.status = status;
    if (category) query.category = category;
    if (dueBefore) query.dueDate = { $lte: new Date(dueBefore) };

    const tasks = await Task.find(query)
      .populate('linkedNote', 'title')
      .populate('linkedFlashcardSet', 'title')
      .sort({ dueDate: 1 });

    res.status(200).json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { title, dueDate, priority, category, linkedNote, linkedFlashcardSet, notes, reminder, status } = req.body;
    if (title) task.title = title;
    if (dueDate) task.dueDate = dueDate;
    if (priority) task.priority = priority;
    if (category) task.category = category;
    if (linkedNote) task.linkedNote = linkedNote;
    if (linkedFlashcardSet) task.linkedFlashcardSet = linkedFlashcardSet;
    if (notes) task.notes = notes;
    if (reminder !== undefined) task.reminder = reminder;
    if (status) task.status = status;

    await task.save();
    res.status(200).json({ task });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};