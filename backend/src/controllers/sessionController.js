const Session = require('../models/Session');
const Collection = require('../models/Collection');
const Flashcard = require('../models/Flashcard');
const Note = require('../models/Note');

exports.createSession = async (req, res) => {
  try {
    const { collectionId, flashcardIds, noteIds, startTime, endTime, duration } = req.body;
    const userId = req.user._id;

    if (collectionId) {
      const collection = await Collection.findOne({ _id: collectionId, userId });
      if (!collection) {
        return res.status(404).json({ message: 'Collection not found or not authorized' });
      }
    }

    if (flashcardIds && flashcardIds.length > 0) {
      const flashcards = await Flashcard.find({ _id: { $in: flashcardIds }, userId });
      if (flashcards.length !== flashcardIds.length) {
        return res.status(400).json({ message: 'One or more flashcards not found or not authorized' });
      }
    }

    if (noteIds && noteIds.length > 0) {
      const notes = await Note.find({ _id: { $in: noteIds }, userId });
      if (notes.length !== noteIds.length) {
        return res.status(400).json({ message: 'One or more notes not found or not authorized' });
      }
    }

    const session = new Session({ userId, collectionId, flashcardIds, noteIds, startTime, endTime, duration });
    await session.save();

    // Update Flashcard.lastReviewed if flashcardIds provided
    if (flashcardIds && flashcardIds.length > 0) {
      await Flashcard.updateMany(
        { _id: { $in: flashcardIds }, userId },
        { lastReviewed: endTime || startTime }
      );
    }

    res.status(201).json({
      message: 'Session created successfully',
      session: {
        id: session._id,
        collectionId: session.collectionId,
        flashcardIds: session.flashcardIds,
        noteIds: session.noteIds,
        startTime: session.startTime,
        endTime: session.endTime,
        duration: session.duration,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Invalid input', errors: messages });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid collection, flashcard, or note ID' });
    }
    res.status(500).json({ message: 'Failed to create session', error: error.message });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const { collectionId } = req.query;
    const query = { userId: req.user._id };
    if (collectionId) {
      const collection = await Collection.findOne({ _id: collectionId, userId: req.user._id });
      if (!collection) {
        return res.status(404).json({ message: 'Collection not found or not authorized' });
      }
      query.collectionId = collectionId;
    }

    const sessions = await Session.find(query);
    res.status(200).json({
      message: 'Sessions retrieved successfully',
      sessions: sessions.map(s => ({
        id: s._id,
        collectionId: s.collectionId,
        flashcardIds: s.flashcardIds,
        noteIds: s.noteIds,
        startTime: s.startTime,
        endTime: s.endTime,
        duration: s.duration,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt
      }))
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid collection ID' });
    }
    res.status(500).json({ message: 'Failed to retrieve sessions', error: error.message });
  }
};

exports.getSession = async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) {
      return res.status(404).json({ message: 'Session not found or not authorized' });
    }
    res.status(200).json({
      message: 'Session retrieved successfully',
      session: {
        id: session._id,
        collectionId: session.collectionId,
        flashcardIds: session.flashcardIds,
        noteIds: session.noteIds,
        startTime: session.startTime,
        endTime: session.endTime,
        duration: session.duration,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid session ID' });
    }
    res.status(500).json({ message: 'Failed to retrieve session', error: error.message });
  }
};

exports.updateSession = async (req, res) => {
  try {
    const { collectionId, flashcardIds, noteIds, startTime, endTime, duration } = req.body;
    const session = await Session.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) {
      return res.status(404).json({ message: 'Session not found or not authorized' });
    }

    // Validate collection if provided
    if (collectionId && collectionId !== session.collectionId?.toString()) {
      const collection = await Collection.findOne({ _id: collectionId, userId: req.user._id });
      if (!collection) {
        return res.status(404).json({ message: 'Collection not found or not authorized' });
      }
      session.collectionId = collectionId;
    }

    // Validate flashcards if provided
    if (flashcardIds && flashcardIds.length > 0) {
      const flashcards = await Flashcard.find({ _id: { $in: flashcardIds }, userId: req.user._id });
      if (flashcards.length !== flashcardIds.length) {
        return res.status(400).json({ message: 'One or more flashcards not found or not authorized' });
      }
      session.flashcardIds = flashcardIds;
    }

    // Validate notes if provided
    if (noteIds && noteIds.length > 0) {
      const notes = await Note.find({ _id: { $in: noteIds }, userId: req.user._id });
      if (notes.length !== noteIds.length) {
        return res.status(400).json({ message: 'One or more notes not found or not authorized' });
      }
      session.noteIds = noteIds;
    }

    session.startTime = startTime || session.startTime;
    session.endTime = endTime !== undefined ? endTime : session.endTime;
    session.duration = duration !== undefined ? duration : session.duration;
    await session.save();

    // Update Flashcard.lastReviewed if flashcardIds provided
    if (flashcardIds && flashcardIds.length > 0) {
      await Flashcard.updateMany(
        { _id: { $in: flashcardIds }, userId: req.user._id },
        { lastReviewed: session.endTime || session.startTime }
      );
    }

    res.status(200).json({
      message: 'Session updated successfully',
      session: {
        id: session._id,
        collectionId: session.collectionId,
        flashcardIds: session.flashcardIds,
        noteIds: session.noteIds,
        startTime: session.startTime,
        endTime: session.endTime,
        duration: session.duration,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Invalid input', errors: messages });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid session, collection, flashcard, or note ID' });
    }
    res.status(500).json({ message: 'Failed to update session', error: error.message });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!session) {
      return res.status(404).json({ message: 'Session not found or not authorized' });
    }
    res.status(200).json({ message: 'Session deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid session ID' });
    }
    res.status(500).json({ message: 'Failed to delete session', error: error.message });
  }
};