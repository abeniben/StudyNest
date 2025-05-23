const Note = require('../models/Note');
const Flashcard = require('../models/Flashcard');
const Collection = require('../models/Collection');

exports.search = async (req, res) => {
  try {
    const { q, collectionId } = req.query;
    const userId = req.user._id;

    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      return res.status(400).json({ message: 'Query parameter is required and must be a non-empty string' });
    }
    if (q.length > 50) {
      return res.status(400).json({ message: 'Query cannot exceed 50 characters' });
    }

    if (collectionId) {
      const collection = await Collection.findOne({ _id: collectionId, userId });
      if (!collection) {
        return res.status(404).json({ message: 'Collection not found or not authorized' });
      }
    }

    const query = q.trim();
    const searchRegex = new RegExp(query, 'i');

    // Search notes
    const noteQuery = {
      userId,
      ...(collectionId && { collectionId }),
      $or: [
        { title: searchRegex },
        { content: searchRegex },
        { tags: searchRegex }
      ]
    };
    const notes = await Note.find(noteQuery).limit(50).select('collectionId title content tags isPinned createdAt updatedAt');

    // Search flashcards
    const flashcardQuery = {
      userId,
      ...(collectionId && { collectionId }),
      $or: [
        { question: searchRegex },
        { answer: searchRegex },
        { tags: searchRegex }
      ]
    };
    const flashcards = await Flashcard.find(flashcardQuery).limit(50).select('collectionId question answer tags isStarred lastReviewed createdAt updatedAt');

    if (notes.length === 0 && flashcards.length === 0) {
      return res.status(404).json({ message: 'No results found' });
    }

    res.status(200).json({
      message: 'Search results retrieved successfully',
      results: {
        notes: notes.map(n => ({
          id: n._id,
          collectionId: n.collectionId,
          title: n.title,
          content: n.content,
          tags: n.tags,
          isPinned: n.isPinned,
          createdAt: n.createdAt,
          updatedAt: n.updatedAt
        })),
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
      }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid collection ID' });
    }
    res.status(500).json({ message: 'Failed to perform search', error: error.message });
  }
};