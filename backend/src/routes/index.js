const express = require('express'); 
const router = express.Router();
const authRouter = require('./auth');
const collectionRouter = require('./collections');
const noteRouter = require('./notes');

router.get('/', (req, res) => { 
    res.json({ message: 'Welcome to StudyNest API' }); 
});

router.use('/auth', authRouter);
router.use('/collections', collectionRouter);
router.use('/notes', noteRouter);

module.exports = router;