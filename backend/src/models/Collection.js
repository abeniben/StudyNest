const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  name: {
    type: String,
    required: [true, 'Collection name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters'],
    default: ''
  },
  color: {
    type: String,
    trim: true,
    match: [/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code (e.g., #FF0000)'],
    default: '#000000'
  }
}, {
  timestamps: true 
});

module.exports = mongoose.model('Collection', collectionSchema);