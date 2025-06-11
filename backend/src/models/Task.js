const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  dueDate: { type: Date },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['To-Do', 'In Progress', 'Completed'], default: 'To-Do' },
  category: { type: String, trim: true, maxlength: 50 },
  linkedNote: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' },
  linkedFlashcardSet: { type: mongoose.Schema.Types.ObjectId, ref: 'FlashcardSet' },
  notes: { type: String, trim: true, maxlength: 500 },
  reminder: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Task', taskSchema);