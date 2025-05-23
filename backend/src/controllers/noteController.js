const Note = require('../models/Note');
const Collection = require('../models/Collection');

exports.createNote = async (req, res) => {
  try {
    const { collectionId, title, content, tags, isPinned } = req.body;
    const userId = req.user._id;

  
    const collection = await Collection.findOne({ _id: collectionId, userId });
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found or not authorized' });
    }

    const note = new Note({ userId, collectionId, title, content, tags, isPinned });
    await note.save();

    res.status(201).json({
      message: 'Note created successfully',
      note: {
        id: note._id,
        collectionId: note.collectionId,
        title: note.title,
        content: note.content,
        tags: note.tags,
        isPinned: note.isPinned,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
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
    res.status(500).json({ message: 'Failed to create note', error: error.message });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const { collectionId } = req.query;
    if (!collectionId) {
      return res.status(400).json({ message: 'Collection ID is required' });
    }

    const collection = await Collection.findOne({ _id: collectionId, userId: req.user._id });
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found or not authorized' });
    }

    const notes = await Note.find({ userId: req.user._id, collectionId });
    res.status(200).json({
      message: 'Notes retrieved successfully',
      notes: notes.map(n => ({
        id: n._id,
        collectionId: n.collectionId,
        title: n.title,
        content: n.content,
        tags: n.tags,
        isPinned: n.isPinned,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt
      }))
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid collection ID' });
    }
    res.status(500).json({ message: 'Failed to retrieve notes', error: error.message });
  }
};

exports.getNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found or not authorized' });
    }
    res.status(200).json({
      message: 'Note retrieved successfully',
      note: {
        id: note._id,
        collectionId: note.collectionId,
        title: note.title,
        content: note.content,
        tags: note.tags,
        isPinned: note.isPinned,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid note ID' });
    }
    res.status(500).json({ message: 'Failed to retrieve note', error: error.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { collectionId, title, content, tags, isPinned } = req.body;
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found or not authorized' });
    }

    // Verify collection exists if provided
    if (collectionId && collectionId !== note.collectionId.toString()) {
      const collection = await Collection.findOne({ _id: collectionId, userId: req.user._id });
      if (!collection) {
        return res.status(404).json({ message: 'Collection not found or not authorized' });
      }
      note.collectionId = collectionId;
    }

    note.title = title || note.title;
    note.content = content !== undefined ? content : note.content;
    note.tags = tags !== undefined ? tags : note.tags;
    note.isPinned = isPinned !== undefined ? isPinned : note.isPinned;
    await note.save();

    res.status(200).json({
      message: 'Note updated successfully',
      note: {
        id: note._id,
        collectionId: note.collectionId,
        title: note.title,
        content: note.content,
        tags: note.tags,
        isPinned: note.isPinned,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Invalid input', errors: messages });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid note or collection ID' });
    }
    res.status(500).json({ message: 'Failed to update note', error: error.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found or not authorized' });
    }
    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid note ID' });
    }
    res.status(500).json({ message: 'Failed to delete note', error: error.message });
  }
};


exports.bulkDeleteNotes = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'IDs must be a non-empty array' });
    }

    const result = await Note.deleteMany({ _id: { $in: ids }, userId: req.user._id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No notes found or not authorized' });
    }

    res.status(200).json({
      message: `Deleted ${result.deletedCount} note(s) successfully`
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid note IDs' });
    }
    res.status(500).json({ message: 'Failed to delete notes', error: error.message });
  }
};