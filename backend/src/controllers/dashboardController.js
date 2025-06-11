const Note = require('../models/Note');
const Flashcard = require('../models/Flashcard');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch user name
    const user = await User.findById(userId).select('name');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch recent items (notes, flashcards, tasks)
    const recentNotes = await Note.find({ userId })
      .select('title updatedAt')
      .sort({ updatedAt: -1 })
      .limit(3)
      .lean()
      .then(notes => notes.map(note => ({ ...note, type: 'note', id: note._id })));

    const recentFlashcards = await Flashcard.find({ userId })
      .select('title updatedAt')
      .sort({ updatedAt: -1 })
      .limit(3)
      .lean()
      .then(flashcards => flashcards.map(fc => ({ ...fc, type: 'flashcard', id: fc._id })));

    const recentTasks = await Task.find({ userId })
      .select('title updatedAt')
      .sort({ updatedAt: -1 })
      .limit(3)
      .lean()
      .then(tasks => tasks.map(task => ({ ...task, type: 'task', id: task._id })));

    const recentItems = [...recentNotes, ...recentFlashcards, ...recentTasks]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 3);

    // Fetch upcoming tasks
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingTasks = await Task.find({
      userId,
      status: { $in: ['To-Do', 'In Progress'] },
      dueDate: { $gte: now, $lte: nextWeek }
    })
      .select('title dueDate')
      .sort({ dueDate: 1 })
      .limit(3)
      .map(task => ({
        id: task._id,
        title: task.title,
        dueDate: task.dueDate
      }));

    // Fetch notifications
    const notifications = await Notification.find({ userId: userId, read: false })
      .select('message taskId')
      .sort({ createdAt: -1 })
      .limit(2)
      .lean()
      .map(notification => ({
        id: notification._id,
        message: notification.message,
        taskId: notification.taskId,
        read: notification.read
      }));

    res.status(200).json({
      user: { name: user.name },
      recentItems,
      upcomingTasks,
      notifications
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};