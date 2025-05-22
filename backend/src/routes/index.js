const express = require('express'); 
const router = express.Router();
const authRouter = require('./auth');
const collectionRouter = require('./collections');
const noteRouter = require('./notes');
const flashcardRouter = require('./flashcards');

router.get('/', (req, res) => { 
    res.json({ message: 'Welcome to StudyNest API' }); 
});

router.use('/auth', authRouter);
router.use('/collections', collectionRouter);
router.use('/notes', noteRouter);
router.use('/flashcards', flashcardRouter);

module.exports = router;