const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    default: null
  },
  flashcardIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flashcard'
  }],
  noteIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note'
  }],
  startTime: {
    type: Date,
    required: [true, 'Start time is required'],
    validate: {
      validator: function (value) {
        return value <= new Date();
      },
      message: 'Start time cannot be in the future'
    }
  },
  endTime: {
    type: Date,
    default: null,
    validate: {
      validator: function (value) {
        return !value || (this.startTime && value >= this.startTime);
      },
      message: 'End time must be after start time'
    }
  },
  duration: {
    type: Number,
    default: null,
    min: [0, 'Duration cannot be negative'],
    max: [1440, 'Duration cannot exceed 24 hours']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Session', sessionSchema);