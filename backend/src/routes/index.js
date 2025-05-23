const express = require('express'); 
const router = express.Router();
const authRouter = require('./auth');
const collectionRouter = require('./collections');
const noteRouter = require('./notes');
const flashcardRouter = require('./flashcards');
const sessionRouter = require('./sessions');

router.get('/', (req, res) => { 
    res.json({ message: 'Welcome to StudyNest API' }); 
});

router.use('/auth', authRouter);
router.use('/collections', collectionRouter);
router.use('/notes', noteRouter);
router.use('/flashcards', flashcardRouter);
router.use('/sessions', sessionRouter);

module.exports = router;