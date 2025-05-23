const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    required: [true, 'Collection ID is required']
  },
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true,
    minlength: [1, 'Question cannot be empty'],
    maxlength: [500, 'Question cannot exceed 500 characters']
  },
  answer: {
    type: String,
    required: [true, 'Answer is required'],
    trim: true,
    minlength: [5, 'Answer cannot be empty'],
    maxlength: [1000, 'Answer cannot exceed 1000 characters']
  },
  tags: [{
    type: String,
    trim: true,
    minlength: [1, 'Tag must be at least 1 character'],
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  isStarred: {
    type: Boolean,
    default: false
  },
  lastReviewed: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});


flashcardSchema.index({ question: 'text', answer: 'text', tags: 'text' });

module.exports = mongoose.model('Flashcard', flashcardSchema);