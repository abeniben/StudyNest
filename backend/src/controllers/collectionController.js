const Collection = require('../models/Collection');

exports.createCollection = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const userId = req.user._id;

    const collection = new Collection({ userId, name, description, color });
    await collection.save();

    res.status(201).json({
      message: 'Collection created successfully',
      collection: {
        id: collection._id,
        name: collection.name,
        description: collection.description,
        color: collection.color,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Invalid input', errors: messages });
    }
    res.status(500).json({ message: 'Failed to create collection', error: error.message });
  }
};

exports.getCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ userId: req.user._id });
    res.status(200).json({
      message: 'Collections retrieved successfully',
      collections: collections.map(c => ({
        id: c._id,
        name: c.name,
        description: c.description,
        color: c.color,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve collections', error: error.message });
  }
};

exports.getCollection = async (req, res) => {
  try {
    const collection = await Collection.findOne({ _id: req.params.id, userId: req.user._id });
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    res.status(200).json({
      message: 'Collection retrieved successfully',
      collection: {
        id: collection._id,
        name: collection.name,
        description: collection.description,
        color: collection.color,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt
      }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid collection ID' });
    }
    res.status(500).json({ message: 'Failed to retrieve collection', error: error.message });
  }
};

exports.updateCollection = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const collection = await Collection.findOne({ _id: req.params.id, userId: req.user._id });
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    collection.name = name || collection.name;
    collection.description = description !== undefined ? description : collection.description;
    collection.color = color || collection.color;
    await collection.save();

    res.status(200).json({
      message: 'Collection updated successfully',
      collection: {
        id: collection._id,
        name: collection.name,
        description: collection.description,
        color: collection.color,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt
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
    res.status(500).json({ message: 'Failed to update collection', error: error.message });
  }
};

exports.deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    res.status(200).json({ message: 'Collection deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid collection ID' });
    }
    res.status(500).json({ message: 'Failed to delete collection', error: error.message });
  }
};