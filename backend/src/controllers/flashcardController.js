const Flashcard = require('../models/Flashcard');
const Collection = require('../models/Collection');

exports.createFlashcard = async (req, res) => {
  try {
    const { collectionId, question, answer, tags, isStarred, lastReviewed } = req.body;
    const userId = req.user._id;

    // Verify collection exists and belongs to user
    const collection = await Collection.findOne({ _id: collectionId, userId });
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found or not authorized' });
    }

    const flashcard = new Flashcard({ userId, collectionId, question, answer, tags, isStarred, lastReviewed });
    await flashcard.save();

    res.status(201).json({
      message: 'Flashcard created successfully',
      flashcard: {
        id: flashcard._id,
        collectionId: flashcard.collectionId,
        question: flashcard.question,
        answer: flashcard.answer,
        tags: flashcard.tags,
        isStarred: flashcard.isStarred,
        lastReviewed: flashcard.lastReviewed,
        createdAt: flashcard.createdAt,
        updatedAt: flashcard.updatedAt
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Invalid input', errors: messages });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid collection ID' });
    }
    res.status(500).json({ message: 'Failed to create flashcard', error: error.message });
  }
};

exports.getFlashcards = async (req, res) => {
  try {
    const { collectionId } = req.query;
    if (!collectionId) {
      return res.status(400).json({ message: 'Collection ID is required' });
    }

    const collection = await Collection.findOne({ _id: collectionId, userId: req.user._id });
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found or not authorized' });
    }

    const flashcards = await Flashcard.find({ userId: req.user._id, collectionId });
    res.status(200).json({
      message: 'Flashcards retrieved successfully',
      flashcards: flashcards.map(f => ({
        id: f._id,
        collectionId: f.collectionId,
        question: f.question,
        answer: f.answer,
        tags: f.tags,
        isStarred: f.isStarred,
        lastReviewed: f.lastReviewed,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt
      }))
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid collection ID' });
    }
    res.status(500).json({ message: 'Failed to retrieve flashcards', error: error.message });
  }
};

exports.getFlashcard = async (req, res) => {
  try {
    const flashcard = await Flashcard.findOne({ _id: req.params.id, userId: req.user._id });
    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard not found or not authorized' });
    }
    res.status(200).json({
      message: 'Flashcard retrieved successfully',
      flashcard: {
        id: flashcard._id,
        collectionId: flashcard.collectionId,
        question: flashcard.question,
        answer: flashcard.answer,
        tags: flashcard.tags,
        isStarred: flashcard.isStarred,
        lastReviewed: flashcard.lastReviewed,
        createdAt: flashcard.createdAt,
        updatedAt: flashcard.updatedAt
      }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid flashcard ID' });
    }
    res.status(500).json({ message: 'Failed to retrieve flashcard', error: error.message });
  }
};

exports.updateFlashcard = async (req, res) => {
  try {
    const { collectionId, question, answer, tags, isStarred, lastReviewed } = req.body;
    const flashcard = await Flashcard.findOne({ _id: req.params.id, userId: req.user._id });
    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard not found or not authorized' });
    }

    // Verify collection exists if provided
    if (collectionId && collectionId !== flashcard.collectionId.toString()) {
      const collection = await Collection.findOne({ _id: collectionId, userId: req.user._id });
      if (!collection) {
        return res.status(404).json({ message: 'Collection not found or not authorized' });
      }
      flashcard.collectionId = collectionId;
    }

    flashcard.question = question || flashcard.question;
    flashcard.answer = answer !== undefined ? answer : flashcard.answer;
    flashcard.tags = tags !== undefined ? tags : flashcard.tags;
    flashcard.isStarred = isStarred !== undefined ? isStarred : flashcard.isStarred;
    flashcard.lastReviewed = lastReviewed !== undefined ? lastReviewed : flashcard.lastReviewed;
    await flashcard.save();

    res.status(200).json({
      message: 'Flashcard updated successfully',
      flashcard: {
        id: flashcard._id,
        collectionId: flashcard.collectionId,
        question: flashcard.question,
        answer: flashcard.answer,
        tags: flashcard.tags,
        isStarred: flashcard.isStarred,
        lastReviewed: flashcard.lastReviewed,
        createdAt: flashcard.createdAt,
        updatedAt: flashcard.updatedAt
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Invalid input', errors: messages });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid flashcard or collection ID' });
    }
    res.status(500).json({ message: 'Failed to update flashcard', error: error.message });
  }
};

exports.deleteFlashcard = async (req, res) => {
  try {
    const flashcard = await Flashcard.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard not found or not authorized' });
    }
    res.status(200).json({ message: 'Flashcard deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid flashcard ID' });
    }
    res.status(500).json({ message: 'Failed to delete flashcard', error: error.message });
  }
};